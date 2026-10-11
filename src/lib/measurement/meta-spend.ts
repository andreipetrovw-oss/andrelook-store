import "server-only";

import { getPrisma } from "@/lib/db";

const approvedProductionProjectId = "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH";
const graphApiVersion = "v26.0";

type Runtime = {
  accessToken?: string;
  adAccountId?: string;
  projectId?: string;
  vercelEnvironment?: string;
};

export type MetaInsight = {
  actions?: Array<{ action_type?: string; value?: string }>;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  date_start?: string;
  impressions?: string;
  inline_link_clicks?: string;
  outbound_clicks?: Array<{ action_type?: string; value?: string }>;
  reach?: string;
  spend?: string;
};

function optionalCount(value: string | undefined) {
  if (value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function actionCount(actions: MetaInsight["actions"], actionType: string) {
  if (actions === undefined) return null;
  const action = actions.find((item) => item.action_type === actionType);
  return optionalCount(action?.value) ?? 0;
}

export function metaSpendExternalRecordId(input: {
  accountId: string;
  adId: string;
  date: string;
}) {
  return `meta:${input.accountId}:${input.date}:${input.adId}`;
}

function runtimeDefaults(): Required<Runtime> {
  return {
    accessToken: process.env.META_MARKETING_API_ACCESS_TOKEN?.trim() ?? "",
    adAccountId: process.env.META_AD_ACCOUNT_ID?.trim() ?? "",
    projectId: process.env.VERCEL_PROJECT_ID?.trim() ?? "",
    vercelEnvironment: process.env.VERCEL_ENV?.trim() ?? "",
  };
}

export function normalizeCampaignKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 200);
}

export function metaSpendSyncAllowedForRuntime(
  runtime: Runtime = runtimeDefaults(),
) {
  const resolved = { ...runtimeDefaults(), ...runtime };
  return Boolean(
    resolved.accessToken &&
    /^\d+$/.test(resolved.adAccountId.replace(/^act_/, "")) &&
    resolved.projectId === approvedProductionProjectId &&
    resolved.vercelEnvironment === "production",
  );
}

export function normalizeMetaInsight(insight: MetaInsight) {
  const campaignName = insight.campaign_name?.trim() ?? "";
  const adId = insight.ad_id?.trim() ?? "";
  const date = insight.date_start?.trim() ?? "";
  const spend = Number.parseFloat(insight.spend ?? "");
  if (
    !campaignName ||
    !adId ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(spend) ||
    spend < 0
  ) {
    return null;
  }
  return {
    adId,
    adName: insight.ad_name
      ? normalizeCampaignKey(insight.ad_name) || null
      : null,
    adSetId: insight.adset_id?.trim() || null,
    adSetName: insight.adset_name
      ? normalizeCampaignKey(insight.adset_name) || null
      : null,
    campaignId: insight.campaign_id?.trim() || null,
    campaignName,
    date,
    impressions: optionalCount(insight.impressions),
    landingPageViews: actionCount(insight.actions, "landing_page_view"),
    linkClicks: optionalCount(insight.inline_link_clicks),
    outboundClicks: actionCount(insight.outbound_clicks, "outbound_click"),
    reach: optionalCount(insight.reach),
    spendMinor: Math.round(spend * 100),
    utmCampaign: normalizeCampaignKey(campaignName),
  };
}

export async function syncMetaSpend(input: {
  date: string;
  fetchImpl?: typeof fetch;
  runtime?: Runtime;
}) {
  const resolved = { ...runtimeDefaults(), ...input.runtime };
  if (!metaSpendSyncAllowedForRuntime(resolved)) {
    return { imported: 0, status: "disabled" as const };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("A valid UTC date is required.");
  }
  const accountId = resolved.adAccountId.replace(/^act_/, "");
  const request = input.fetchImpl ?? fetch;
  const headers = { Authorization: `Bearer ${resolved.accessToken}` };
  const accountResponse = await request(
    `https://graph.facebook.com/${graphApiVersion}/act_${accountId}?fields=currency`,
    { headers, signal: AbortSignal.timeout(8_000) },
  );
  if (!accountResponse.ok) throw new Error("Meta account lookup failed.");
  const account = (await accountResponse.json()) as { currency?: string };
  if (account.currency !== "EUR") {
    throw new Error("Meta ad account currency must be EUR.");
  }

  const params = new URLSearchParams({
    fields:
      "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,reach,inline_link_clicks,outbound_clicks,actions,date_start",
    level: "ad",
    limit: "500",
    time_range: JSON.stringify({ since: input.date, until: input.date }),
    time_increment: "1",
  });
  const response = await request(
    `https://graph.facebook.com/${graphApiVersion}/act_${accountId}/insights?${params}`,
    { headers, signal: AbortSignal.timeout(12_000) },
  );
  if (!response.ok) throw new Error("Meta Insights lookup failed.");
  const payload = (await response.json()) as { data?: MetaInsight[] };
  const records = (payload.data ?? [])
    .map(normalizeMetaInsight)
    .filter((record) => record !== null);
  const prisma = getPrisma();
  const attemptedAt = new Date();
  for (const record of records) {
    const campaign = await prisma.campaign.upsert({
      create: {
        campaignName: record.campaignName,
        externalCampaignId: record.campaignId,
        source: "META_ADS",
        utmCampaign: record.utmCampaign,
      },
      update: {
        externalCampaignId: record.campaignId,
        utmCampaign: record.utmCampaign,
      },
      where: {
        source_campaignName: {
          campaignName: record.campaignName,
          source: "META_ADS",
        },
      },
    });
    const externalRecordId = metaSpendExternalRecordId({
      accountId,
      adId: record.adId,
      date: record.date,
    });
    await prisma.adSpend.upsert({
      create: {
        adName: record.adName,
        adSetName: record.adSetName,
        campaignId: campaign.id,
        campaignName: record.utmCampaign,
        currency: "EUR",
        date: new Date(`${record.date}T00:00:00.000Z`),
        externalAdId: record.adId,
        externalAdSetId: record.adSetId,
        externalRecordId,
        impressions: record.impressions,
        importSource: "API",
        landingPageViews: record.landingPageViews,
        linkClicks: record.linkClicks,
        outboundClicks: record.outboundClicks,
        reach: record.reach,
        source: "META_ADS",
        spendMinor: record.spendMinor,
      },
      update: {
        adName: record.adName,
        adSetName: record.adSetName,
        campaignId: campaign.id,
        campaignName: record.utmCampaign,
        impressions: record.impressions,
        landingPageViews: record.landingPageViews,
        linkClicks: record.linkClicks,
        outboundClicks: record.outboundClicks,
        reach: record.reach,
        spendMinor: record.spendMinor,
      },
      where: {
        externalRecordId,
      },
    });
  }
  await prisma.analyticsDataSourceStatus.upsert({
    create: {
      lastAttemptAt: attemptedAt,
      lastImportedRows: records.length,
      lastSuccessAt: attemptedAt,
      source: "META_INSIGHTS",
      status: "READY",
    },
    update: {
      lastAttemptAt: attemptedAt,
      lastImportedRows: records.length,
      lastSuccessAt: attemptedAt,
      status: "READY",
    },
    where: { source: "META_INSIGHTS" },
  });
  return { imported: records.length, status: "ok" as const };
}

import "server-only";

import { getPrisma } from "@/lib/db";
import { calendarDay } from "@/lib/measurement/periods";
import {
  actionMetric,
  liveCampaignId,
  liveCampaignKey,
  liveSnapshotSchema,
  metricNumber,
  normalizeDeliveryMetrics,
  type DeliveryInsight,
  type LiveMetaSnapshot,
} from "./meta-metrics";

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
  const parsed = metricNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) ? parsed : null;
}

function actionCount(actions: MetaInsight["actions"], actionType: string) {
  return actionMetric(actions, actionType);
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
  const spend = metricNumber(insight.spend);
  if (
    !campaignName ||
    !adId ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    spend === null ||
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

export async function syncMetaSpend(
  input: {
    date?: string;
    fetchImpl?: typeof fetch;
    runtime?: Runtime;
  } = {},
) {
  const resolved = { ...runtimeDefaults(), ...input.runtime };
  if (!metaSpendSyncAllowedForRuntime(resolved)) {
    return { imported: 0, status: "disabled" as const };
  }
  if (input.date) calendarDay(input.date);
  const accountId = resolved.adAccountId.replace(/^act_/, "");
  if (accountId !== "1410676904553483")
    throw new Error("Unexpected Meta account.");
  const prisma = getPrisma();
  const attemptedAt = new Date();
  await prisma.analyticsDataSourceStatus.upsert({
    where: { source: "META_INSIGHTS" },
    update: {},
    create: {
      source: "META_INSIGHTS",
      status: "UNAVAILABLE",
      lastAttemptAt: new Date(0),
    },
  });
  const lease = await prisma.analyticsDataSourceStatus.updateMany({
    where: {
      source: "META_INSIGHTS",
      OR: [
        {
          status: { not: "RUNNING" },
          lastAttemptAt: { lt: new Date(attemptedAt.getTime() - 60_000) },
        },
        { lastAttemptAt: { lt: new Date(attemptedAt.getTime() - 300_000) } },
      ],
    },
    data: { status: "RUNNING", lastAttemptAt: attemptedAt },
  });
  if (!lease.count) return { imported: 0, status: "throttled" as const };
  try {
    const request = input.fetchImpl ?? fetch;
    const headers = { Authorization: `Bearer ${resolved.accessToken}` };
    const get = async <T>(
      path: string,
      params: Record<string, string> = {},
    ): Promise<T> => {
      const response = await request(
        `https://graph.facebook.com/${graphApiVersion}/${path}?${new URLSearchParams(params)}`,
        {
          headers,
          signal: AbortSignal.timeout(12_000),
          cache: "no-store",
        },
      );
      if (!response.ok) throw new Error("Meta API request failed.");
      return (await response.json()) as T;
    };
    const list = async <T>(
      path: string,
      params: Record<string, string>,
    ): Promise<T[]> => {
      const rows: T[] = [];
      let after: string | undefined;
      for (let page = 0; page < 20; page++) {
        const result = await get<{
          data?: T[];
          paging?: { next?: string; cursors?: { after?: string } };
        }>(path, { ...params, limit: "100", ...(after ? { after } : {}) });
        if (!Array.isArray(result.data))
          throw new Error("Invalid Meta response.");
        rows.push(...result.data);
        if (!result.paging?.next) return rows;
        after = result.paging.cursors?.after;
        if (!after) throw new Error("Incomplete Meta pagination.");
      }
      throw new Error("Meta page limit reached.");
    };
    const account = await get<{ currency?: string; timezone_name?: string }>(
      `act_${accountId}`,
      { fields: "currency,timezone_name" },
    );
    if (account.currency !== "EUR") {
      throw new Error("Meta ad account currency must be EUR.");
    }
    if (!account.timezone_name)
      throw new Error("Meta account timezone unavailable.");
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: account.timezone_name,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(attemptedAt);
    const campaignData = await get<{
      id: string;
      name: string;
      effective_status: string;
      lifetime_budget?: string;
      start_time?: string;
      stop_time?: string;
    }>(liveCampaignId, {
      fields: "id,name,effective_status,lifetime_budget,start_time,stop_time",
    });
    if (
      campaignData.id !== liveCampaignId ||
      normalizeCampaignKey(campaignData.name) !== liveCampaignKey
    )
      throw new Error("Unexpected Meta campaign.");
    const [sets, ads] = await Promise.all([
      list<{
        id: string;
        name: string;
        lifetime_budget?: string;
        start_time?: string;
        end_time?: string;
      }>(`${liveCampaignId}/adsets`, {
        fields: "id,name,lifetime_budget,start_time,end_time",
      }),
      list<{
        id: string;
        name: string;
        adset_id: string;
        effective_status: string;
      }>(`${liveCampaignId}/ads`, {
        fields: "id,name,adset_id,effective_status",
      }),
    ]);
    const startTime =
      campaignData.start_time ??
      sets
        .map((s) => s.start_time)
        .filter((s): s is string => Boolean(s))
        .sort()[0] ??
      null;
    const endTime =
      campaignData.stop_time ??
      sets
        .map((s) => s.end_time)
        .filter((s): s is string => Boolean(s))
        .sort()
        .at(-1) ??
      null;
    if (!startTime || !Number.isFinite(Date.parse(startTime)))
      throw new Error("Meta campaign start unavailable.");
    const from = new Intl.DateTimeFormat("en-CA", {
      timeZone: account.timezone_name,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(startTime));
    const through = input.date ?? today;
    const baseFields =
      "spend,impressions,reach,frequency,inline_link_clicks,outbound_clicks,actions";
    const videoFields =
      ",video_play_actions,video_avg_time_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions";
    const range = JSON.stringify({ since: from, until: through });
    const [campaignMetrics, adMetrics, daily] = await Promise.all([
      list<DeliveryInsight>(`${liveCampaignId}/insights`, {
        fields: baseFields + videoFields,
        level: "campaign",
        time_range: range,
      }),
      list<DeliveryInsight & { ad_id: string }>(`${liveCampaignId}/insights`, {
        fields: "ad_id," + baseFields + videoFields,
        level: "ad",
        time_range: range,
      }),
      list<MetaInsight>(`${liveCampaignId}/insights`, {
        fields:
          "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name," +
          baseFields +
          ",date_start",
        level: "ad",
        time_range: JSON.stringify({
          since:
            input.date ??
            (calendarDay(through, -3) < from ? from : calendarDay(through, -3)),
          until: through,
        }),
        time_increment: "1",
      }),
    ]);
    const snapshot: LiveMetaSnapshot = {
      version: 1,
      accountTimezone: account.timezone_name,
      campaignId: liveCampaignId,
      campaignName: campaignData.name,
      utmCampaign: liveCampaignKey,
      status: campaignData.effective_status,
      lifetimeBudgetMinor:
        metricNumber(campaignData.lifetime_budget) ??
        (sets.length &&
        sets.every((set) => metricNumber(set.lifetime_budget) !== null)
          ? sets.reduce(
              (total, set) => total + metricNumber(set.lifetime_budget)!,
              0,
            )
          : null),
      startTime,
      endTime,
      from,
      through,
      fetchedAt: attemptedAt.toISOString(),
      metrics: normalizeDeliveryMetrics(campaignMetrics[0]),
      ads: ads.map((ad) => {
        const set = sets.find((s) => s.id === ad.adset_id);
        if (!set) throw new Error("Incomplete Meta hierarchy.");
        return {
          id: ad.id,
          name: ad.name,
          adSetId: set.id,
          adSetName: set.name,
          status: ad.effective_status,
          utmAd: normalizeCampaignKey(ad.name),
          utmAdSet: normalizeCampaignKey(set.name),
          metrics: normalizeDeliveryMetrics(
            adMetrics.find((m) => m.ad_id === ad.id),
          ),
        };
      }),
    };
    // Reject malformed metadata before starting the atomic database update.
    liveSnapshotSchema.parse(snapshot);
    const records = daily
      .map(normalizeMetaInsight)
      .filter((record) => record !== null);
    if (records.length !== daily.length)
      throw new Error("Invalid Meta daily rows.");
    if (
      records.some(
        (r) =>
          r.campaignId !== liveCampaignId ||
          !ads.some((ad) => ad.id === r.adId && ad.adset_id === r.adSetId),
      )
    )
      throw new Error("Unexpected Meta daily hierarchy.");
    await prisma.$transaction(async (tx) => {
      const existing = await tx.campaign.findFirst({
        where: { source: "META_ADS", externalCampaignId: liveCampaignId },
        select: { id: true },
      });
      const campaignValues = {
        externalCampaignId: liveCampaignId,
        utmCampaign: liveCampaignKey,
        metaSnapshot: JSON.parse(JSON.stringify(snapshot)),
        metaSyncedAt: attemptedAt,
        startDate: new Date(startTime),
        endDate: endTime ? new Date(endTime) : null,
      };
      const campaign = existing
        ? await tx.campaign.update({
            where: { id: existing.id },
            data: campaignValues,
          })
        : await tx.campaign.upsert({
            where: {
              source_campaignName: {
                source: "META_ADS",
                campaignName: campaignData.name,
              },
            },
            create: {
              source: "META_ADS",
              campaignName: campaignData.name,
              ...campaignValues,
            },
            update: campaignValues,
          });
      for (const record of records) {
        const externalRecordId = metaSpendExternalRecordId({
          accountId,
          adId: record.adId,
          date: record.date,
        });
        await tx.adSpend.upsert({
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
      await tx.analyticsDataSourceStatus.upsert({
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
    });
    return { imported: records.length, status: "ok" as const };
  } catch {
    await prisma.analyticsDataSourceStatus.update({
      where: { source: "META_INSIGHTS" },
      data: { lastAttemptAt: attemptedAt, status: "ERROR" },
    });
    throw new Error("Meta synchronization failed. Last good data retained.");
  }
}

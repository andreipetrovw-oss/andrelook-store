import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn() }));

import {
  metaSpendExternalRecordId,
  metaSpendSyncAllowedForRuntime,
  normalizeCampaignKey,
  normalizeMetaInsight,
} from "./meta-spend";

describe("Meta spend synchronization", () => {
  it("is fail-closed outside the exact production project", () => {
    expect(
      metaSpendSyncAllowedForRuntime({
        accessToken: "secret",
        adAccountId: "act_123456",
        projectId: "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH",
        vercelEnvironment: "production",
      }),
    ).toBe(true);
    expect(
      metaSpendSyncAllowedForRuntime({
        accessToken: "secret",
        adAccountId: "123456",
        projectId: "prj_staging",
        vercelEnvironment: "preview",
      }),
    ).toBe(false);
  });

  it("normalizes the planned campaign to the G2 UTM key", () => {
    expect(normalizeCampaignKey("EE_META_CONV_WINTER_2026")).toBe(
      "ee_meta_conv_winter_2026",
    );
  });

  it("accepts only complete daily EUR-ready insight rows", () => {
    expect(
      normalizeMetaInsight({
        ad_id: "300",
        ad_name: "MAYA_VIDEO_01",
        adset_id: "200",
        adset_name: "EE_MEN_CORE",
        campaign_id: "100",
        campaign_name: "EE_META_CONV_WINTER_2026",
        date_start: "2026-10-10",
        impressions: "1000",
        inline_link_clicks: "40",
        outbound_clicks: [{ action_type: "outbound_click", value: "35" }],
        reach: "800",
        spend: "3.10",
        actions: [{ action_type: "landing_page_view", value: "29" }],
      }),
    ).toEqual({
      adId: "300",
      adName: "maya_video_01",
      adSetId: "200",
      adSetName: "ee_men_core",
      campaignId: "100",
      campaignName: "EE_META_CONV_WINTER_2026",
      date: "2026-10-10",
      impressions: 1000,
      landingPageViews: 29,
      linkClicks: 40,
      outboundClicks: 35,
      reach: 800,
      spendMinor: 310,
      utmCampaign: "ee_meta_conv_winter_2026",
    });
    expect(normalizeMetaInsight({ spend: "not-a-number" })).toBeNull();
  });

  it("keeps unavailable historical insight metrics null and builds a stable idempotency key", () => {
    expect(
      normalizeMetaInsight({
        ad_id: "300",
        campaign_name: "Campaign",
        date_start: "2026-10-10",
        spend: "0",
      }),
    ).toMatchObject({
      impressions: null,
      landingPageViews: null,
      linkClicks: null,
      outboundClicks: null,
      reach: null,
    });
    expect(
      metaSpendExternalRecordId({
        accountId: "1410676904553483",
        adId: "300",
        date: "2026-10-10",
      }),
    ).toBe("meta:1410676904553483:2026-10-10:300");
  });
});

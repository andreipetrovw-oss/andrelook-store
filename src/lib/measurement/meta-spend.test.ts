import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn() }));

import {
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
        spend: "3.10",
      }),
    ).toEqual({
      adId: "300",
      adName: "maya_video_01",
      adSetId: "200",
      adSetName: "ee_men_core",
      campaignId: "100",
      campaignName: "EE_META_CONV_WINTER_2026",
      date: "2026-10-10",
      spendMinor: 310,
      utmCampaign: "ee_meta_conv_winter_2026",
    });
    expect(normalizeMetaInsight({ spend: "not-a-number" })).toBeNull();
  });
});

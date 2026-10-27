import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn() }));
import { getPrisma } from "@/lib/db";
import { syncMetaSpend } from "./meta-spend";
import {
  liveCampaignId,
  normalizeDeliveryMetrics,
  unitCost,
  metricNumber,
  type LiveMetaSnapshot,
} from "./meta-metrics";
import { syncAuthorized } from "./meta-sync-auth";

const runtime = {
  accessToken: "test-not-real-token",
  adAccountId: "1410676904553483",
  projectId: "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH",
  vercelEnvironment: "production",
};
function fixture({
  fail = false,
  empty = false,
  paginate = false,
  adSetBudget = false,
} = {}) {
  const stored = new Map<string, unknown>();
  const campaign = {
    findFirst: vi.fn().mockResolvedValue({ id: "existing-campaign" }),
    update: vi.fn(
      async (args: {
        where: { id: string };
        data: { metaSnapshot: LiveMetaSnapshot };
      }) => ({ id: args.where.id }),
    ),
    upsert: vi.fn().mockResolvedValue({ id: "existing-campaign" }),
  };
  const status = {
    upsert: vi.fn(),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn(),
  };
  const spend = {
    upsert: vi.fn(async (args: { where: { externalRecordId: string } }) =>
      stored.set(args.where.externalRecordId, args),
    ),
  };
  const tx = { campaign, adSpend: spend, analyticsDataSourceStatus: status };
  const db = {
    ...tx,
    $transaction: vi.fn(async (run: (t: typeof tx) => unknown) => run(tx)),
  };
  vi.mocked(getPrisma).mockReturnValue(
    db as unknown as ReturnType<typeof getPrisma>,
  );
  const requests: string[] = [];
  const fetchImpl = vi.fn(
    async (url: URL | RequestInfo, init?: RequestInit) => {
      const u = new URL(String(url));
      requests.push(u.toString());
      expect(init?.method).toBeUndefined();
      expect(u.searchParams.has("access_token")).toBe(false);
      if (fail)
        return new Response(
          JSON.stringify({ error: { message: runtime.accessToken } }),
          { status: 403 },
        );
      const path = u.pathname.replace("/v26.0/", "");
      let result: unknown;
      if (path.startsWith("act_"))
        result = { currency: "EUR", timezone_name: "Europe/Tallinn" };
      else if (path === liveCampaignId)
        result = {
          id: liveCampaignId,
          name: "winter_vezere_30d_test01",
          effective_status: "ACTIVE",
          ...(adSetBudget ? {} : { lifetime_budget: "10000" }),
          start_time: "2026-10-27T02:00:00+0200",
          stop_time: "2026-11-26T02:00:00+0200",
        };
      else if (path.endsWith("/adsets"))
        result = {
          data: [
            {
              id: "set-real-id",
              name: "EE | Broad | Website Conversion | Vezere",
              lifetime_budget: "10000",
            },
          ],
        };
      else if (path.endsWith("/ads"))
        result = {
          data: [
            {
              id: "ad-real-id",
              name: "Vezere Reel | Music | V1",
              adset_id: "set-real-id",
              effective_status: "ACTIVE",
            },
          ],
        };
      else if (u.searchParams.has("time_increment"))
        result = {
          data: empty
            ? []
            : [
                {
                  campaign_id: liveCampaignId,
                  campaign_name: "winter_vezere_30d_test01",
                  adset_id: "set-real-id",
                  adset_name: "EE | Broad | Website Conversion | Vezere",
                  ad_id: "ad-real-id",
                  ad_name: "Vezere Reel | Music | V1",
                  date_start: "2026-10-27",
                  spend: "0.50",
                  impressions: "25",
                  reach: "20",
                },
              ],
          ...(paginate && !u.searchParams.has("after")
            ? {
                paging: {
                  next: "https://untrusted.invalid/?access_token=DO_NOT_USE",
                  cursors: { after: "cursor" },
                },
              }
            : {}),
        };
      else
        result = {
          data: empty
            ? []
            : [
                {
                  ad_id: "ad-real-id",
                  spend: "0.50",
                  impressions: "25",
                  reach: "20",
                  frequency: "1.25",
                  inline_link_clicks: "2",
                  video_play_actions: [
                    { action_type: "video_view", value: "15" },
                  ],
                },
              ],
        };
      return new Response(JSON.stringify(result));
    },
  ) as typeof fetch;
  return { db, campaign, status, spend, stored, fetchImpl, requests };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("live Meta import", () => {
  it("uses verified ad-set lifetime budget when campaign budget is absent", async () => {
    const f = fixture({ adSetBudget: true });
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    expect(
      f.campaign.update.mock.calls[0]![0].data.metaSnapshot.lifetimeBudgetMinor,
    ).toBe(10000);
  });
  it("discovers the stable campaign/adset/ad before spend and imports today; retry upserts rather than adds", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T16:00:00Z"));
    const f = fixture();
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    expect(f.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "existing-campaign" } }),
    );
    expect(f.stored.size).toBe(1);
    const data = f.campaign.update.mock.calls[0]![0].data;
    expect(data.metaSnapshot.through).toBe("2026-10-27");
    expect(data.metaSnapshot.ads[0]).toMatchObject({
      id: "ad-real-id",
      adSetId: "set-real-id",
      utmAd: "vezere_reel_music_v1",
      utmAdSet: "ee_broad_website_conversion_vezere",
    });
    expect(data.metaSnapshot.metrics.reach).toBe(20);
    expect(f.requests.some((r) => r.includes("until%22%3A%222026-10-27"))).toBe(
      true,
    );
    expect(
      Object.keys(f.db).some((k) => /order|payment|customer/i.test(k)),
    ).toBe(false);
  });
  it("discovers a preparing campaign without fabricating zero metrics or spend", async () => {
    const f = fixture({ empty: true });
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    expect(f.spend.upsert).not.toHaveBeenCalled();
    expect(
      f.campaign.update.mock.calls[0]![0].data.metaSnapshot.metrics.spendMinor,
    ).toBeNull();
  });
  it("retains last-good data after API failure, exposes no token, marks error", async () => {
    const f = fixture({ fail: true });
    await expect(
      syncMetaSpend({ runtime, fetchImpl: f.fetchImpl }),
    ).rejects.toThrow("Last good data retained");
    expect(f.db.$transaction).not.toHaveBeenCalled();
    expect(f.spend.upsert).not.toHaveBeenCalled();
    expect(f.status.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ERROR" }),
      }),
    );
  });
  it("paginates using cursors on the fixed official host, never provider next URLs", async () => {
    const f = fixture({ paginate: true });
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    expect(f.requests.some((r) => r.includes("after=cursor"))).toBe(true);
    expect(
      f.requests.every((r) => new URL(r).hostname === "graph.facebook.com"),
    ).toBe(true);
    expect(f.stored.size).toBe(1);
  });
  it("blocks staging before database or provider access", async () => {
    const f = fixture();
    expect(
      await syncMetaSpend({
        runtime: { ...runtime, vercelEnvironment: "preview" },
        fetchImpl: f.fetchImpl,
      }),
    ).toEqual({ status: "disabled", imported: 0 });
    expect(f.fetchImpl).not.toHaveBeenCalled();
    expect(f.status.upsert).not.toHaveBeenCalled();
  });
  it("throttles overlapping/manual repeats without provider calls", async () => {
    const f = fixture();
    f.status.updateMany.mockResolvedValue({ count: 0 });
    expect(
      (await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl })).status,
    ).toBe("throttled");
    expect(f.fetchImpl).not.toHaveBeenCalled();
  });
  it("uses account-calendar current day across Tallinn DST boundaries", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T23:30:00Z"));
    const f = fixture();
    await syncMetaSpend({ runtime, fetchImpl: f.fetchImpl });
    expect(f.campaign.update.mock.calls[0]![0].data.metaSnapshot.through).toBe(
      "2026-10-28",
    );
  });
});
describe("metric semantics and trigger isolation", () => {
  it("keeps unavailable values null, real zero zero, and denominators finite", () => {
    expect(
      Object.values(normalizeDeliveryMetrics()).every((v) => v === null),
    ).toBe(true);
    expect(
      normalizeDeliveryMetrics({
        spend: "0",
        impressions: "0",
        inline_link_clicks: "0",
      }),
    ).toMatchObject({
      spendMinor: 0,
      impressions: 0,
      ctr: null,
      cpcMinor: null,
    });
    expect(unitCost(50, 0)).toBeNull();
    expect(unitCost(null, 4)).toBeNull();
    expect(unitCost(0, 2)).toBe(0);
    expect(metricNumber("3invalid")).toBeNull();
    expect(metricNumber("-1")).toBeNull();
  });
  it("parses watch seconds/percentiles and does not sum overlapping Meta Lead action types", () => {
    const v = (value: string) => [{ action_type: "video_view", value }];
    expect(
      normalizeDeliveryMetrics({
        spend: "4",
        impressions: "200",
        inline_link_clicks: "10",
        video_play_actions: v("100"),
        video_avg_time_watched_actions: v("4.5"),
        video_p100_watched_actions: v("20"),
        video_p25_watched_actions: v("60"),
        actions: [
          { action_type: "lead", value: "1" },
          { action_type: "offsite_conversion.fb_pixel_lead", value: "1" },
        ],
      }),
    ).toMatchObject({
      ctr: 5,
      cpcMinor: 40,
      cpmMinor: 2000,
      videoPlays: 100,
      averageWatchSeconds: 4.5,
      completionRate: 20,
      watched25: 60,
      metaLeads: 1,
    });
  });
  it("allows only the separate trigger or existing cron secret, not a Meta token", () => {
    vi.stubEnv("CRON_SECRET", "cron-abcdefghijklmnop");
    vi.stubEnv("META_SYNC_TRIGGER_SECRET", "trigger-abcdefghijklmnop");
    expect(syncAuthorized("Bearer trigger-abcdefghijklmnop")).toBe(true);
    expect(syncAuthorized("Bearer cron-abcdefghijklmnop")).toBe(true);
    expect(syncAuthorized("Bearer " + runtime.accessToken)).toBe(false);
    expect(syncAuthorized(null)).toBe(false);
  });
});

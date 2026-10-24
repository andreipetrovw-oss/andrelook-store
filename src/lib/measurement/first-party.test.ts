import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn() }));

import { getPrisma } from "@/lib/db";

import {
  firstPartyAnalyticsAllowedForRuntime,
  recordFirstPartyAnalyticsEvent,
} from "./first-party";

describe("first-party analytics isolation", () => {
  it("allows explicit staging first-party UAT only, never another preview project", () => {
    vi.stubEnv("NEXT_PUBLIC_STAGING_ANALYTICS_ENABLED", "true");
    const host =
      "andrelook-v1-staging-uat-andreys-projects-a106cf89.vercel.app";
    const req = new Request(`https://${host}/api/analytics/events`, {
      headers: { host, origin: `https://${host}` },
    });
    expect(
      firstPartyAnalyticsAllowedForRuntime(req, {
        projectId: "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m",
        vercelEnvironment: "preview",
      }),
    ).toBe(true);
    expect(
      firstPartyAnalyticsAllowedForRuntime(req, {
        projectId: "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH",
        vercelEnvironment: "preview",
      }),
    ).toBe(false);
    vi.unstubAllEnvs();
  });
  const production = {
    projectId: "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH",
    vercelEnvironment: "production",
  };

  it("allows only the production project and approved public hosts", () => {
    expect(
      firstPartyAnalyticsAllowedForRuntime(
        new Request("https://www.andrelook.store/api/analytics/events", {
          headers: {
            host: "www.andrelook.store",
            origin: "https://www.andrelook.store",
          },
        }),
        production,
      ),
    ).toBe(true);
    expect(
      firstPartyAnalyticsAllowedForRuntime(
        new Request("https://preview.vercel.app/api/analytics/events", {
          headers: { host: "preview.vercel.app" },
        }),
        { ...production, vercelEnvironment: "preview" },
      ),
    ).toBe(false);
    expect(
      firstPartyAnalyticsAllowedForRuntime(
        new Request("https://crm.andrelook.store/api/analytics/events", {
          headers: { host: "crm.andrelook.store" },
        }),
        production,
      ),
    ).toBe(false);
  });

  it("stores an anonymous event idempotently and drops an unknown product relation", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    vi.mocked(getPrisma).mockReturnValue({
      analyticsEvent: { upsert },
      product: { findUnique: vi.fn().mockResolvedValue(null) },
    } as never);
    await recordFirstPartyAnalyticsEvent({
      adName: null,
      adSetName: null,
      campaignName: null,
      contentLabel: null,
      eventId: "11111111-1111-4111-8111-111111111111",
      eventName: "VIEW_ITEM",
      landingPage: "/et",
      locale: "ET",
      pagePath: "/et/catalog/test",
      productId: "unknown-product",
      sessionId: "22222222-2222-4222-8222-222222222222",
      source: "DIRECT",
      sourceGroup: "DIRECT",
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ productId: null }),
        update: {},
        where: { eventId: "11111111-1111-4111-8111-111111111111" },
      }),
    );
  });
});

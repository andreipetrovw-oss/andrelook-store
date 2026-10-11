import { describe, expect, it } from "vitest";

import {
  buildAdvertisingRows,
  buildLandingPerformance,
  buildProductPerformance,
  conversionRate,
} from "./reporting";

describe("advertising reporting", () => {
  it("deduplicates paid events and calculates business metrics", () => {
    const event = {
      amountMinor: 20_000,
      eventKey: "payment:one",
      eventType: "PAID",
      occurredAt: new Date("2026-10-05T12:00:00Z"),
    };
    const rows = buildAdvertisingRows({
      from: new Date("2026-10-01T00:00:00Z"),
      orders: [
        {
          displayNumber: "AL-REAL",
          events: [event, event],
          items: [
            {
              paymentRateBpsSnapshot: 300,
              quantity: 1,
              unitLandedCostMinorSnapshot: 8_000,
              unitPriceMinor: 20_000,
            },
          ],
          orderDate: new Date("2026-10-04T12:00:00Z"),
          payments: [{ kind: "FULL", processorFeeMinor: 600 }],
          status: "PAID",
          touch: {
            campaignName: "Autumn",
            source: "META_ADS",
            sourceGroup: "PAID",
          },
        },
      ],
      spend: [
        {
          campaignName: "Autumn",
          date: new Date("2026-10-04T00:00:00Z"),
          source: "META_ADS",
          spendMinor: 5_000,
        },
      ],
      to: new Date("2026-11-01T00:00:00Z"),
    });
    expect(rows).toEqual([
      expect.objectContaining({
        confirmed: 1,
        contributionAfterAdsMinor: 6_400,
        contributionBeforeAdsMinor: 11_400,
        costPerCustomerMinor: 5_000,
        costPerLeadMinor: 5_000,
        leads: 1,
        paid: 1,
        paymentCostEstimated: false,
        revenueMinor: 20_000,
        roas: 4,
        spendMinor: 5_000,
      }),
    ]);
  });

  it("shows no artificial cost or ROAS for organic traffic", () => {
    const [row] = buildAdvertisingRows({
      from: new Date("2026-10-01T00:00:00Z"),
      orders: [
        {
          displayNumber: "AL-ORGANIC",
          events: [],
          orderDate: new Date("2026-10-04T12:00:00Z"),
          status: "NEW",
          touch: {
            campaignName: null,
            source: "GOOGLE_ORGANIC",
            sourceGroup: "ORGANIC",
          },
        },
      ],
      spend: [],
      to: new Date("2026-11-01T00:00:00Z"),
    });
    expect(row).toMatchObject({
      costPerCustomerMinor: null,
      costPerLeadMinor: null,
      roas: null,
      spendMinor: 0,
    });
  });

  it("keeps campaign, ad set and ad rows separate", () => {
    const rows = buildAdvertisingRows({
      from: new Date("2026-10-01T00:00:00Z"),
      orders: [],
      spend: [
        {
          adName: "maya_video_01",
          adSetName: "ee_men_core",
          campaignName: "ee_meta_conv_winter_2026",
          date: new Date("2026-10-10T00:00:00Z"),
          source: "META_ADS",
          spendMinor: 300,
        },
        {
          adName: "tyrik_video_01",
          adSetName: "ee_men_core",
          campaignName: "ee_meta_conv_winter_2026",
          date: new Date("2026-10-10T00:00:00Z"),
          source: "META_ADS",
          spendMinor: 250,
        },
      ],
      to: new Date("2026-11-01T00:00:00Z"),
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.ad)).toEqual([
      "maya_video_01",
      "tyrik_video_01",
    ]);
  });

  it("aggregates attributed top-funnel and first-party website events without double counting product views", () => {
    const [row] = buildAdvertisingRows({
      events: [
        {
          adName: "maya_video_01",
          adSetName: "ee_men_23_44",
          campaignName: "winter",
          eventName: "PAGE_VIEW",
          landingPage: "/et",
          occurredAt: new Date("2026-10-10T10:00:00Z"),
          productId: null,
          sessionId: "session-one",
          source: "META_ADS",
        },
        {
          adName: "maya_video_01",
          adSetName: "ee_men_23_44",
          campaignName: "winter",
          eventName: "VIEW_ITEM",
          landingPage: "/et",
          occurredAt: new Date("2026-10-10T10:01:00Z"),
          productId: "maya",
          sessionId: "session-one",
          source: "META_ADS",
        },
        {
          adName: "maya_video_01",
          adSetName: "ee_men_23_44",
          campaignName: "winter",
          eventName: "VIEW_ITEM",
          landingPage: "/et",
          occurredAt: new Date("2026-10-10T10:02:00Z"),
          productId: "maya",
          sessionId: "session-one",
          source: "META_ADS",
        },
        {
          adName: "maya_video_01",
          adSetName: "ee_men_23_44",
          campaignName: "winter",
          eventName: "PREORDER_OPEN",
          landingPage: "/et",
          occurredAt: new Date("2026-10-10T10:03:00Z"),
          productId: "maya",
          sessionId: "session-one",
          source: "META_ADS",
        },
      ],
      from: new Date("2026-10-01T00:00:00Z"),
      orders: [],
      spend: [
        {
          adName: "maya_video_01",
          adSetName: "ee_men_23_44",
          campaignName: "winter",
          date: new Date("2026-10-10T00:00:00Z"),
          impressions: 1000,
          landingPageViews: 30,
          linkClicks: 40,
          outboundClicks: 35,
          reach: 800,
          source: "META_ADS",
          spendMinor: 700,
        },
      ],
      to: new Date("2026-11-01T00:00:00Z"),
    });
    expect(row).toMatchObject({
      clicks: 35,
      cpcMinor: 20,
      cpmMinor: 700,
      ctr: 3.5,
      frequency: 1.25,
      impressions: 1000,
      landingPageViews: 30,
      preorderOpens: 1,
      productViews: 1,
      reach: 800,
      siteVisits: 1,
    });
  });

  it("builds landing and product performance only from evidenced dimensions", () => {
    const input = {
      events: [
        {
          adName: null,
          adSetName: null,
          campaignName: null,
          eventName: "VIEW_ITEM",
          landingPage: "/et/catalog/warm-jackets",
          occurredAt: new Date("2026-10-10T10:00:00Z"),
          productId: "maya",
          productName: "Moncler Maya",
          sessionId: "session-one",
          source: "GOOGLE_ORGANIC" as const,
        },
      ],
      from: new Date("2026-10-01T00:00:00Z"),
      orders: [
        {
          displayNumber: "AL-REAL",
          events: [
            {
              amountMinor: 25_900,
              eventKey: "paid:one",
              eventType: "PAID",
              occurredAt: new Date("2026-10-11T10:00:00Z"),
            },
          ],
          items: [
            {
              paymentRateBpsSnapshot: 300,
              productId: "maya",
              productName: "Moncler Maya",
              quantity: 1,
              unitLandedCostMinorSnapshot: 10_000,
              unitPriceMinor: 25_900,
            },
          ],
          orderDate: new Date("2026-10-10T12:00:00Z"),
          status: "PAID",
          touch: {
            campaignName: null,
            landingPage: "/et/catalog/warm-jackets",
            source: "GOOGLE_ORGANIC" as const,
            sourceGroup: "ORGANIC" as const,
          },
        },
      ],
      to: new Date("2026-11-01T00:00:00Z"),
    };
    expect(buildLandingPerformance(input)).toEqual([
      expect.objectContaining({
        landingPage: "/et/catalog/warm-jackets",
        leads: 1,
        paid: 1,
        revenueMinor: 25_900,
        visits: 1,
      }),
    ]);
    expect(buildProductPerformance(input)).toEqual([
      expect.objectContaining({
        leads: 1,
        paid: 1,
        productId: "maya",
        productName: "Moncler Maya",
        productViews: 1,
        revenueMinor: 25_900,
      }),
    ]);
  });

  it("returns unavailable rates when the denominator is zero", () => {
    expect(conversionRate(0, 0)).toBeNull();
    expect(conversionRate(1, null)).toBeNull();
  });
});

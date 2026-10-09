import { describe, expect, it } from "vitest";

import { buildAdvertisingRows } from "./reporting";

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
          orderDate: new Date("2026-10-04T12:00:00Z"),
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
        costPerCustomerMinor: 5_000,
        costPerLeadMinor: 5_000,
        leads: 1,
        paid: 1,
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
});

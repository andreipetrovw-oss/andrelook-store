import { describe, it, expect } from "vitest";
import {
  businessSummary,
  websiteSummary,
  websiteBreakdowns,
  type BusinessOrder,
} from "./correctness";
import { reportingPeriod } from "./periods";
const from = new Date("2026-10-01T00:00Z"),
  to = new Date("2026-11-01T00:00Z");
function order(overrides: Partial<BusinessOrder> = {}): BusinessOrder {
  return {
    displayNumber: "REAL",
    createdAt: new Date("2026-10-10T12:00Z"),
    status: "NEW",
    currency: "EUR",
    agreedTotalMinor: null,
    confirmedTotalMinor: 21900,
    items: [{ quantity: 1, unitPriceMinor: 21900 }],
    statusHistory: [],
    payments: [],
    attribution: null,
    ...overrides,
  };
}
function payment(
  amountMinor: number,
  overrides: Partial<BusinessOrder["payments"][number]> = {},
): BusinessOrder["payments"][number] {
  return {
    amountMinor,
    kind: "DEPOSIT",
    status: "ACTIVE",
    currency: "EUR",
    receivedAt: new Date("2026-10-15T12:00Z"),
    ...overrides,
  };
}
describe("created-order cohort and ledger truth", () => {
  it("keeps cancelled leads and durable attainment in the same cohort", () => {
    const result = businessSummary(
      [
        order({
          status: "CANCELLED",
          statusHistory: [
            { toStatus: "CONFIRMED", createdAt: from },
            { toStatus: "PAID", createdAt: from },
          ],
        }),
        order({ status: "DELIVERED", payments: [payment(21900)] }),
        order({ status: "CONFIRMED", createdAt: new Date("2026-09-01") }),
      ],
      from,
      to,
    );
    expect(result).toMatchObject({
      leads: 2,
      contacted: 2,
      confirmed: 2,
      fullyPaid: 2,
      delivered: 1,
      cancelled: 1,
      cancellationRate: 50,
      paidToDelivered: 50,
    });
  });
  it("counts partial cash immediately by payment date, excludes voids, subtracts refunds and preserves cancelled cash warning", () => {
    const cancelled = order({
      displayNumber: "AL-20261015-3CD146",
      status: "CANCELLED",
      payments: [payment(48000)],
    });
    const result = businessSummary(
      [
        order({
          status: "DELIVERED",
          agreedTotalMinor: 20000,
          payments: [
            payment(7000),
            payment(500, { kind: "REFUND" }),
            payment(50000, { status: "VOIDED" }),
            payment(2000, { currency: "USD" }),
          ],
        }),
        cancelled,
        order({ createdAt: new Date("2026-09-01"), payments: [payment(1000)] }),
      ],
      from,
      to,
    );
    expect(result).toMatchObject({
      leads: 2,
      cashReceivedMinor: 55500,
      outstandingMinor: 13500,
      orderValueMinor: 20000,
      deliveredValueMinor: 20000,
      cancelledPayments: [
        { reference: "AL-20261015-3CD146", amountMinor: 48000 },
      ],
    });
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.payments[0]!.amountMinor).toBe(48000);
  });
  it("excludes only exact test IDs and handles zero denominators", () => {
    const result = businessSummary(
      [
        order({
          displayNumber: "AL-20261023-424699",
          payments: [payment(6900)],
        }),
      ],
      from,
      to,
    );
    expect(result).toMatchObject({
      leads: 0,
      cashReceivedMinor: 0,
      leadToContacted: null,
    });
    expect(
      businessSummary(
        [order({ displayNumber: "AL-20261023-42469A" })],
        from,
        to,
      ).leads,
    ).toBe(1);
  });
});
describe("website session populations", () => {
  it("keeps landing/product conversion restricted to session-linked website orders", () => {
    const events = ["PAGE_VIEW", "VIEW_ITEM", "PREORDER_OPEN"].map(
      (eventName) => ({
        eventName,
        sessionId: "session1",
        occurredAt: new Date("2026-10-10"),
        landingPage: "/et",
        productId: "product1",
        productName: "Public name",
      }),
    );
    const linked = order({
      attribution: {
        analyticsConsent: true,
        websiteSessionId: "session1",
        touches: [{ source: "META_ADS", touchType: "LAST" }],
      },
    });
    const result = websiteBreakdowns(
      [
        {
          ...linked,
          items: [
            { quantity: 1, unitPriceMinor: 21900, productId: "product1" },
          ],
        },
        { ...order(), items: [] },
      ],
      events,
      from,
      to,
    );
    expect(result.landingRows).toEqual([
      { landingPage: "/et", visits: 1, websiteOrders: 1, orderConversion: 100 },
    ]);
    expect(result.productRows[0]).toMatchObject({
      productViews: 1,
      preorderOpens: 1,
      websiteOrders: 1,
    });
  });
  it("deduplicates product/open sessions and joins only consented persisted website orders", () => {
    const events = [
      "PAGE_VIEW",
      "VIEW_ITEM",
      "VIEW_ITEM",
      "PREORDER_CTA_ATTEMPT",
      "PREORDER_CTA_ATTEMPT",
      "PREORDER_SELECTION_REQUIRED",
      "PREORDER_OPEN",
      "PREORDER_OPEN",
    ].map((eventName) => ({
      eventName,
      sessionId: "session1",
      occurredAt: new Date("2026-10-10T12:00Z"),
    }));
    const linked = order({
      attribution: {
        analyticsConsent: true,
        websiteSessionId: "session1",
        touches: [{ source: "META_ADS", touchType: "FIRST" }],
      },
    });
    const r = websiteSummary(
      [
        linked,
        order(),
        order({
          attribution: { ...linked.attribution!, websiteSessionId: "unseen" },
        }),
        order({
          attribution: { ...linked.attribution!, analyticsConsent: false },
        }),
      ],
      events,
      from,
      to,
    );
    expect(r).toMatchObject({
      sessions: 1,
      productViewSessions: 1,
      preorderAttemptSessions: 1,
      preorderSelectionRequiredSessions: 1,
      preorderOpenSessions: 1,
      websiteOrders: 1,
      productReach: 100,
      preorderIntent: 100,
      orderConversion: 100,
    });
  });
  it("does not invent historical sessions or include unknown-source orders", () => {
    expect(websiteSummary([order()], [], from, to)).toMatchObject({
      sessions: 0,
      websiteOrders: 0,
      orderConversion: null,
    });
  });
});
describe("Tallinn calendar reporting", () => {
  it("rejects invalid or reversed dates instead of silently normalizing them", () => {
    expect(() => reportingPeriod("2026-02-30", "2026-03-01")).toThrow();
    expect(() => reportingPeriod("2026-10-24", "2026-10-23")).toThrow();
  });
  it("uses 23-hour and 25-hour DST days while preserving provider date buckets", () => {
    const spring = reportingPeriod("2026-03-29", "2026-03-29"),
      autumn = reportingPeriod("2026-10-25", "2026-10-25");
    expect((spring.to.valueOf() - spring.from.valueOf()) / 3600000).toBe(23);
    expect((autumn.to.valueOf() - autumn.from.valueOf()) / 3600000).toBe(25);
    expect(
      (autumn.spendTo.valueOf() - autumn.spendFrom.valueOf()) / 3600000,
    ).toBe(24);
    expect(reportingPeriod("2026-10-24", "2026-10-24").from.toISOString()).toBe(
      "2026-10-23T21:00:00.000Z",
    );
  });
});

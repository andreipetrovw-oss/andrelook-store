import type {
  SourceGroupCode,
  TrafficSourceCode,
} from "@/lib/attribution/types";

export type ReportingOrder = {
  displayNumber: string;
  events: Array<{
    amountMinor: number | null;
    eventKey: string;
    eventType: string;
    occurredAt: Date;
  }>;
  orderDate: Date;
  items?: Array<{
    paymentRateBpsSnapshot: number | null;
    quantity: number;
    unitLandedCostMinorSnapshot: number | null;
    unitPriceMinor: number | null;
  }>;
  payments?: Array<{
    kind: string;
    processorFeeMinor: number | null;
  }>;
  status: string;
  touch: {
    adName?: string | null;
    adSetName?: string | null;
    campaignName: string | null;
    source: TrafficSourceCode;
    sourceGroup: SourceGroupCode;
  } | null;
};

export type ReportingSpend = {
  adName?: string | null;
  adSetName?: string | null;
  campaignName: string | null;
  date: Date;
  source: TrafficSourceCode;
  spendMinor: number;
};

export type AdvertisingRow = {
  ad: string | null;
  adSet: string | null;
  campaign: string | null;
  confirmed: number;
  contributionAfterAdsMinor: number | null;
  contributionBeforeAdsMinor: number | null;
  costPerCustomerMinor: number | null;
  costPerLeadMinor: number | null;
  leads: number;
  paid: number;
  paymentCostEstimated: boolean;
  revenueMinor: number;
  roas: number | null;
  source: TrafficSourceCode;
  spendMinor: number;
};

const confirmedEventTypes = new Set([
  "LEAD_CONFIRMED",
  "AWAITING_PAYMENT",
  "PAID",
  "ORDERED",
  "IN_TRANSIT",
  "READY",
  "DELIVERED",
]);

function key(
  source: TrafficSourceCode,
  campaign: string | null,
  adSet: string | null,
  ad: string | null,
) {
  return `${source}\u0000${campaign ?? ""}\u0000${adSet ?? ""}\u0000${ad ?? ""}`;
}

export function buildAdvertisingRows(input: {
  from: Date;
  orders: ReportingOrder[];
  spend: ReportingSpend[];
  to: Date;
}) {
  const rows = new Map<string, AdvertisingRow>();
  const row = (
    source: TrafficSourceCode,
    campaign: string | null,
    adSet: string | null,
    ad: string | null,
  ) => {
    const rowKey = key(source, campaign, adSet, ad);
    const existing = rows.get(rowKey);
    if (existing) return existing;
    const created: AdvertisingRow = {
      ad,
      adSet,
      campaign,
      confirmed: 0,
      contributionAfterAdsMinor: 0,
      contributionBeforeAdsMinor: 0,
      costPerCustomerMinor: null,
      costPerLeadMinor: null,
      leads: 0,
      paid: 0,
      paymentCostEstimated: false,
      revenueMinor: 0,
      roas: null,
      source,
      spendMinor: 0,
    };
    rows.set(rowKey, created);
    return created;
  };

  for (const order of input.orders) {
    const source = order.touch?.source ?? "UNKNOWN";
    const campaign = order.touch?.campaignName ?? null;
    const target = row(
      source,
      campaign,
      order.touch?.adSetName ?? null,
      order.touch?.adName ?? null,
    );
    if (order.orderDate >= input.from && order.orderDate < input.to) {
      target.leads += 1;
    }
    if (
      order.events.some(
        (event) =>
          confirmedEventTypes.has(event.eventType) &&
          event.occurredAt >= input.from &&
          event.occurredAt < input.to,
      )
    ) {
      target.confirmed += 1;
    }
    const paidEvents = new Map(
      order.events
        .filter(
          (event) =>
            event.eventType === "PAID" &&
            event.occurredAt >= input.from &&
            event.occurredAt < input.to,
        )
        .map((event) => [event.eventKey, event]),
    );
    if (paidEvents.size) target.paid += 1;
    let paidRevenueMinor = 0;
    for (const event of paidEvents.values()) {
      paidRevenueMinor += Math.max(0, event.amountMinor ?? 0);
    }
    target.revenueMinor += paidRevenueMinor;
    if (paidEvents.size) {
      const items = order.items ?? [];
      const landedComplete =
        items.length > 0 &&
        items.every((item) => item.unitLandedCostMinorSnapshot !== null);
      const estimatedPaymentComplete =
        items.length > 0 &&
        items.every(
          (item) =>
            item.paymentRateBpsSnapshot !== null &&
            item.unitPriceMinor !== null,
        );
      const relevantPayments = (order.payments ?? []).filter(
        (payment) => payment.kind !== "REFUND",
      );
      const actualPaymentComplete =
        relevantPayments.length > 0 &&
        relevantPayments.every((payment) => payment.processorFeeMinor !== null);
      if (
        !landedComplete ||
        (!actualPaymentComplete && !estimatedPaymentComplete)
      ) {
        target.contributionBeforeAdsMinor = null;
      } else if (target.contributionBeforeAdsMinor !== null) {
        const landedCostMinor = items.reduce(
          (sum, item) =>
            sum + (item.unitLandedCostMinorSnapshot ?? 0) * item.quantity,
          0,
        );
        const paymentCostMinor = actualPaymentComplete
          ? relevantPayments.reduce(
              (sum, payment) => sum + (payment.processorFeeMinor ?? 0),
              0,
            )
          : items.reduce(
              (sum, item) =>
                sum +
                Math.round(
                  ((item.unitPriceMinor ?? 0) *
                    item.quantity *
                    (item.paymentRateBpsSnapshot ?? 0)) /
                    10_000,
                ),
              0,
            );
        target.paymentCostEstimated ||= !actualPaymentComplete;
        target.contributionBeforeAdsMinor +=
          paidRevenueMinor - landedCostMinor - paymentCostMinor;
      }
    }
  }

  for (const spend of input.spend) {
    if (spend.date < input.from || spend.date >= input.to) continue;
    row(
      spend.source,
      spend.campaignName,
      spend.adSetName ?? null,
      spend.adName ?? null,
    ).spendMinor += Math.max(0, spend.spendMinor);
  }

  for (const item of rows.values()) {
    item.costPerLeadMinor =
      item.leads && item.spendMinor
        ? Math.round(item.spendMinor / item.leads)
        : null;
    item.costPerCustomerMinor =
      item.paid && item.spendMinor
        ? Math.round(item.spendMinor / item.paid)
        : null;
    item.roas = item.spendMinor
      ? Number((item.revenueMinor / item.spendMinor).toFixed(2))
      : null;
    item.contributionAfterAdsMinor =
      item.contributionBeforeAdsMinor === null
        ? null
        : item.contributionBeforeAdsMinor - item.spendMinor;
  }
  return [...rows.values()].sort(
    (a, b) => b.revenueMinor - a.revenueMinor || b.leads - a.leads,
  );
}

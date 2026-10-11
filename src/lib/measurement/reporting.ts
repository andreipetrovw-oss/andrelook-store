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
    productId?: string | null;
    productName?: string | null;
    quantity: number;
    unitLandedCostMinorSnapshot: number | null;
    unitPriceMinor: number | null;
  }>;
  payments?: Array<{ kind: string; processorFeeMinor: number | null }>;
  status: string;
  touch: {
    adName?: string | null;
    adSetName?: string | null;
    campaignName: string | null;
    landingPage?: string | null;
    source: TrafficSourceCode;
    sourceGroup: SourceGroupCode;
  } | null;
};

export type ReportingSpend = {
  adName?: string | null;
  adSetName?: string | null;
  campaignName: string | null;
  date: Date;
  impressions?: number | null;
  landingPageViews?: number | null;
  linkClicks?: number | null;
  outboundClicks?: number | null;
  reach?: number | null;
  source: TrafficSourceCode;
  spendMinor: number;
};

export type ReportingAnalyticsEvent = {
  adName: string | null;
  adSetName: string | null;
  campaignName: string | null;
  eventName: string;
  landingPage: string | null;
  occurredAt: Date;
  productId: string | null;
  productName?: string | null;
  sessionId: string;
  source: TrafficSourceCode;
};

export type AdvertisingRow = {
  ad: string | null;
  adSet: string | null;
  campaign: string | null;
  clickToVisitRate: number | null;
  clicks: number | null;
  confirmed: number;
  contributionAfterAdsMinor: number | null;
  contributionBeforeAdsMinor: number | null;
  costPerCustomerMinor: number | null;
  costPerLeadMinor: number | null;
  cpcMinor: number | null;
  cpmMinor: number | null;
  ctr: number | null;
  frequency: number | null;
  impressions: number | null;
  landingPageViews: number | null;
  leads: number;
  linkClicks: number | null;
  outboundClicks: number | null;
  paid: number;
  paymentCostEstimated: boolean;
  preorderOpens: number;
  productViews: number;
  reach: number | null;
  revenueMinor: number;
  roas: number | null;
  siteVisits: number;
  source: TrafficSourceCode;
  spendMinor: number;
};

export type LandingPerformanceRow = {
  landingPage: string;
  leadConversionRate: number | null;
  leads: number;
  paid: number;
  paidConversionRate: number | null;
  revenueMinor: number;
  visits: number;
};

export type ProductPerformanceRow = {
  leads: number;
  paid: number;
  preorderOpens: number;
  productId: string;
  productName: string;
  productViews: number;
  revenueMinor: number;
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

function rate(numerator: number, denominator: number | null) {
  return denominator && denominator > 0
    ? Number(((numerator / denominator) * 100).toFixed(1))
    : null;
}

function paidEvents(order: ReportingOrder, from: Date, to: Date) {
  return new Map(
    order.events
      .filter(
        (event) =>
          event.eventType === "PAID" &&
          event.occurredAt >= from &&
          event.occurredAt < to,
      )
      .map((event) => [event.eventKey, event]),
  );
}

export function buildAdvertisingRows(input: {
  events?: ReportingAnalyticsEvent[];
  from: Date;
  orders: ReportingOrder[];
  spend: ReportingSpend[];
  to: Date;
}) {
  const rows = new Map<string, AdvertisingRow>();
  const topFunnel = new Map<
    string,
    Record<
      | "impressions"
      | "landingPageViews"
      | "linkClicks"
      | "outboundClicks"
      | "reach",
      { available: number; sum: number; total: number }
    >
  >();
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
      clickToVisitRate: null,
      clicks: null,
      confirmed: 0,
      contributionAfterAdsMinor: 0,
      contributionBeforeAdsMinor: 0,
      costPerCustomerMinor: null,
      costPerLeadMinor: null,
      cpcMinor: null,
      cpmMinor: null,
      ctr: null,
      frequency: null,
      impressions: null,
      landingPageViews: null,
      leads: 0,
      linkClicks: null,
      outboundClicks: null,
      paid: 0,
      paymentCostEstimated: false,
      preorderOpens: 0,
      productViews: 0,
      reach: null,
      revenueMinor: 0,
      roas: null,
      siteVisits: 0,
      source,
      spendMinor: 0,
    };
    rows.set(rowKey, created);
    return created;
  };

  for (const order of input.orders) {
    const target = row(
      order.touch?.source ?? "UNKNOWN",
      order.touch?.campaignName ?? null,
      order.touch?.adSetName ?? null,
      order.touch?.adName ?? null,
    );
    if (order.orderDate >= input.from && order.orderDate < input.to)
      target.leads += 1;
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
    const paid = paidEvents(order, input.from, input.to);
    if (paid.size) target.paid += 1;
    const paidRevenueMinor = [...paid.values()].reduce(
      (sum, event) => sum + Math.max(0, event.amountMinor ?? 0),
      0,
    );
    target.revenueMinor += paidRevenueMinor;
    if (paid.size) {
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

  const seenSessions = new Set<string>();
  const seenProductViews = new Set<string>();
  for (const event of (input.events ?? []).toSorted(
    (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
  )) {
    if (event.occurredAt < input.from || event.occurredAt >= input.to) continue;
    const target = row(
      event.source,
      event.campaignName,
      event.adSetName,
      event.adName,
    );
    if (!seenSessions.has(event.sessionId)) {
      seenSessions.add(event.sessionId);
      target.siteVisits += 1;
    }
    if (event.eventName === "VIEW_ITEM" && event.productId) {
      const viewKey = `${event.sessionId}:${event.productId}`;
      if (!seenProductViews.has(viewKey)) {
        seenProductViews.add(viewKey);
        target.productViews += 1;
      }
    }
    if (event.eventName === "PREORDER_OPEN") target.preorderOpens += 1;
  }

  for (const spend of input.spend) {
    if (spend.date < input.from || spend.date >= input.to) continue;
    const rowKey = key(
      spend.source,
      spend.campaignName,
      spend.adSetName ?? null,
      spend.adName ?? null,
    );
    row(
      spend.source,
      spend.campaignName,
      spend.adSetName ?? null,
      spend.adName ?? null,
    ).spendMinor += Math.max(0, spend.spendMinor);
    const accumulator =
      topFunnel.get(rowKey) ??
      (Object.fromEntries(
        [
          "impressions",
          "landingPageViews",
          "linkClicks",
          "outboundClicks",
          "reach",
        ].map((field) => [field, { available: 0, sum: 0, total: 0 }]),
      ) as Record<
        | "impressions"
        | "landingPageViews"
        | "linkClicks"
        | "outboundClicks"
        | "reach",
        { available: number; sum: number; total: number }
      >);
    for (const field of [
      "impressions",
      "landingPageViews",
      "linkClicks",
      "outboundClicks",
      "reach",
    ] as const) {
      accumulator[field].total += 1;
      const value = spend[field];
      if (value !== null && value !== undefined) {
        accumulator[field].available += 1;
        accumulator[field].sum += Math.max(0, value);
      }
    }
    topFunnel.set(rowKey, accumulator);
  }

  for (const [rowKey, item] of rows) {
    const metrics = topFunnel.get(rowKey);
    if (metrics) {
      for (const field of [
        "impressions",
        "landingPageViews",
        "linkClicks",
        "outboundClicks",
        "reach",
      ] as const) {
        item[field] =
          metrics[field].total > 0 &&
          metrics[field].available === metrics[field].total
            ? metrics[field].sum
            : null;
      }
    }
    item.clicks = item.outboundClicks ?? item.linkClicks;
    item.ctr = rate(item.clicks ?? 0, item.impressions);
    item.cpcMinor = item.clicks
      ? Math.round(item.spendMinor / item.clicks)
      : null;
    item.cpmMinor = item.impressions
      ? Math.round((item.spendMinor * 1_000) / item.impressions)
      : null;
    item.frequency =
      item.impressions !== null && item.reach
        ? Number((item.impressions / item.reach).toFixed(2))
        : null;
    item.clickToVisitRate = rate(item.siteVisits, item.clicks);
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

export function buildLandingPerformance(input: {
  events: ReportingAnalyticsEvent[];
  from: Date;
  orders: ReportingOrder[];
  to: Date;
}) {
  const rows = new Map<string, LandingPerformanceRow>();
  const row = (landingPage: string) => {
    const existing = rows.get(landingPage);
    if (existing) return existing;
    const created: LandingPerformanceRow = {
      landingPage,
      leadConversionRate: null,
      leads: 0,
      paid: 0,
      paidConversionRate: null,
      revenueMinor: 0,
      visits: 0,
    };
    rows.set(landingPage, created);
    return created;
  };
  const sessions = new Set<string>();
  for (const event of input.events.toSorted(
    (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
  )) {
    if (
      event.occurredAt < input.from ||
      event.occurredAt >= input.to ||
      sessions.has(event.sessionId)
    )
      continue;
    sessions.add(event.sessionId);
    row(event.landingPage ?? "/").visits += 1;
  }
  for (const order of input.orders) {
    const landing = order.touch?.landingPage;
    if (!landing) continue;
    const target = row(landing.split("?")[0] || "/");
    if (order.orderDate >= input.from && order.orderDate < input.to)
      target.leads += 1;
    const paid = paidEvents(order, input.from, input.to);
    if (paid.size) target.paid += 1;
    target.revenueMinor += [...paid.values()].reduce(
      (sum, event) => sum + Math.max(0, event.amountMinor ?? 0),
      0,
    );
  }
  for (const item of rows.values()) {
    item.leadConversionRate = rate(item.leads, item.visits);
    item.paidConversionRate = rate(item.paid, item.visits);
  }
  return [...rows.values()].sort(
    (a, b) => b.leads - a.leads || b.visits - a.visits,
  );
}

export function buildProductPerformance(input: {
  events: ReportingAnalyticsEvent[];
  from: Date;
  orders: ReportingOrder[];
  to: Date;
}) {
  const rows = new Map<string, ProductPerformanceRow>();
  const row = (productId: string, productName?: string | null) => {
    const existing = rows.get(productId);
    if (existing) {
      if (productName) existing.productName = productName;
      return existing;
    }
    const created: ProductPerformanceRow = {
      leads: 0,
      paid: 0,
      preorderOpens: 0,
      productId,
      productName: productName ?? productId,
      productViews: 0,
      revenueMinor: 0,
    };
    rows.set(productId, created);
    return created;
  };
  const seenViews = new Set<string>();
  for (const event of input.events) {
    if (
      event.occurredAt < input.from ||
      event.occurredAt >= input.to ||
      !event.productId
    )
      continue;
    const target = row(event.productId, event.productName);
    if (event.eventName === "VIEW_ITEM") {
      const viewKey = `${event.sessionId}:${event.productId}`;
      if (!seenViews.has(viewKey)) {
        seenViews.add(viewKey);
        target.productViews += 1;
      }
    }
    if (event.eventName === "PREORDER_OPEN") target.preorderOpens += 1;
  }
  for (const order of input.orders) {
    const uniqueItems = new Map(
      (order.items ?? [])
        .filter((item) => item.productId)
        .map((item) => [item.productId!, item]),
    );
    const isLead = order.orderDate >= input.from && order.orderDate < input.to;
    const paid = paidEvents(order, input.from, input.to);
    const revenue = [...paid.values()].reduce(
      (sum, event) => sum + Math.max(0, event.amountMinor ?? 0),
      0,
    );
    const weightTotal = [...uniqueItems.values()].reduce(
      (sum, item) =>
        sum + Math.max(0, item.unitPriceMinor ?? 0) * item.quantity,
      0,
    );
    for (const [productId, item] of uniqueItems) {
      const target = row(productId, item.productName);
      if (isLead) target.leads += 1;
      if (paid.size) target.paid += 1;
      if (paid.size && weightTotal > 0) {
        const weight = Math.max(0, item.unitPriceMinor ?? 0) * item.quantity;
        target.revenueMinor += Math.round((revenue * weight) / weightTotal);
      } else if (paid.size && uniqueItems.size === 1) {
        target.revenueMinor += revenue;
      }
    }
  }
  return [...rows.values()].sort(
    (a, b) =>
      b.revenueMinor - a.revenueMinor ||
      b.leads - a.leads ||
      b.productViews - a.productViews,
  );
}

export function conversionRate(numerator: number, denominator: number | null) {
  return rate(numerator, denominator);
}

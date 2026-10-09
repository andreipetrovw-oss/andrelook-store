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
  status: string;
  touch: {
    campaignName: string | null;
    source: TrafficSourceCode;
    sourceGroup: SourceGroupCode;
  } | null;
};

export type ReportingSpend = {
  campaignName: string | null;
  date: Date;
  source: TrafficSourceCode;
  spendMinor: number;
};

export type AdvertisingRow = {
  campaign: string | null;
  confirmed: number;
  costPerCustomerMinor: number | null;
  costPerLeadMinor: number | null;
  leads: number;
  paid: number;
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

function key(source: TrafficSourceCode, campaign: string | null) {
  return `${source}\u0000${campaign ?? ""}`;
}

export function buildAdvertisingRows(input: {
  from: Date;
  orders: ReportingOrder[];
  spend: ReportingSpend[];
  to: Date;
}) {
  const rows = new Map<string, AdvertisingRow>();
  const row = (source: TrafficSourceCode, campaign: string | null) => {
    const rowKey = key(source, campaign);
    const existing = rows.get(rowKey);
    if (existing) return existing;
    const created: AdvertisingRow = {
      campaign,
      confirmed: 0,
      costPerCustomerMinor: null,
      costPerLeadMinor: null,
      leads: 0,
      paid: 0,
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
    const target = row(source, campaign);
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
    for (const event of paidEvents.values()) {
      target.revenueMinor += Math.max(0, event.amountMinor ?? 0);
    }
  }

  for (const spend of input.spend) {
    if (spend.date < input.from || spend.date >= input.to) continue;
    row(spend.source, spend.campaignName).spendMinor += Math.max(
      0,
      spend.spendMinor,
    );
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
  }
  return [...rows.values()].sort(
    (a, b) => b.revenueMinor - a.revenueMinor || b.leads - a.leads,
  );
}

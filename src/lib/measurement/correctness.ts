import {
  calculateFinancials,
  effectiveTotalMinor,
  itemSnapshotTotalMinor,
} from "@/lib/orders/financials";
import { isInternalTestOrder } from "@/lib/admin/test-orders";

export type BusinessOrder = {
  displayNumber: string;
  createdAt: Date;
  status: string;
  currency: string | null;
  agreedTotalMinor: number | null;
  confirmedTotalMinor: number | null;
  items: Array<{ quantity: number; unitPriceMinor: number | null }>;
  statusHistory: Array<{ toStatus: string; createdAt: Date }>;
  payments: Array<{
    amountMinor: number;
    kind: "DEPOSIT" | "BALANCE" | "FULL" | "REFUND" | "ADJUSTMENT";
    status: "ACTIVE" | "VOIDED";
    currency: string;
    receivedAt: Date;
  }>;
  attribution: {
    analyticsConsent: boolean;
    websiteSessionId: string | null;
    touches: Array<{ source: string; touchType: string }>;
  } | null;
};
const stage = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "AWAITING_PAYMENT",
  "PAID",
  "ORDERED",
  "IN_TRANSIT",
  "READY",
  "DELIVERED",
];
export function percentOf(numerator: number, denominator: number) {
  return denominator > 0
    ? Number(((numerator / denominator) * 100).toFixed(1))
    : null;
}
export function businessSummary(orders: BusinessOrder[], from: Date, to: Date) {
  const eligible = orders.filter((o) => !isInternalTestOrder(o.displayNumber));
  const cohort = eligible.filter(
    (o) => o.createdAt >= from && o.createdAt < to,
  );
  const total = (o: BusinessOrder) =>
    effectiveTotalMinor({
      agreedTotalMinor: o.agreedTotalMinor,
      confirmedTotalMinor: o.confirmedTotalMinor,
      itemTotalMinor: itemSnapshotTotalMinor(o.items),
    });
  const reached = (o: BusinessOrder, target: string) =>
    Math.max(
      ...[o.status, ...o.statusHistory.map((h) => h.toStatus)].map((s) =>
        stage.indexOf(s),
      ),
    ) >= stage.indexOf(target);
  const fullyPaid = (o: BusinessOrder) => {
    const value = total(o);
    return (
      value !== null &&
      value > 0 &&
      calculateFinancials(
        value,
        o.payments.filter((p) => p.currency === o.currency),
      ).paidMinor >= value
    );
  };
  // Lifetime attainment within the selected created-order cohort, not unrelated
  // period stage events. A verified full payment also establishes earlier stages.
  const hasPaid = (o: BusinessOrder) =>
    fullyPaid(o) ||
    o.status === "PAID" ||
    o.statusHistory.some((h) => h.toStatus === "PAID");
  const contacted = cohort.filter((o) => reached(o, "CONTACTED") || hasPaid(o));
  const confirmed = contacted.filter(
    (o) => reached(o, "CONFIRMED") || hasPaid(o),
  );
  const paid = confirmed.filter(hasPaid);
  const delivered = cohort.filter((o) => reached(o, "DELIVERED"));
  const paidDelivered = paid.filter((o) => reached(o, "DELIVERED"));
  const active = cohort.filter(
    (o) => o.status !== "CANCELLED" && o.currency === "EUR",
  );
  const cashReceivedMinor = eligible.reduce(
    (sum, o) =>
      sum +
      calculateFinancials(
        null,
        o.payments.filter(
          (p) =>
            p.currency === "EUR" && p.receivedAt >= from && p.receivedAt < to,
        ),
      ).paidMinor,
    0,
  );
  const cancelledPayments = eligible
    .filter((o) => o.status === "CANCELLED")
    .map((o) => ({
      reference: o.displayNumber,
      amountMinor: calculateFinancials(
        null,
        o.payments.filter((p) => p.currency === "EUR"),
      ).paidMinor,
    }))
    .filter((o) => o.amountMinor !== 0);
  return {
    leads: cohort.length,
    needsContact: cohort.filter((o) => o.status === "NEW").length,
    contacted: contacted.length,
    confirmed: confirmed.length,
    fullyPaid: paid.length,
    delivered: delivered.length,
    cancelled: cohort.filter((o) => o.status === "CANCELLED").length,
    leadToContacted: percentOf(contacted.length, cohort.length),
    contactedToConfirmed: percentOf(confirmed.length, contacted.length),
    confirmedToPaid: percentOf(paid.length, confirmed.length),
    paidToDelivered: percentOf(paidDelivered.length, paid.length),
    leadToConfirmed: percentOf(confirmed.length, cohort.length),
    leadToPaid: percentOf(paid.length, cohort.length),
    cancellationRate: percentOf(
      cohort.filter((o) => o.status === "CANCELLED").length,
      cohort.length,
    ),
    cashReceivedMinor,
    orderValueMinor: active.reduce((s, o) => s + (total(o) ?? 0), 0),
    outstandingMinor: active.reduce(
      (s, o) =>
        s +
        (calculateFinancials(
          total(o),
          o.payments.filter((p) => p.currency === o.currency),
        ).balanceMinor ?? 0),
      0,
    ),
    deliveredValueMinor: active
      .filter((o) => o.status === "DELIVERED")
      .reduce((s, o) => s + (total(o) ?? 0), 0),
    unknownValueOrders: active.filter((o) => total(o) === null).length,
    otherCurrencyOrders: cohort.filter((o) => o.currency !== "EUR").length,
    cancelledPayments,
  };
}

export function websiteSummary(
  orders: BusinessOrder[],
  events: Array<{ sessionId: string; eventName: string; occurredAt: Date }>,
  from: Date,
  to: Date,
) {
  const scoped = events.filter(
    (e) => e.occurredAt >= from && e.occurredAt < to,
  );
  const sessions = new Set(scoped.map((e) => e.sessionId));
  const product = new Set(
    scoped.filter((e) => e.eventName === "VIEW_ITEM").map((e) => e.sessionId),
  );
  const opened = new Set(
    scoped
      .filter((e) => e.eventName === "PREORDER_OPEN")
      .map((e) => e.sessionId),
  );
  const attempted = new Set(
    scoped
      .filter((e) => e.eventName === "PREORDER_CTA_ATTEMPT")
      .map((e) => e.sessionId),
  );
  const selectionRequired = new Set(
    scoped
      .filter((e) => e.eventName === "PREORDER_SELECTION_REQUIRED")
      .map((e) => e.sessionId),
  );
  const linked = orders.filter(
    (o) =>
      !isInternalTestOrder(o.displayNumber) &&
      o.createdAt >= from &&
      o.createdAt < to &&
      o.attribution?.analyticsConsent &&
      o.attribution.websiteSessionId &&
      sessions.has(o.attribution.websiteSessionId) &&
      o.attribution.touches.some((t) => t.source !== "UNKNOWN"),
  );
  // Multiple genuine orders in one session remain multiple orders; never clamp ratios.
  const converted = new Set(
    linked.map((o) => o.attribution!.websiteSessionId!),
  );
  return {
    sessions: sessions.size,
    productViewSessions: product.size,
    preorderAttemptSessions: attempted.size,
    preorderSelectionRequiredSessions: selectionRequired.size,
    preorderOpenSessions: opened.size,
    websiteOrders: linked.length,
    convertingSessions: converted.size,
    productReach: percentOf(product.size, sessions.size),
    preorderIntent: percentOf(opened.size, product.size),
    orderConversion: percentOf(linked.length, sessions.size),
    preorderCompletion: percentOf(linked.length, opened.size),
  };
}

export function websiteBreakdowns(
  orders: Array<
    Omit<BusinessOrder, "items"> & {
      items: Array<
        BusinessOrder["items"][number] & { productId: string | null }
      >;
    }
  >,
  events: Array<{
    sessionId: string;
    eventName: string;
    occurredAt: Date;
    landingPage: string | null;
    productId: string | null;
    productName: string | null;
  }>,
  from: Date,
  to: Date,
) {
  const scoped = events.filter(
    (e) => e.occurredAt >= from && e.occurredAt < to,
  );
  const sessionLanding = new Map<string, string>();
  for (const e of [...scoped].sort(
    (a, b) => a.occurredAt.valueOf() - b.occurredAt.valueOf(),
  )) {
    if (!sessionLanding.has(e.sessionId))
      sessionLanding.set(e.sessionId, e.landingPage ?? "Неизвестная страница");
  }
  const linked = orders.filter(
    (o) => websiteSummary([o], scoped, from, to).websiteOrders === 1,
  );
  const landingRows = [...new Set(sessionLanding.values())].map(
    (landingPage) => {
      const sessions = new Set(
        [...sessionLanding]
          .filter(([, p]) => p === landingPage)
          .map(([s]) => s),
      );
      const websiteOrders = linked.filter((o) =>
        sessions.has(o.attribution!.websiteSessionId!),
      ).length;
      return {
        landingPage,
        visits: sessions.size,
        websiteOrders,
        orderConversion: percentOf(websiteOrders, sessions.size),
      };
    },
  );
  const productRows = [
    ...new Set(
      scoped.map((e) => e.productId).filter((id): id is string => Boolean(id)),
    ),
  ].map((productId) => {
    const productEvents = scoped.filter((e) => e.productId === productId);
    return {
      productId,
      productName:
        productEvents.find((e) => e.productName)?.productName ?? "Товар",
      productViews: new Set(
        productEvents
          .filter((e) => e.eventName === "VIEW_ITEM")
          .map((e) => e.sessionId),
      ).size,
      preorderOpens: new Set(
        productEvents
          .filter((e) => e.eventName === "PREORDER_OPEN")
          .map((e) => e.sessionId),
      ).size,
      websiteOrders: linked.filter((o) =>
        o.items.some((i) => i.productId === productId),
      ).length,
    };
  });
  return { landingRows, productRows };
}

export type LedgerEntry = {
  amountMinor: number;
  kind: "DEPOSIT" | "BALANCE" | "FULL" | "REFUND" | "ADJUSTMENT";
  status?: "ACTIVE" | "VOIDED";
};

export function effectiveTotalMinor(input: {
  agreedTotalMinor: number | null;
  confirmedTotalMinor: number | null;
  itemTotalMinor: number | null;
}) {
  return (
    input.agreedTotalMinor ?? input.confirmedTotalMinor ?? input.itemTotalMinor
  );
}

export function itemSnapshotTotalMinor(
  items: Array<{ quantity: number; unitPriceMinor: number | null }>,
) {
  if (!items.length || items.some((item) => item.unitPriceMinor === null)) {
    return null;
  }
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPriceMinor!,
    0,
  );
}

export function calculateFinancials(
  confirmedTotalMinor: number | null,
  payments: LedgerEntry[],
) {
  const paidMinor = payments.reduce((total, payment) => {
    if (payment.status === "VOIDED") return total;
    if (payment.kind === "REFUND") return total - payment.amountMinor;
    return total + payment.amountMinor;
  }, 0);
  return {
    balanceMinor:
      confirmedTotalMinor === null
        ? null
        : Math.max(confirmedTotalMinor - paidMinor, 0),
    paidMinor,
  };
}
export function requiredPrepaymentMinor(
  effectiveTotal: number | null,
  preference: "DEPOSIT_30_BALANCE_ON_HANDOVER" | "FULL_ADVANCE" | null,
) {
  if (effectiveTotal === null) return null;
  return preference === "DEPOSIT_30_BALANCE_ON_HANDOVER"
    ? Math.round(effectiveTotal * 0.3)
    : effectiveTotal;
}

export function recalculatedCommercialStatus(input: {
  currentStatus:
    | "NEW"
    | "CONTACTED"
    | "CONFIRMED"
    | "AWAITING_PAYMENT"
    | "PAID"
    | "ORDERED"
    | "IN_TRANSIT"
    | "READY"
    | "DELIVERED"
    | "CANCELLED";
  effectiveTotalMinor: number | null;
  paidMinor: number;
  paymentPreference: "DEPOSIT_30_BALANCE_ON_HANDOVER" | "FULL_ADVANCE" | null;
}) {
  const commercialStatuses = new Set([
    "NEW",
    "CONTACTED",
    "CONFIRMED",
    "AWAITING_PAYMENT",
    "PAID",
  ]);
  if (!commercialStatuses.has(input.currentStatus)) return input.currentStatus;
  if (
    input.effectiveTotalMinor !== null &&
    input.effectiveTotalMinor > 0 &&
    input.paidMinor >= input.effectiveTotalMinor
  ) {
    return "PAID" as const;
  }
  if (input.currentStatus === "PAID") return "AWAITING_PAYMENT" as const;
  if (input.currentStatus === "CONFIRMED" && input.paymentPreference !== null) {
    return "AWAITING_PAYMENT" as const;
  }
  return input.currentStatus;
}

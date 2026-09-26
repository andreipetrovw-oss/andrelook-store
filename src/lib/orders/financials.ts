export type LedgerEntry = {
  amountMinor: number;
  kind: "DEPOSIT" | "BALANCE" | "FULL" | "REFUND" | "ADJUSTMENT";
};

export function calculateFinancials(
  confirmedTotalMinor: number | null,
  payments: LedgerEntry[],
) {
  const paidMinor = payments.reduce((total, payment) => {
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

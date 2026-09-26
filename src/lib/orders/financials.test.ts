import { describe, expect, it } from "vitest";

import { calculateFinancials } from "./financials";

describe("CRM payment summary", () => {
  it("calculates paid and balance values including refunds", () => {
    expect(
      calculateFinancials(30_000, [
        { amountMinor: 10_000, kind: "DEPOSIT" },
        { amountMinor: 5_000, kind: "BALANCE" },
        { amountMinor: 2_000, kind: "REFUND" },
      ]),
    ).toEqual({ balanceMinor: 17_000, paidMinor: 13_000 });
  });

  it("keeps balance pending before the owner confirms a total", () => {
    expect(calculateFinancials(null, [])).toEqual({
      balanceMinor: null,
      paidMinor: 0,
    });
  });
});

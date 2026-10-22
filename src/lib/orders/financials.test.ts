import { describe, expect, it } from "vitest";
import { reviewEligible } from "@/lib/reviews/model";

import {
  calculateFinancials,
  effectiveTotalMinor,
  recalculatedCommercialStatus,
  requiredPrepaymentMinor,
} from "./financials";

describe("CRM payment summary", () => {
  it.each([0, 7_000, 21_900])(
    "preserves delivery and real review eligibility at paid amount %s",
    (paidMinor) => {
      const status = recalculatedCommercialStatus({
        currentStatus: "DELIVERED",
        effectiveTotalMinor: 21_900,
        paidMinor,
        paymentPreference: "FULL_ADVANCE",
      });
      expect(status).toBe("DELIVERED");
      expect(
        reviewEligible({
          status,
          displayNumber: "AL-20261015-32CC44",
          customer: { name: "Marcel Sokolov" },
        }),
      ).toBe(true);
    },
  );
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

  it("uses agreed price without overwriting the original total", () => {
    const original = 24_900;
    const effective = effectiveTotalMinor({
      agreedTotalMinor: 24_000,
      confirmedTotalMinor: original,
      itemTotalMinor: original,
    });
    expect(original).toBe(24_900);
    expect(effective).toBe(24_000);
    expect(calculateFinancials(effective, [])).toEqual({
      balanceMinor: 24_000,
      paidMinor: 0,
    });
  });

  it("falls back to the preserved original total after removing agreed price", () => {
    expect(
      effectiveTotalMinor({
        agreedTotalMinor: null,
        confirmedTotalMinor: 24_900,
        itemTotalMinor: 24_900,
      }),
    ).toBe(24_900);
  });

  it("preserves partial payment and excludes voided payment from calculations", () => {
    expect(
      calculateFinancials(24_000, [
        { amountMinor: 7_200, kind: "DEPOSIT", status: "ACTIVE" },
      ]),
    ).toEqual({ balanceMinor: 16_800, paidMinor: 7_200 });
    expect(
      calculateFinancials(24_000, [
        { amountMinor: 7_200, kind: "DEPOSIT", status: "VOIDED" },
      ]),
    ).toEqual({ balanceMinor: 24_000, paidMinor: 0 });
  });

  it("recalculates only commercial states and leaves fulfilment states intact", () => {
    expect(
      recalculatedCommercialStatus({
        currentStatus: "AWAITING_PAYMENT",
        effectiveTotalMinor: 24_000,
        paidMinor: 24_000,
        paymentPreference: "FULL_ADVANCE",
      }),
    ).toBe("PAID");
    expect(
      recalculatedCommercialStatus({
        currentStatus: "PAID",
        effectiveTotalMinor: 24_000,
        paidMinor: 0,
        paymentPreference: "FULL_ADVANCE",
      }),
    ).toBe("AWAITING_PAYMENT");
    expect(
      recalculatedCommercialStatus({
        currentStatus: "IN_TRANSIT",
        effectiveTotalMinor: 24_000,
        paidMinor: 0,
        paymentPreference: "FULL_ADVANCE",
      }),
    ).toBe("IN_TRANSIT");
    expect(
      requiredPrepaymentMinor(24_000, "DEPOSIT_30_BALANCE_ON_HANDOVER"),
    ).toBe(7_200);
  });
});

import { describe, expect, it } from "vitest";

import {
  calculateActualProfitability,
  calculatePlanningEconomics,
} from "./calculation";
import { ownerEconomics } from "./planning-data";

describe("unit economics", () => {
  it("recalculates every owner-supplied launch SKU without a landed-cost discrepancy", () => {
    expect(ownerEconomics).toHaveLength(22);
    expect(new Set(ownerEconomics.map((row) => row.internalCode)).size).toBe(
      22,
    );

    for (const row of ownerEconomics) {
      const result = calculatePlanningEconomics(row);
      expect(result.landedCostMatches, row.internalCode).toBe(true);
      expect(result.paymentCostMinor, row.internalCode).toBe(
        Math.round(row.retailSnapshotMinor * 0.03),
      );
      expect(result.targetAdCostMinor, row.internalCode).toBe(
        Math.round(row.retailSnapshotMinor * 0.1),
      );
      expect(result.plannedProfitMinor, row.internalCode).toBe(
        row.retailSnapshotMinor -
          row.landedCostEstimateMinor -
          result.paymentCostMinor -
          result.targetAdCostMinor,
      );
      expect(result.breakEvenCacMinor, row.internalCode).toBe(
        row.retailSnapshotMinor -
          row.landedCostEstimateMinor -
          result.paymentCostMinor,
      );
      expect(result.breakEvenRoas, row.internalCode).toBeCloseTo(
        row.retailSnapshotMinor / result.breakEvenCacMinor,
        10,
      );
    }
  });

  it("keeps the target ad assumption out of actual contribution", () => {
    expect(
      calculateActualProfitability({
        actualAdSpendMinor: 2_000,
        landedCostMinor: 12_900,
        paidCustomers: 1,
        paymentCostMinor: 777,
        revenueMinor: 25_900,
      }),
    ).toEqual({
      actualCacMinor: 2_000,
      actualMargin: 10_223 / 25_900,
      actualRoas: 12.95,
      contributionAfterAdsMinor: 10_223,
      contributionBeforeAdsMinor: 12_223,
    });
  });

  it("preserves the owner Jayden planning snapshot without rewriting catalog data", () => {
    const jayden = ownerEconomics.find(
      (row) => row.internalCode === "AL-LEGACY-015",
    );
    expect(jayden?.retailSnapshotMinor).toBe(18_900);
    expect(calculatePlanningEconomics(jayden!).plannedProfitMinor).toBe(8_443);
  });
});

export type PlanningEconomicsInput = {
  purchaseEstimateMinor: number;
  logisticsEstimateMinor: number;
  landedCostEstimateMinor: number;
  retailSnapshotMinor: number;
  paymentRateBps: number;
  targetAdRateBps: number;
};

export function applyRateBps(amountMinor: number, rateBps: number) {
  return Math.round((amountMinor * rateBps) / 10_000);
}

export function calculatePlanningEconomics(input: PlanningEconomicsInput) {
  const calculatedLandedCostMinor =
    input.purchaseEstimateMinor + input.logisticsEstimateMinor;
  const paymentCostMinor = applyRateBps(
    input.retailSnapshotMinor,
    input.paymentRateBps,
  );
  const targetAdCostMinor = applyRateBps(
    input.retailSnapshotMinor,
    input.targetAdRateBps,
  );
  const plannedProfitMinor =
    input.retailSnapshotMinor -
    input.landedCostEstimateMinor -
    paymentCostMinor -
    targetAdCostMinor;
  const breakEvenCacMinor =
    input.retailSnapshotMinor -
    input.landedCostEstimateMinor -
    paymentCostMinor;

  return {
    breakEvenCacMinor,
    breakEvenRoas:
      breakEvenCacMinor > 0
        ? input.retailSnapshotMinor / breakEvenCacMinor
        : null,
    calculatedLandedCostMinor,
    landedCostMatches:
      calculatedLandedCostMinor === input.landedCostEstimateMinor,
    paymentCostMinor,
    plannedMargin:
      input.retailSnapshotMinor > 0
        ? plannedProfitMinor / input.retailSnapshotMinor
        : null,
    plannedProfitMinor,
    targetAdCostMinor,
  };
}

export function calculateActualProfitability(input: {
  actualAdSpendMinor: number;
  landedCostMinor: number;
  paidCustomers: number;
  paymentCostMinor: number;
  revenueMinor: number;
}) {
  const contributionBeforeAdsMinor =
    input.revenueMinor - input.landedCostMinor - input.paymentCostMinor;
  const contributionAfterAdsMinor =
    contributionBeforeAdsMinor - input.actualAdSpendMinor;

  return {
    actualCacMinor:
      input.paidCustomers > 0
        ? Math.round(input.actualAdSpendMinor / input.paidCustomers)
        : null,
    actualMargin:
      input.revenueMinor > 0
        ? contributionAfterAdsMinor / input.revenueMinor
        : null,
    actualRoas:
      input.actualAdSpendMinor > 0
        ? input.revenueMinor / input.actualAdSpendMinor
        : null,
    contributionAfterAdsMinor,
    contributionBeforeAdsMinor,
  };
}

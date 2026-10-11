import type { PlanningEconomicsInput } from "./calculation";

export const ECONOMICS_EFFECTIVE_FROM = "2026-10-11T00:00:00.000Z";
export const ECONOMICS_VERSION = 1;
export const PAYMENT_RATE_BPS = 300;
export const TARGET_AD_RATE_BPS = 1_000;

type OwnerEconomics = PlanningEconomicsInput & {
  internalCode: string;
  productName: string;
};

function estimate(
  internalCode: string,
  productName: string,
  purchaseEuros: number,
  logisticsEuros: number,
  retailEuros: number,
): OwnerEconomics {
  return {
    internalCode,
    landedCostEstimateMinor: (purchaseEuros + logisticsEuros) * 100,
    logisticsEstimateMinor: logisticsEuros * 100,
    paymentRateBps: PAYMENT_RATE_BPS,
    productName,
    purchaseEstimateMinor: purchaseEuros * 100,
    retailSnapshotMinor: retailEuros * 100,
    targetAdRateBps: TARGET_AD_RATE_BPS,
  };
}

export const ownerEconomics = [
  estimate("AL-LEGACY-001", "Moncler Maya Down Jacket", 99, 30, 259),
  estimate(
    "AL-LEGACY-002",
    "Parajumpers Tyrik Hooded Puffer Jacket",
    105,
    30,
    289,
  ),
  estimate("AL-LEGACY-003", "Moncler Vezere Down Jacket", 100, 30, 279),
  estimate("AL-LEGACY-004", "Moncler Bormes Down Vest", 58, 22, 229),
  estimate("AL-LEGACY-005", "Parajumpers Jeordie Down Vest", 56, 22, 219),
  estimate("AL-LEGACY-007", "Moncler Galion Hooded Jacket", 60, 20, 219),
  estimate("AL-LEGACY-008", "Moncler Etiache Rain Jacket", 38, 18, 199),
  estimate("AL-LEGACY-009", "Moncler Cardigan Wool", 67, 18, 189),
  estimate("AL-LEGACY-010", "Moncler Gui Gilet", 38, 18, 199),
  estimate("AL-LEGACY-011", "Moncler Detachable Hood Cardigan", 67, 18, 209),
  estimate("AL-LEGACY-012", "Parajumpers Pharrell Hooded Bomber", 91, 25, 249),
  estimate(
    "AL-LEGACY-013",
    "Moncler Après Ski Knit Sleeves Puffer Jacket",
    80,
    22,
    239,
  ),
  estimate("AL-LEGACY-014", "Moncler Retro Knit Wool Cardigan", 65, 18, 199),
  estimate("AL-LEGACY-015", "Parajumpers Jayden Hybrid Cardigan", 62, 18, 189),
  estimate("AL-LEGACY-016", "Moncler Hooded Wool Cardigan", 78, 20, 219),
  estimate("AL-LEGACY-020", "Moncler Stripe Trim Zip Hoodie", 28, 15, 149),
  estimate("AL-LEGACY-021", "Moncler Hera Logo Patch Sweatshirt", 22, 12, 119),
  estimate("AL-LEGACY-017", "Moncler Basic T-Shirt", 14, 10, 69),
  estimate("AL-LEGACY-018", "Moncler Leather Badge T-Shirt", 16, 10, 79),
  estimate("AL-LEGACY-019", "Moncler Blurred Logo T-Shirt", 16, 10, 79),
  estimate("AL-LEGACY-022", "Moncler Polo Shirt", 16, 10, 79),
  estimate("AL-LEGACY-023", "Moncler Logo Patch Swimming Shorts", 20, 10, 69),
] as const satisfies readonly OwnerEconomics[];

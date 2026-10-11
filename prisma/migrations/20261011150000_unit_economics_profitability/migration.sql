-- Additive, private planning economics. No public catalog fields are changed.
CREATE TYPE "EconomicsSourceType" AS ENUM ('ESTIMATE');

CREATE TABLE "ProductEconomicsVersion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseEstimateMinor" INTEGER NOT NULL,
    "logisticsEstimateMinor" INTEGER NOT NULL,
    "landedCostEstimateMinor" INTEGER NOT NULL,
    "retailSnapshotMinor" INTEGER NOT NULL,
    "paymentRateBps" INTEGER NOT NULL,
    "targetAdRateBps" INTEGER NOT NULL,
    "sourceType" "EconomicsSourceType" NOT NULL DEFAULT 'ESTIMATE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductEconomicsVersion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AdSpend" ADD COLUMN "productId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "unitPurchaseCostMinorSnapshot" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "unitLogisticsCostMinorSnapshot" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "paymentRateBpsSnapshot" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "economicsVersionSnapshot" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "economicsSourceTypeSnapshot" "EconomicsSourceType";
ALTER TABLE "Payment" ADD COLUMN "processorFeeMinor" INTEGER;

CREATE UNIQUE INDEX "ProductEconomicsVersion_productId_version_key" ON "ProductEconomicsVersion"("productId", "version");
CREATE INDEX "ProductEconomicsVersion_productId_effectiveFrom_idx" ON "ProductEconomicsVersion"("productId", "effectiveFrom");
CREATE INDEX "AdSpend_productId_date_idx" ON "AdSpend"("productId", "date");

ALTER TABLE "ProductEconomicsVersion" ADD CONSTRAINT "ProductEconomicsVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdSpend" ADD CONSTRAINT "AdSpend_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductEconomicsVersion" ADD CONSTRAINT "ProductEconomicsVersion_nonnegative_values_check" CHECK (
    "purchaseEstimateMinor" >= 0 AND
    "logisticsEstimateMinor" >= 0 AND
    "landedCostEstimateMinor" >= 0 AND
    "retailSnapshotMinor" >= 0 AND
    "paymentRateBps" BETWEEN 0 AND 10000 AND
    "targetAdRateBps" BETWEEN 0 AND 10000 AND
    "version" > 0
);
ALTER TABLE "ProductEconomicsVersion" ADD CONSTRAINT "ProductEconomicsVersion_landed_sum_check" CHECK (
    "landedCostEstimateMinor" = "purchaseEstimateMinor" + "logisticsEstimateMinor"
);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_processor_fee_nonnegative_check" CHECK (
    "processorFeeMinor" IS NULL OR "processorFeeMinor" >= 0
);

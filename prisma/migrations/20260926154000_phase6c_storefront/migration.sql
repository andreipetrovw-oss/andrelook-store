-- Preserve the private-source -> reviewed-source -> approved-public-asset chain.
ALTER TABLE "ProductImage"
ADD COLUMN "sourceImageId" TEXT,
ADD COLUMN "reviewStatus" "SourceReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW';

CREATE INDEX "ProductImage_sourceImageId_idx" ON "ProductImage"("sourceImageId");

ALTER TABLE "ProductImage"
ADD CONSTRAINT "ProductImage_sourceImageId_fkey"
FOREIGN KEY ("sourceImageId") REFERENCES "ProductSourceImage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- The customer request is idempotent and records the exact consent context.
ALTER TABLE "Order"
ADD COLUMN "requestKey" TEXT,
ADD COLUMN "requestedLocale" "Locale",
ADD COLUMN "consentVersion" TEXT,
ADD COLUMN "consentAt" TIMESTAMP(3);

UPDATE "Order"
SET
  "requestKey" = 'legacy-' || "id",
  "requestedLocale" = 'RU',
  "consentVersion" = 'legacy-import',
  "consentAt" = "createdAt"
WHERE "requestKey" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "requestKey" SET NOT NULL,
ALTER COLUMN "requestedLocale" SET NOT NULL,
ALTER COLUMN "consentVersion" SET NOT NULL,
ALTER COLUMN "consentAt" SET NOT NULL;

CREATE UNIQUE INDEX "Order_requestKey_key" ON "Order"("requestKey");

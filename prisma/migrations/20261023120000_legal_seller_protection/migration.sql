-- Additive. Existing orders remain NULL and retain their original terms.
ALTER TABLE "Order" ADD COLUMN "legalRequestSnapshot" JSONB;

-- A declaration must be recorded even if the supplied order number does not match.
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "orderReference" TEXT NOT NULL,
    "consumerName" TEXT NOT NULL,
    "confirmationEmail" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "statementText" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerEmailStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "ownerEmailStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WithdrawalRequest_publicId_key" ON "WithdrawalRequest"("publicId");
CREATE UNIQUE INDEX "WithdrawalRequest_requestKey_key" ON "WithdrawalRequest"("requestKey");
CREATE INDEX "WithdrawalRequest_orderReference_submittedAt_idx" ON "WithdrawalRequest"("orderReference", "submittedAt");

-- Owner-confirmed correction for one published chart only. Historical order
-- snapshots and every other product/measurement remain untouched.
DO $$
DECLARE target_chart_id TEXT;
DECLARE current_length TEXT;
DECLARE target_label TEXT;
DECLARE target_size TEXT;
BEGIN
  SELECT sc."id", sc."chartData" #>> '{measurements,1,values,2}',
         sc."chartData" #>> '{measurements,1,name}',
         sc."chartData" #>> '{sizes,2}'
    INTO target_chart_id, current_length, target_label, target_size
    FROM "SizeChart" sc
    JOIN "Product" p ON p."id" = sc."productId"
   WHERE p."internalCode" = 'AL-LEGACY-015';
  IF target_chart_id IS NOT NULL AND (
    target_label IS DISTINCT FROM 'Clothes length' OR
    target_size IS DISTINCT FROM 'L/3' OR
    current_length IS DISTINCT FROM '79' AND current_length IS DISTINCT FROM '69'
  ) THEN
    RAISE EXCEPTION 'Jayden size chart did not match the expected correction target';
  END IF;
  IF current_length = '79' THEN
    UPDATE "SizeChart"
       SET "chartData" = jsonb_set("chartData", '{measurements,1,values,2}', '69'::jsonb),
           "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = target_chart_id;
  END IF;
  UPDATE "SizeChartEvidence"
     SET "notes" = jsonb_set(
       "notes", '{0}',
       to_jsonb('Source image prints 79 for L/3 Clothes length; owner-confirmed typo correction on 2026-10-23 sets this value to 69. All other source measurements remain unchanged.'::text)
     )
   WHERE "sizeChartId" = target_chart_id
     AND "notes" ->> 0 = 'L Clothes length is visibly printed as 79 between M=67 and XL=71; preserved exactly and flagged SOURCE INCONSISTENCY.';
END $$;

-- Reuse the previously designed independent legal statement store.
-- IF NOT EXISTS preserves the same table already installed by the old legal
-- staging pilot. No old migration, order alteration or catalog correction is replayed.
CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "WithdrawalRequest_publicId_key" ON "WithdrawalRequest"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "WithdrawalRequest_requestKey_key" ON "WithdrawalRequest"("requestKey");
CREATE INDEX IF NOT EXISTS "WithdrawalRequest_orderReference_submittedAt_idx" ON "WithdrawalRequest"("orderReference", "submittedAt");

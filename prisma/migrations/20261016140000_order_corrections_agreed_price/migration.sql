-- Additive owner-only order correction and payment audit support.
CREATE TYPE "PaymentStatus" AS ENUM ('ACTIVE', 'VOIDED');

ALTER TABLE "Order"
  ADD COLUMN "agreedTotalMinor" INTEGER,
  ADD COLUMN "customerNotes" TEXT;

ALTER TABLE "OrderBusinessEvent"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Payment"
  ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "voidedAt" TIMESTAMP(3),
  ADD COLUMN "voidReason" TEXT,
  ADD COLUMN "voidedByAdminId" TEXT;

CREATE TABLE "OrderCorrectionHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "changedField" TEXT NOT NULL,
  "previousValue" JSONB,
  "newValue" JSONB,
  "changedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderCorrectionHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Payment_orderId_status_idx"
  ON "Payment"("orderId", "status");
CREATE INDEX "OrderCorrectionHistory_orderId_createdAt_idx"
  ON "OrderCorrectionHistory"("orderId", "createdAt");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_voidedByAdminId_fkey"
  FOREIGN KEY ("voidedByAdminId") REFERENCES "AdminUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrderCorrectionHistory"
  ADD CONSTRAINT "OrderCorrectionHistory_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderCorrectionHistory"
  ADD CONSTRAINT "OrderCorrectionHistory_changedByAdminId_fkey"
  FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

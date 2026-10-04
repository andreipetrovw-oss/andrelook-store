CREATE TYPE "FulfilmentMethod" AS ENUM ('PERSONAL_HANDOVER', 'DELIVERY');
CREATE TYPE "PaymentPreference" AS ENUM ('DEPOSIT_30_BALANCE_ON_HANDOVER', 'FULL_ADVANCE');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

ALTER TABLE "Customer"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT;

ALTER TABLE "Order"
  ADD COLUMN "fulfilmentMethod" "FulfilmentMethod",
  ADD COLUMN "paymentPreference" "PaymentPreference",
  ADD COLUMN "countryCode" CHAR(2),
  ADD COLUMN "city" TEXT,
  ADD COLUMN "postalCode" TEXT,
  ADD COLUMN "addressLine1" TEXT,
  ADD COLUMN "addressLine2" TEXT;

ALTER TABLE "OrderItem"
  ADD COLUMN "sizeHelpRequested" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "measurementsNote" TEXT;

CREATE TABLE "OrderNotification" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "recipient" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderNotification_orderId_key" ON "OrderNotification"("orderId");
CREATE INDEX "OrderNotification_status_updatedAt_idx" ON "OrderNotification"("status", "updatedAt");

ALTER TABLE "OrderNotification"
  ADD CONSTRAINT "OrderNotification_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

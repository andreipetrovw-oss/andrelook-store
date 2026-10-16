CREATE TYPE "TrackingEtaSource" AS ENUM ('PROVIDER', 'OFFICIAL_CARRIER', 'OWNER_CONFIRMED', 'SYSTEM_ESTIMATE');
CREATE TYPE "TrackingEtaConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "OrderTrackingMilestoneKind" AS ENUM ('ORDER_CONFIRMED', 'PAYMENT_RECEIVED', 'PREPARATION_STARTED', 'QUALITY_CHECK_RECEIVED', 'QUALITY_CHECK_APPROVED', 'PACKING_CONFIRMED', 'INTERNATIONAL_DISPATCH_CONFIRMED');

ALTER TABLE "Order"
  ADD COLUMN "trackingAccessCodeHash" TEXT,
  ADD COLUMN "trackingAccessCodeEncrypted" TEXT,
  ADD COLUMN "trackingCredentialsRotatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_trackingAccessCodeHash_key" ON "Order"("trackingAccessCodeHash");

ALTER TABLE "Shipment"
  ADD COLUMN "etaFrom" TIMESTAMP(3),
  ADD COLUMN "etaTo" TIMESTAMP(3),
  ADD COLUMN "etaConfidence" "TrackingEtaConfidence",
  ADD COLUMN "etaWindowSource" "TrackingEtaSource",
  ADD COLUMN "etaEvidenceNote" TEXT;

CREATE TABLE "OrderTrackingMilestone" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "kind" "OrderTrackingMilestoneKind" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "evidenceSource" "TrackingEvidenceSource" NOT NULL,
  "evidenceNote" TEXT NOT NULL,
  "customerVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderTrackingMilestone_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderTrackingMilestone_orderId_occurredAt_idx" ON "OrderTrackingMilestone"("orderId", "occurredAt");

ALTER TABLE "OrderTrackingMilestone"
  ADD CONSTRAINT "OrderTrackingMilestone_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderTrackingMilestone"
  ADD CONSTRAINT "OrderTrackingMilestone_createdByAdminId_fkey"
  FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

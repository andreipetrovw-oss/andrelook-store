ALTER TYPE "TrackingEvidenceSource" ADD VALUE 'OWNER_VERIFIED_LOGISTICS';
ALTER TYPE "TrackingEtaSource" ADD VALUE 'OWNER_VERIFIED_LOGISTICS';

CREATE TYPE "LogisticsEvidenceSourceType" AS ENUM (
  'OWNER_VERIFIED_LOGISTICS',
  'SUPPORTED_UPSTREAM_PROVIDER'
);

CREATE TYPE "LogisticsEvidenceVerificationStatus" AS ENUM (
  'PENDING_REVIEW',
  'VERIFIED',
  'VOIDED'
);

CREATE TYPE "LogisticsEvidenceEventType" AS ENUM (
  'LOGISTICS_INSTRUCTION_PROVIDED',
  'LOGISTICS_INFORMATION_RECEIVED',
  'MOVING_TO_CARRIER_WAREHOUSE',
  'INTERNATIONAL_LOGISTICS_ACCEPTED',
  'AIR_TRANSPORT_HANDOFF',
  'FLIGHT_BOOKED',
  'INTERNATIONAL_TRANSIT_STARTED',
  'ARRIVED_IN_EUROPE',
  'EUROPE_PROCESSING_AWAITING_CUSTOMS',
  'ESTIMATED_ARRIVAL'
);

CREATE TYPE "ShipmentIdentifierRole" AS ENUM (
  'UPSTREAM_INTERNATIONAL',
  'PRIMARY_CARRIER',
  'LOCAL_LAST_MILE'
);

CREATE TABLE "ShipmentLogisticsEvidence" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "sourceType" "LogisticsEvidenceSourceType" NOT NULL,
  "sourceLabel" TEXT NOT NULL,
  "eventType" "LogisticsEvidenceEventType" NOT NULL,
  "eventTimestamp" TIMESTAMP(3),
  "sourceTimestampText" TEXT,
  "sourceTimeZone" TEXT,
  "internalLocation" TEXT,
  "evidenceNote" TEXT NOT NULL,
  "verificationStatus" "LogisticsEvidenceVerificationStatus" NOT NULL DEFAULT 'VERIFIED',
  "customerVisible" BOOLEAN NOT NULL DEFAULT true,
  "internalReference" TEXT,
  "canonicalKey" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "supersedesId" TEXT,
  "createdByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShipmentLogisticsEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShipmentTrackingIdentifier" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "role" "ShipmentIdentifierRole" NOT NULL,
  "provider" "ShipmentProvider",
  "sourceLabel" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retiredAt" TIMESTAMP(3),

  CONSTRAINT "ShipmentTrackingIdentifier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShipmentLogisticsEvidence_supersedesId_key"
  ON "ShipmentLogisticsEvidence"("supersedesId");
CREATE UNIQUE INDEX "ShipmentLogisticsEvidence_shipmentId_canonicalKey_revision_key"
  ON "ShipmentLogisticsEvidence"("shipmentId", "canonicalKey", "revision");
CREATE INDEX "ShipmentLogisticsEvidence_shipmentId_eventTimestamp_idx"
  ON "ShipmentLogisticsEvidence"("shipmentId", "eventTimestamp");
CREATE INDEX "ShipmentLogisticsEvidence_shipmentId_verificationStatus_idx"
  ON "ShipmentLogisticsEvidence"("shipmentId", "verificationStatus");

CREATE UNIQUE INDEX "ShipmentTrackingIdentifier_shipmentId_value_key"
  ON "ShipmentTrackingIdentifier"("shipmentId", "value");
CREATE INDEX "ShipmentTrackingIdentifier_shipmentId_role_isActive_idx"
  ON "ShipmentTrackingIdentifier"("shipmentId", "role", "isActive");

ALTER TABLE "ShipmentLogisticsEvidence"
  ADD CONSTRAINT "ShipmentLogisticsEvidence_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShipmentLogisticsEvidence"
  ADD CONSTRAINT "ShipmentLogisticsEvidence_supersedesId_fkey"
  FOREIGN KEY ("supersedesId") REFERENCES "ShipmentLogisticsEvidence"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShipmentLogisticsEvidence"
  ADD CONSTRAINT "ShipmentLogisticsEvidence_createdByAdminId_fkey"
  FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShipmentTrackingIdentifier"
  ADD CONSTRAINT "ShipmentTrackingIdentifier_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

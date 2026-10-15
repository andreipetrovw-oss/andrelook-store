CREATE TYPE "DeliveryMode" AS ENUM ('PERSONAL_HANDOVER', 'ESTONIA_DELIVERY', 'INTERNATIONAL_DELIVERY');
CREATE TYPE "ShipmentKind" AS ENUM ('INTERNATIONAL_INBOUND', 'LOCAL_OUTBOUND');
CREATE TYPE "ShipmentProvider" AS ENUM ('SEVENTEEN_TRACK', 'SHIP24', 'LOCAL_CARRIER', 'MANUAL');
CREATE TYPE "ShipmentSyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILURE', 'NOT_FOUND', 'UNAVAILABLE');
CREATE TYPE "ShipmentStatus" AS ENUM ('ORDER_CONFIRMED', 'PREPARING_ORDER', 'QUALITY_CHECK_COMPLETE', 'HANDED_TO_LOGISTICS', 'INTERNATIONAL_TRANSIT', 'EUROPEAN_LOGISTICS', 'ARRIVED_AT_ANDRELOOK', 'READY_FOR_HANDOVER', 'LOCAL_CARRIER', 'LOCAL_DELIVERY', 'DELIVERED', 'DELAYED_OR_EXCEPTION');
CREATE TYPE "TrackingEvidenceSource" AS ENUM ('OWNER_CONFIRMED', 'WAREHOUSE_CONFIRMED', 'PROVIDER_EVENT', 'LOCAL_CARRIER_EVENT', 'MANUAL_OVERRIDE');
CREATE TYPE "ShipmentRelationship" AS ENUM ('MASTER_INBOUND', 'LOCAL_OUTBOUND', 'CARRIER_OUTBOUND');

ALTER TABLE "Order"
  ADD COLUMN "deliveryMode" "DeliveryMode",
  ADD COLUMN "publicTrackingToken" TEXT;

CREATE UNIQUE INDEX "Order_publicTrackingToken_key" ON "Order"("publicTrackingToken");

CREATE TABLE "Shipment" (
  "id" TEXT NOT NULL,
  "kind" "ShipmentKind" NOT NULL,
  "provider" "ShipmentProvider" NOT NULL,
  "fallbackProvider" "ShipmentProvider",
  "internalTrackingNumber" TEXT NOT NULL,
  "providerTrackingId" TEXT,
  "fallbackTrackingId" TEXT,
  "detectedCarrierCode" TEXT,
  "detectedCarrierName" TEXT,
  "fallbackDetectedCarrierCode" TEXT,
  "fallbackDetectedCarrierName" TEXT,
  "normalizedStatus" "ShipmentStatus" NOT NULL DEFAULT 'ORDER_CONFIRMED',
  "rawStatus" TEXT,
  "fallbackRawStatus" TEXT,
  "providerSyncStatus" "ShipmentSyncStatus" NOT NULL DEFAULT 'PENDING',
  "providerLastError" TEXT,
  "fallbackSyncStatus" "ShipmentSyncStatus",
  "fallbackLastError" TEXT,
  "estimatedDeliveryAt" TIMESTAMP(3),
  "etaSource" "TrackingEvidenceSource",
  "etaNote" TEXT,
  "etaConfirmedAt" TIMESTAMP(3),
  "lastProviderUpdateAt" TIMESTAMP(3),
  "fallbackLastProviderUpdateAt" TIMESTAMP(3),
  "lastConfirmedEventAt" TIMESTAMP(3),
  "lastSyncAt" TIMESTAMP(3),
  "lastSuccessfulSyncAt" TIMESTAMP(3),
  "fallbackLastSyncAt" TIMESTAMP(3),
  "fallbackLastSuccessfulSyncAt" TIMESTAMP(3),
  "staleAfterDays" INTEGER NOT NULL DEFAULT 7,
  "staleFlag" BOOLEAN NOT NULL DEFAULT false,
  "deliveredAt" TIMESTAMP(3),
  "publicCarrierName" TEXT,
  "publicTrackingNumber" TEXT,
  "exposePublicTracking" BOOLEAN NOT NULL DEFAULT false,
  "requiresOwnerReview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderShipment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "relationship" "ShipmentRelationship" NOT NULL,
  "sequence" INTEGER NOT NULL DEFAULT 0,
  "customerVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderShipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackingProviderRecord" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "provider" "ShipmentProvider" NOT NULL,
  "providerRecordId" TEXT,
  "contentHash" TEXT NOT NULL,
  "syncStatus" "ShipmentSyncStatus" NOT NULL,
  "carrierCode" TEXT,
  "carrierName" TEXT,
  "latestEventAt" TIMESTAMP(3),
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackingProviderRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackingEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "provider" "ShipmentProvider",
  "providerEventId" TEXT NOT NULL,
  "evidenceSource" "TrackingEvidenceSource" NOT NULL,
  "normalizedStatus" "ShipmentStatus" NOT NULL,
  "rawStatus" TEXT,
  "rawDescription" TEXT,
  "rawLocation" TEXT,
  "rawTimestamp" TIMESTAMP(3),
  "publicTimestamp" TIMESTAMP(3),
  "customerVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShipmentStatusOverride" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "fromStatus" "ShipmentStatus" NOT NULL,
  "toStatus" "ShipmentStatus" NOT NULL,
  "evidenceSource" "TrackingEvidenceSource" NOT NULL,
  "reason" TEXT NOT NULL,
  "changedByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShipmentStatusOverride_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackingMilestoneNotification" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "shipmentId" TEXT,
  "milestone" "ShipmentStatus" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "recipient" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'resend',
  "providerMessageId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrackingMilestoneNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackingLookupBucket" (
  "keyHash" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrackingLookupBucket_pkey" PRIMARY KEY ("keyHash")
);

CREATE UNIQUE INDEX "Shipment_internalTrackingNumber_key" ON "Shipment"("internalTrackingNumber");
CREATE INDEX "Shipment_normalizedStatus_staleFlag_idx" ON "Shipment"("normalizedStatus", "staleFlag");
CREATE INDEX "Shipment_providerSyncStatus_lastSyncAt_idx" ON "Shipment"("providerSyncStatus", "lastSyncAt");
CREATE UNIQUE INDEX "OrderShipment_orderId_shipmentId_key" ON "OrderShipment"("orderId", "shipmentId");
CREATE INDEX "OrderShipment_shipmentId_sequence_idx" ON "OrderShipment"("shipmentId", "sequence");
CREATE INDEX "OrderShipment_orderId_sequence_idx" ON "OrderShipment"("orderId", "sequence");
CREATE UNIQUE INDEX "TrackingProviderRecord_shipmentId_provider_contentHash_key" ON "TrackingProviderRecord"("shipmentId", "provider", "contentHash");
CREATE INDEX "TrackingProviderRecord_shipmentId_receivedAt_idx" ON "TrackingProviderRecord"("shipmentId", "receivedAt");
CREATE UNIQUE INDEX "TrackingEvent_shipmentId_evidenceSource_providerEventId_key" ON "TrackingEvent"("shipmentId", "evidenceSource", "providerEventId");
CREATE INDEX "TrackingEvent_shipmentId_rawTimestamp_idx" ON "TrackingEvent"("shipmentId", "rawTimestamp");
CREATE INDEX "TrackingEvent_shipmentId_publicTimestamp_idx" ON "TrackingEvent"("shipmentId", "publicTimestamp");
CREATE INDEX "ShipmentStatusOverride_shipmentId_createdAt_idx" ON "ShipmentStatusOverride"("shipmentId", "createdAt");
CREATE UNIQUE INDEX "TrackingMilestoneNotification_orderId_shipmentId_milestone_key" ON "TrackingMilestoneNotification"("orderId", "shipmentId", "milestone");
CREATE INDEX "TrackingMilestoneNotification_status_updatedAt_idx" ON "TrackingMilestoneNotification"("status", "updatedAt");

ALTER TABLE "OrderShipment" ADD CONSTRAINT "OrderShipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderShipment" ADD CONSTRAINT "OrderShipment_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackingProviderRecord" ADD CONSTRAINT "TrackingProviderRecord_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShipmentStatusOverride" ADD CONSTRAINT "ShipmentStatusOverride_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentStatusOverride" ADD CONSTRAINT "ShipmentStatusOverride_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrackingMilestoneNotification" ADD CONSTRAINT "TrackingMilestoneNotification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackingMilestoneNotification" ADD CONSTRAINT "TrackingMilestoneNotification_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

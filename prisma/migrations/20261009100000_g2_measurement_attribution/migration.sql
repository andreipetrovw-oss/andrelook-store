-- G2 adds isolated attribution, business-event, campaign and spend records.
-- Existing orders are intentionally not backfilled: historical sources remain unknown
-- unless evidence was captured at the time of submission.

CREATE TYPE "TrafficSource" AS ENUM ('UNKNOWN', 'META_ADS', 'GOOGLE_ADS', 'INSTAGRAM_ORGANIC', 'FACEBOOK_ORGANIC', 'TELEGRAM', 'GOOGLE_ORGANIC', 'BING_ORGANIC', 'AI_CHATGPT', 'REFERRAL', 'DIRECT', 'OTHER', 'EMAIL', 'PARTNER', 'MARKETPLACE');

CREATE TYPE "SourceGroup" AS ENUM ('PAID', 'ORGANIC', 'OWNED', 'REFERRAL', 'DIRECT', 'OTHER', 'UNKNOWN');

CREATE TYPE "AttributionTouchType" AS ENUM ('FIRST', 'LAST');

CREATE TYPE "BusinessEventType" AS ENUM ('LEAD_CREATED', 'LEAD_CONTACTED', 'LEAD_CONFIRMED', 'AWAITING_PAYMENT', 'PAID', 'ORDERED', 'IN_TRANSIT', 'READY', 'DELIVERED', 'CANCELLED');

CREATE TYPE "CampaignStatus" AS ENUM ('UNKNOWN', 'ACTIVE', 'PAUSED', 'ENDED');

CREATE TYPE "SpendImportSource" AS ENUM ('MANUAL', 'CSV', 'API');

CREATE TABLE "OrderAttribution" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "attributionWindowDays" INTEGER NOT NULL DEFAULT 30,
    "consentVersion" TEXT NOT NULL,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderAttribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttributionTouch" (
    "id" TEXT NOT NULL,
    "orderAttributionId" TEXT NOT NULL,
    "touchType" "AttributionTouchType" NOT NULL,
    "source" "TrafficSource" NOT NULL,
    "sourceGroup" "SourceGroup" NOT NULL,
    "campaignName" TEXT,
    "adSetName" TEXT,
    "adName" TEXT,
    "contentLabel" TEXT,
    "landingPage" TEXT,
    "referrer" TEXT,
    "locale" "Locale" NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "fbp" TEXT,
    "fbc" TEXT,
    "gaClientId" TEXT,
    "gaSessionId" TEXT,
    "eventId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttributionTouch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderBusinessEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" "BusinessEventType" NOT NULL,
    "eventKey" TEXT NOT NULL,
    "amountMinor" INTEGER,
    "currency" CHAR(3),
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderBusinessEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "source" "TrafficSource" NOT NULL,
    "externalCampaignId" TEXT,
    "campaignName" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'UNKNOWN',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdSpend" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" "TrafficSource" NOT NULL,
    "campaignId" TEXT,
    "campaignName" TEXT,
    "externalAdSetId" TEXT,
    "adSetName" TEXT,
    "externalAdId" TEXT,
    "adName" TEXT,
    "currency" CHAR(3) NOT NULL,
    "spendMinor" INTEGER NOT NULL,
    "importSource" "SpendImportSource" NOT NULL DEFAULT 'MANUAL',
    "externalRecordId" TEXT,
    "recordedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdSpend_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderAttribution_orderId_key" ON "OrderAttribution"("orderId");
CREATE INDEX "AttributionTouch_source_occurredAt_idx" ON "AttributionTouch"("source", "occurredAt");
CREATE INDEX "AttributionTouch_campaignName_occurredAt_idx" ON "AttributionTouch"("campaignName", "occurredAt");
CREATE UNIQUE INDEX "AttributionTouch_orderAttributionId_touchType_key" ON "AttributionTouch"("orderAttributionId", "touchType");
CREATE UNIQUE INDEX "OrderBusinessEvent_eventKey_key" ON "OrderBusinessEvent"("eventKey");
CREATE INDEX "OrderBusinessEvent_eventType_occurredAt_idx" ON "OrderBusinessEvent"("eventType", "occurredAt");
CREATE INDEX "OrderBusinessEvent_orderId_occurredAt_idx" ON "OrderBusinessEvent"("orderId", "occurredAt");
CREATE INDEX "Campaign_source_status_idx" ON "Campaign"("source", "status");
CREATE UNIQUE INDEX "Campaign_source_campaignName_key" ON "Campaign"("source", "campaignName");
CREATE UNIQUE INDEX "AdSpend_externalRecordId_key" ON "AdSpend"("externalRecordId");
CREATE INDEX "AdSpend_date_source_idx" ON "AdSpend"("date", "source");
CREATE INDEX "AdSpend_campaignId_date_idx" ON "AdSpend"("campaignId", "date");

ALTER TABLE "OrderAttribution" ADD CONSTRAINT "OrderAttribution_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttributionTouch" ADD CONSTRAINT "AttributionTouch_orderAttributionId_fkey" FOREIGN KEY ("orderAttributionId") REFERENCES "OrderAttribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderBusinessEvent" ADD CONSTRAINT "OrderBusinessEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdSpend" ADD CONSTRAINT "AdSpend_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdSpend" ADD CONSTRAINT "AdSpend_recordedByAdminId_fkey" FOREIGN KEY ("recordedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

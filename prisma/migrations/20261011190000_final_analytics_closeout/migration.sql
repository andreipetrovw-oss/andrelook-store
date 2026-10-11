-- Add private, additive analytics storage. Historical values intentionally remain NULL/unavailable.
CREATE TYPE "AnalyticsEventName" AS ENUM ('PAGE_VIEW', 'VIEW_ITEM_LIST', 'SELECT_ITEM', 'VIEW_ITEM', 'PREORDER_OPEN', 'PREORDER_SUBMIT');

ALTER TABLE "AdSpend"
ADD COLUMN "impressions" INTEGER,
ADD COLUMN "reach" INTEGER,
ADD COLUMN "linkClicks" INTEGER,
ADD COLUMN "outboundClicks" INTEGER,
ADD COLUMN "landingPageViews" INTEGER;

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventName" "AnalyticsEventName" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "TrafficSource" NOT NULL,
    "sourceGroup" "SourceGroup" NOT NULL,
    "campaignName" TEXT,
    "adSetName" TEXT,
    "adName" TEXT,
    "contentLabel" TEXT,
    "landingPage" TEXT,
    "pagePath" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsDataSourceStatus" (
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,
    "lastSuccessAt" TIMESTAMP(3),
    "lastImportedRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsDataSourceStatus_pkey" PRIMARY KEY ("source")
);

CREATE UNIQUE INDEX "AnalyticsEvent_eventId_key" ON "AnalyticsEvent"("eventId");
CREATE INDEX "AnalyticsEvent_eventName_occurredAt_idx" ON "AnalyticsEvent"("eventName", "occurredAt");
CREATE INDEX "AnalyticsEvent_source_occurredAt_idx" ON "AnalyticsEvent"("source", "occurredAt");
CREATE INDEX "AnalyticsEvent_campaignName_occurredAt_idx" ON "AnalyticsEvent"("campaignName", "occurredAt");
CREATE INDEX "AnalyticsEvent_landingPage_occurredAt_idx" ON "AnalyticsEvent"("landingPage", "occurredAt");
CREATE INDEX "AnalyticsEvent_productId_occurredAt_idx" ON "AnalyticsEvent"("productId", "occurredAt");
CREATE INDEX "AnalyticsEvent_sessionId_occurredAt_idx" ON "AnalyticsEvent"("sessionId", "occurredAt");
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

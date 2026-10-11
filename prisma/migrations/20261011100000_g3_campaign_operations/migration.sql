-- G3 campaign mapping and owner operations log.
ALTER TABLE "Campaign" ADD COLUMN "utmCampaign" TEXT;

CREATE TABLE "CampaignChangeLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignName" TEXT NOT NULL,
    "change" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL,
    "recordedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CampaignChangeLog_changedAt_idx" ON "CampaignChangeLog"("changedAt");
CREATE INDEX "CampaignChangeLog_campaignId_changedAt_idx" ON "CampaignChangeLog"("campaignId", "changedAt");

ALTER TABLE "CampaignChangeLog" ADD CONSTRAINT "CampaignChangeLog_campaignId_fkey"
FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CampaignChangeLog" ADD CONSTRAINT "CampaignChangeLog_recordedByAdminId_fkey"
FOREIGN KEY ("recordedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

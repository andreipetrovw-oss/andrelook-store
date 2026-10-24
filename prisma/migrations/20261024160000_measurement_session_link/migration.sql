ALTER TABLE "OrderAttribution" ADD COLUMN "websiteSessionId" TEXT;
CREATE INDEX "OrderAttribution_websiteSessionId_idx" ON "OrderAttribution"("websiteSessionId");

-- Additive verified reviews. Existing business and tracking tables are untouched.
CREATE TYPE "ReviewStatus" AS ENUM ('SUBMITTED', 'PUBLISHED', 'REJECTED', 'UNPUBLISHED');
CREATE TYPE "ReviewKind" AS ENUM ('SERVICE', 'PRODUCT');

CREATE TABLE "ReviewInvitation" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "tokenEncrypted" TEXT NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "requestedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rotatedAt" TIMESTAMP(3),
  CONSTRAINT "ReviewInvitation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CustomerReview" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "kind" "ReviewKind" NOT NULL DEFAULT 'SERVICE',
  "productId" TEXT,
  "orderItemId" TEXT,
  "productNameSnapshot" TEXT,
  "locale" "Locale" NOT NULL,
  "rating" INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "originalText" TEXT NOT NULL,
  "publicText" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "qualityRating" INTEGER CHECK ("qualityRating" BETWEEN 1 AND 5),
  "communicationRating" INTEGER CHECK ("communicationRating" BETWEEN 1 AND 5),
  "deliveryRating" INTEGER CHECK ("deliveryRating" BETWEEN 1 AND 5),
  "status" "ReviewStatus" NOT NULL DEFAULT 'SUBMITTED',
  "publicationConsentAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewModerationHistory" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT,
  "invitationId" TEXT NOT NULL,
  "actorEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "previousText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewModerationHistory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewRateLimit" (
  "keyHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "windowStart" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReviewRateLimit_pkey" PRIMARY KEY ("keyHash")
);
CREATE UNIQUE INDEX "ReviewInvitation_orderId_key" ON "ReviewInvitation"("orderId");
CREATE UNIQUE INDEX "ReviewInvitation_tokenHash_key" ON "ReviewInvitation"("tokenHash");
CREATE UNIQUE INDEX "CustomerReview_publicId_key" ON "CustomerReview"("publicId");
CREATE UNIQUE INDEX "CustomerReview_invitationId_key" ON "CustomerReview"("invitationId");
CREATE UNIQUE INDEX "CustomerReview_orderItemId_key" ON "CustomerReview"("orderItemId");
CREATE INDEX "CustomerReview_status_submittedAt_idx" ON "CustomerReview"("status", "submittedAt");
CREATE INDEX "CustomerReview_productId_status_idx" ON "CustomerReview"("productId", "status");
CREATE INDEX "ReviewModerationHistory_invitationId_createdAt_idx" ON "ReviewModerationHistory"("invitationId", "createdAt");
CREATE INDEX "ReviewRateLimit_windowStart_idx" ON "ReviewRateLimit"("windowStart");
ALTER TABLE "ReviewInvitation" ADD CONSTRAINT "ReviewInvitation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "ReviewInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReviewModerationHistory" ADD CONSTRAINT "ReviewModerationHistory_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CustomerReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReviewModerationHistory" ADD CONSTRAINT "ReviewModerationHistory_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "ReviewInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

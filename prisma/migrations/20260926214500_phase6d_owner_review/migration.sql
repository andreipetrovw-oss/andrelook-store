CREATE TYPE "ReviewDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'FRONT';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'BACK';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'SIDE';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'ALTERNATIVE';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'INTERIOR';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'BRANDING';
ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'ADDITIONAL';

ALTER TABLE "ProductImage" ADD COLUMN "approvedByAdminId" TEXT;

CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "identityDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "categoryDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "visualDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "sizeDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "contentDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "commercialDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "optionsDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "imageDecision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "blockingIssues" JSONB,
    "ownerPublicationApproved" BOOLEAN NOT NULL DEFAULT false,
    "ownerApprovedAt" TIMESTAMP(3),
    "reviewedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductReviewEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "changedByAdminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReviewEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductReview_productId_key" ON "ProductReview"("productId");
CREATE INDEX "ProductReview_ownerPublicationApproved_idx" ON "ProductReview"("ownerPublicationApproved");
CREATE INDEX "ProductReview_reviewedByAdminId_idx" ON "ProductReview"("reviewedByAdminId");
CREATE INDEX "ProductReviewEvent_productId_createdAt_idx" ON "ProductReviewEvent"("productId", "createdAt");
CREATE INDEX "ProductReviewEvent_changedByAdminId_createdAt_idx" ON "ProductReviewEvent"("changedByAdminId", "createdAt");
CREATE INDEX "ProductImage_approvedByAdminId_idx" ON "ProductImage"("approvedByAdminId");

ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductReviewEvent" ADD CONSTRAINT "ProductReviewEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductReviewEvent" ADD CONSTRAINT "ProductReviewEvent_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

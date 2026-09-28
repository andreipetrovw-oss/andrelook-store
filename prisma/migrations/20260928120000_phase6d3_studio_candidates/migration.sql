-- Phase 6D.3: private, traceable Studio candidates remain separate from public ProductImage records.
CREATE TYPE "StudioCandidateStatus" AS ENUM ('NEEDS_REVIEW', 'NEEDS_REVISION', 'REJECTED', 'OWNER_APPROVED');

CREATE TABLE "StudioCandidate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "role" "ImageRole" NOT NULL,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "privateBlobUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" "StudioCandidateStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "referencePack" JSONB NOT NULL,
    "technicalQa" JSONB NOT NULL,
    "fidelityChecklist" JSONB,
    "engineeringNotes" TEXT,
    "ownerNote" TEXT,
    "ownerReviewedAt" TIMESTAMP(3),
    "ownerReviewedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudioCandidateSource" (
    "candidateId" TEXT NOT NULL,
    "sourceImageId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudioCandidateSource_pkey" PRIMARY KEY ("candidateId","sourceImageId")
);

CREATE UNIQUE INDEX "StudioCandidate_storageKey_key" ON "StudioCandidate"("storageKey");
CREATE UNIQUE INDEX "StudioCandidate_privateBlobUrl_key" ON "StudioCandidate"("privateBlobUrl");
CREATE UNIQUE INDEX "StudioCandidate_productId_role_version_key" ON "StudioCandidate"("productId", "role", "version");
CREATE INDEX "StudioCandidate_productId_status_role_idx" ON "StudioCandidate"("productId", "status", "role");
CREATE INDEX "StudioCandidate_ownerReviewedByAdminId_idx" ON "StudioCandidate"("ownerReviewedByAdminId");
CREATE INDEX "StudioCandidateSource_sourceImageId_idx" ON "StudioCandidateSource"("sourceImageId");

ALTER TABLE "StudioCandidate" ADD CONSTRAINT "StudioCandidate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioCandidate" ADD CONSTRAINT "StudioCandidate_ownerReviewedByAdminId_fkey" FOREIGN KEY ("ownerReviewedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudioCandidateSource" ADD CONSTRAINT "StudioCandidateSource_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "StudioCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioCandidateSource" ADD CONSTRAINT "StudioCandidateSource_sourceImageId_fkey" FOREIGN KEY ("sourceImageId") REFERENCES "ProductSourceImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TYPE "ImageRole" ADD VALUE IF NOT EXISTS 'HARDWARE';

CREATE TABLE "OrderAuditEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "changedByAdminId" TEXT,
    "action" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderAuditEvent_orderId_createdAt_idx" ON "OrderAuditEvent"("orderId", "createdAt");
CREATE INDEX "OrderAuditEvent_changedByAdminId_createdAt_idx" ON "OrderAuditEvent"("changedByAdminId", "createdAt");

ALTER TABLE "OrderAuditEvent" ADD CONSTRAINT "OrderAuditEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderAuditEvent" ADD CONSTRAINT "OrderAuditEvent_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

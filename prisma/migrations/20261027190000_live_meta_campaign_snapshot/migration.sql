-- Additive private reporting snapshot. No orders/payments/attribution rewritten.
ALTER TABLE "Campaign" ADD COLUMN "metaSnapshot" JSONB,
ADD COLUMN "metaSyncedAt" TIMESTAMP(3);

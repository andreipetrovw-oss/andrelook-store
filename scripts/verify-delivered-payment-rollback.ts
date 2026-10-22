// Real PostgreSQL integration check; every fixture and financial write rolls
// back in one transaction. Refuses any database except isolated staging.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  addPaymentRecord,
  correctAgreedPrice,
  editPaymentRecord,
  voidPaymentRecord,
} from "../src/lib/orders/corrections";
import { calculateFinancials } from "../src/lib/orders/financials";

if (
  new URL(process.env.DATABASE_URL ?? "http://invalid").hostname !==
  "ep-twilight-sun-b1raxfqz-pooler.c-5.eu-central-1.aws.neon.tech"
)
  throw new Error("Rollback test is restricted to isolated staging.");

const prisma = new PrismaClient({ log: [] });
const rollback = new Error("Intentional verification rollback");
const globalDb = globalThis as unknown as { andrelookPrisma?: PrismaClient };

async function counts() {
  return Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.payment.count(),
    prisma.orderStatusHistory.count(),
    prisma.orderCorrectionHistory.count(),
    prisma.reviewInvitation.count(),
    prisma.customerReview.count(),
    prisma.orderShipment.count(),
    prisma.shipment.count(),
  ]);
}

async function main() {
  const before = await counts();
  const previousDb = globalDb.andrelookPrisma;
  let verified = false;
  try {
    await prisma.$transaction(
      async (tx) => {
        // Route the real service's transactions into this rollback-only test.
        globalDb.andrelookPrisma = {
          ...tx,
          $transaction: async (callback: (client: typeof tx) => unknown) =>
            callback(tx),
        } as unknown as PrismaClient;
        const actor = await tx.adminUser.findFirstOrThrow({
          where: { isActive: true },
        });
        const customer = await tx.customer.create({
          data: {
            name: "TEST rollback payment",
            preferredContactMethod: "EMAIL",
            preferredContactValue: "payment-rollback@example.invalid",
            preferredLocale: "ET",
          },
        });
        const order = await tx.order.create({
          data: {
            customerId: customer.id,
            displayNumber: `TEST-ROLLBACK-${randomUUID()}`,
            requestKey: randomUUID(),
            status: "DELIVERED",
            currency: "EUR",
            confirmedTotalMinor: 21_900,
            requestedLocale: "ET",
            consentVersion: "TEST-ROLLBACK",
            consentAt: new Date(),
            fulfilmentMethod: "PERSONAL_HANDOVER",
            deliveryMode: "PERSONAL_HANDOVER",
            publicTrackingToken: randomUUID(),
            trackingAccessCodeHash: randomUUID(),
            trackingAccessCodeEncrypted: "rollback-only",
            items: {
              create: {
                productInternalCodeSnapshot: "TEST-ROLLBACK",
                productNameSnapshot: "TEST rollback item",
                quantity: 1,
                unitPriceMinor: 21_900,
              },
            },
            statusHistory: {
              create: {
                fromStatus: "READY",
                toStatus: "DELIVERED",
                changedByAdminId: actor.id,
              },
            },
            reviewInvitation: {
              create: {
                tokenHash: randomUUID(),
                tokenEncrypted: "rollback-only",
              },
            },
          },
        });
        const shipment = await tx.shipment.findFirstOrThrow({
          select: { id: true },
        });
        await tx.orderShipment.create({
          data: {
            orderId: order.id,
            shipmentId: shipment.id,
            relationship: "MASTER_INBOUND",
          },
        });
        const protectedState = () =>
          tx.order.findUniqueOrThrow({
            where: { id: order.id },
            select: {
              status: true,
              fulfilmentMethod: true,
              deliveryMode: true,
              publicTrackingToken: true,
              trackingAccessCodeHash: true,
              trackingAccessCodeEncrypted: true,
              statusHistory: true,
              shipmentLinks: true,
              trackingMilestones: true,
              reviewInvitation: true,
            },
          });
        const original = await protectedState();
        const input = {
          actorId: actor.id,
          orderId: order.id,
          currency: "EUR",
          kind: "DEPOSIT" as const,
          amountMinor: 7_000,
          processorFeeMinor: null,
          reference: null,
          requestKey: randomUUID(),
        };
        const deposit = await addPaymentRecord(input);
        const balanceInput = {
          ...input,
          kind: "BALANCE" as const,
          amountMinor: 14_900,
          requestKey: randomUUID(),
        };
        const balance = await addPaymentRecord(balanceInput);
        assert.equal((await addPaymentRecord(balanceInput)).id, balance.id);
        assert.equal(
          await tx.payment.count({ where: { orderId: order.id } }),
          2,
        );
        assert.deepEqual(
          calculateFinancials(
            21_900,
            await tx.payment.findMany({ where: { orderId: order.id } }),
          ),
          { paidMinor: 21_900, balanceMinor: 0 },
        );
        await assert.rejects(
          addPaymentRecord({
            ...input,
            amountMinor: 1,
            requestKey: randomUUID(),
          }),
          /balance/,
        );
        await assert.rejects(
          addPaymentRecord({
            ...input,
            amountMinor: 0,
            requestKey: randomUUID(),
          }),
          /amount/,
        );
        await assert.rejects(
          addPaymentRecord({
            ...input,
            currency: "USD",
            requestKey: randomUUID(),
          }),
          /currency/,
        );
        await editPaymentRecord({
          ...balanceInput,
          paymentId: balance.id,
          amountMinor: 14_000,
        });
        await voidPaymentRecord({
          actorId: actor.id,
          orderId: order.id,
          paymentId: balance.id,
          reason: "Rollback-only reset verification",
        });
        assert.deepEqual(
          calculateFinancials(
            21_900,
            await tx.payment.findMany({ where: { orderId: order.id } }),
          ),
          { paidMinor: 7_000, balanceMinor: 14_900 },
        );
        await correctAgreedPrice({
          actorId: actor.id,
          orderId: order.id,
          agreedTotalMinor: 20_000,
          existingPaymentsAcknowledged: true,
        });
        await addPaymentRecord({
          ...input,
          kind: "BALANCE",
          amountMinor: 13_000,
          requestKey: randomUUID(),
        });
        assert.equal(
          await tx.orderBusinessEvent.count({
            where: { orderId: order.id, eventType: "PAID", isActive: true },
          }),
          1,
        );
        assert.deepEqual(await protectedState(), original);
        assert.equal(
          (await tx.payment.findUniqueOrThrow({ where: { id: deposit.id } }))
            .amountMinor,
          7_000,
        );
        verified = true;
        throw rollback;
      },
      { timeout: 60_000, isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    globalDb.andrelookPrisma = previousDb;
  }
  assert.equal(verified, true);
  assert.deepEqual(await counts(), before);
  console.log(
    JSON.stringify({
      database: "isolated staging",
      financialOperations: "passed",
      protectedState: "unchanged",
      fixtures: "rolled back",
      businessCounts: before,
    }),
  );
}

main()
  .catch((error) => {
    console.error(
      JSON.stringify({
        verification: "failed",
        errorName: error.name,
        errorCode: error.code,
      }),
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

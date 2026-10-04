import { PrismaClient } from "@prisma/client";

const expected = {
  "f6000000-0000-4000-8000-000000000001": {
    countryCode: "EE",
    fulfilmentMethod: "PERSONAL_HANDOVER",
    paymentPreference: "DEPOSIT_30_BALANCE_ON_HANDOVER",
  },
  "f6000000-0000-4000-8000-000000000002": {
    countryCode: "EE",
    fulfilmentMethod: "DELIVERY",
    paymentPreference: "FULL_ADVANCE",
  },
  "f6000000-0000-4000-8000-000000000003": {
    countryCode: "FI",
    fulfilmentMethod: "DELIVERY",
    paymentPreference: "FULL_ADVANCE",
  },
} as const;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const prisma = new PrismaClient();
  try {
    const requests = await prisma.order.findMany({
      orderBy: { requestKey: "asc" },
      select: {
        addressLine1: true,
        city: true,
        countryCode: true,
        customer: {
          select: {
            email: true,
            name: true,
            phone: true,
            preferredContactMethod: true,
          },
        },
        displayNumber: true,
        fulfilmentMethod: true,
        id: true,
        items: {
          select: {
            productInternalCodeSnapshot: true,
            quantity: true,
            sizeHelpRequested: true,
            sizeSnapshot: true,
          },
        },
        notification: {
          select: { attempts: true, lastError: true, status: true },
        },
        paymentPreference: true,
        requestKey: true,
        status: true,
        statusHistory: { select: { toStatus: true } },
        utmCampaign: true,
        utmSource: true,
      },
      where: { requestKey: { in: Object.keys(expected) } },
    });
    if (requests.length !== 3) {
      throw new Error(
        `Expected three Phase 6F acceptance orders, received ${requests.length}.`,
      );
    }
    for (const request of requests) {
      const target = expected[request.requestKey as keyof typeof expected];
      if (
        !target ||
        request.countryCode !== target.countryCode ||
        request.fulfilmentMethod !== target.fulfilmentMethod ||
        request.paymentPreference !== target.paymentPreference ||
        request.customer.email !== "phase6f.acceptance@example.com" ||
        request.customer.preferredContactMethod !== "EMAIL" ||
        request.utmCampaign !== "phase6f-acceptance" ||
        request.utmSource !== "codex" ||
        request.items.length !== 1 ||
        request.items[0]?.quantity !== 1 ||
        !request.notification
      ) {
        throw new Error(`${request.displayNumber}: acceptance data mismatch.`);
      }
      if (target.fulfilmentMethod === "DELIVERY" && !request.addressLine1) {
        throw new Error(`${request.displayNumber}: delivery address missing.`);
      }
    }
    const [allOrders, customers, payments, admins] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.payment.count(),
      prisma.adminUser.count(),
    ]);
    console.log(
      JSON.stringify(
        {
          acceptanceOrders: requests.map((request) => ({
            fulfilment: request.fulfilmentMethod,
            notification: request.notification?.status,
            notificationAttempts: request.notification?.attempts,
            payment: request.paymentPreference,
            reference: request.displayNumber,
            status: request.status,
          })),
          stagingTotals: { admins, customers, orders: allOrders, payments },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

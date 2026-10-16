import { PrismaClient } from "@prisma/client";

import { createTrackingCredentials } from "../src/lib/tracking/credentials";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    select: { id: true },
    where: {
      OR: [
        { trackingAccessCodeEncrypted: null },
        { trackingAccessCodeHash: null },
      ],
    },
  });
  let updated = 0;
  for (const order of orders) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const credentials = createTrackingCredentials();
      try {
        await prisma.order.update({
          data: {
            trackingAccessCodeEncrypted:
              credentials.trackingAccessCodeEncrypted,
            trackingAccessCodeHash: credentials.trackingAccessCodeHash,
            trackingCredentialsRotatedAt:
              credentials.trackingCredentialsRotatedAt,
          },
          where: { id: order.id },
        });
        updated += 1;
        break;
      } catch (error) {
        if (attempt === 4) throw error;
      }
    }
  }
  console.log(
    JSON.stringify({ eligibleOrders: orders.length, updatedOrders: updated }),
  );
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Backfill failed.");
    process.exitCode = 1;
  });

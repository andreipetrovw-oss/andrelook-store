import { PrismaClient } from "@prisma/client";

const goldenCodes = [
  "AL-SRC-CPREPSCN-218824597",
  "AL-SRC-CPREPSCN-200087445",
  "AL-SRC-KINGCN-209196603",
  "AL-SRC-CPREPSCN-161312256",
] as const;

const initialBlockers = [
  "Owner retail price and availability are not approved.",
  "Customer-selectable colours and sizes are not approved.",
  "RU, ET and EN customer descriptions are not approved.",
  "No Studio candidate has passed the owner fidelity gate.",
  "Explicit owner publication approval is missing.",
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      select: { id: true, internalCode: true },
      where: { internalCode: { in: [...goldenCodes] } },
    });
    if (products.length !== goldenCodes.length) {
      throw new Error(
        `Expected ${goldenCodes.length} golden products, found ${products.length}.`,
      );
    }
    for (const product of products) {
      await prisma.productReview.upsert({
        create: {
          blockingIssues: initialBlockers,
          productId: product.id,
        },
        update: {},
        where: { productId: product.id },
      });
    }
    console.log(
      JSON.stringify({
        initialized: products.map((item) => item.internalCode),
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

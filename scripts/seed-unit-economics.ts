import { PrismaClient } from "@prisma/client";

import { calculatePlanningEconomics } from "../src/lib/economics/calculation";
import {
  ECONOMICS_EFFECTIVE_FROM,
  ECONOMICS_VERSION,
  ownerEconomics,
} from "../src/lib/economics/planning-data";

const prisma = new PrismaClient();

async function main() {
  if (ownerEconomics.length !== 22) {
    throw new Error(
      `Expected 22 economics rows, received ${ownerEconomics.length}.`,
    );
  }

  const codes = ownerEconomics.map((row) => row.internalCode);
  const products = await prisma.product.findMany({
    select: {
      id: true,
      internalCode: true,
      publicationStatus: true,
      retailPriceMinor: true,
      translations: {
        select: { name: true },
        where: { locale: "EN" },
      },
    },
    where: { internalCode: { in: codes } },
  });
  if (products.length !== 22) {
    throw new Error(`Expected 22 matching products, found ${products.length}.`);
  }
  const productByCode = new Map(
    products.map((product) => [product.internalCode, product]),
  );

  await prisma.$transaction(
    ownerEconomics.map((row) => {
      const product = productByCode.get(row.internalCode);
      if (!product) throw new Error(`Missing product ${row.internalCode}.`);
      if (!["READY", "PUBLISHED"].includes(product.publicationStatus)) {
        throw new Error(`${row.internalCode} is not a launch product.`);
      }
      if (product.retailPriceMinor !== row.retailSnapshotMinor) {
        throw new Error(
          `${row.internalCode} retail mismatch: catalog=${product.retailPriceMinor}, owner=${row.retailSnapshotMinor}.`,
        );
      }
      if (product.translations[0]?.name !== row.productName) {
        throw new Error(
          `${row.internalCode} name mismatch: catalog=${product.translations[0]?.name ?? "missing"}, owner=${row.productName}.`,
        );
      }
      const calculation = calculatePlanningEconomics(row);
      if (!calculation.landedCostMatches) {
        throw new Error(
          `${row.internalCode} landed cost does not equal purchase + logistics.`,
        );
      }
      const data = {
        effectiveFrom: new Date(ECONOMICS_EFFECTIVE_FROM),
        landedCostEstimateMinor: row.landedCostEstimateMinor,
        logisticsEstimateMinor: row.logisticsEstimateMinor,
        notes:
          "Owner-supplied approximate planning economics; not accounting truth.",
        paymentRateBps: row.paymentRateBps,
        purchaseEstimateMinor: row.purchaseEstimateMinor,
        retailSnapshotMinor: row.retailSnapshotMinor,
        sourceType: "ESTIMATE" as const,
        targetAdRateBps: row.targetAdRateBps,
        version: ECONOMICS_VERSION,
      };
      return prisma.productEconomicsVersion.upsert({
        create: { ...data, productId: product.id },
        update: data,
        where: {
          productId_version: {
            productId: product.id,
            version: ECONOMICS_VERSION,
          },
        },
      });
    }),
  );

  const seeded = await prisma.productEconomicsVersion.count({
    where: {
      product: { internalCode: { in: codes } },
      version: ECONOMICS_VERSION,
    },
  });
  if (seeded !== 22)
    throw new Error(`Expected 22 seeded rows, found ${seeded}.`);
  console.log(
    JSON.stringify({
      seeded,
      sourceType: "ESTIMATE",
      version: ECONOMICS_VERSION,
    }),
  );
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Unit economics seed failed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

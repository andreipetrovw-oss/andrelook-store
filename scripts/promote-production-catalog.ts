import { PrismaClient } from "@prisma/client";

const expectedPublicCodes = 22;
const retiredCode = "AL-LEGACY-006";

async function inspect(prisma: PrismaClient) {
  const [launch, supplierVisible, historicalOrder] = await Promise.all([
    prisma.product.findMany({
      select: {
        currency: true,
        images: {
          select: { approvedAt: true, reviewStatus: true },
          where: { role: "PRIMARY" },
        },
        internalCode: true,
        publicationStatus: true,
        retailPriceMinor: true,
        sizeChart: {
          select: { isPublished: true, reviewStatus: true },
        },
      },
      where: { internalCode: { startsWith: "AL-LEGACY-" } },
    }),
    prisma.product.count({
      where: {
        internalCode: { startsWith: "AL-SRC-" },
        publicationStatus: { in: ["READY", "PUBLISHED"] },
      },
    }),
    prisma.order.findUnique({
      select: {
        confirmedTotalMinor: true,
        displayNumber: true,
        items: {
          select: {
            colorSnapshot: true,
            sizeSnapshot: true,
          },
        },
        payments: { select: { amountMinor: true } },
        status: true,
      },
      where: { displayNumber: "AL-20261006-C0F902" },
    }),
  ]);

  const publicProducts = launch.filter(
    (product) => product.internalCode !== retiredCode,
  );
  const retired = launch.find(
    (product) => product.internalCode === retiredCode,
  );
  const problems: string[] = [];
  if (launch.length !== 23)
    problems.push(`legacy products ${launch.length}/23`);
  if (publicProducts.length !== expectedPublicCodes) {
    problems.push(
      `launch products ${publicProducts.length}/${expectedPublicCodes}`,
    );
  }
  if (retired?.publicationStatus !== "DRAFT") {
    problems.push(`${retiredCode} is not private DRAFT`);
  }
  if (supplierVisible !== 0)
    problems.push(`${supplierVisible} supplier records visible`);
  for (const product of publicProducts) {
    if (!["READY", "PUBLISHED"].includes(product.publicationStatus)) {
      problems.push(`${product.internalCode} is ${product.publicationStatus}`);
    }
    if (product.retailPriceMinor === null || product.currency !== "EUR") {
      problems.push(`${product.internalCode} has no approved EUR price`);
    }
    if (
      !product.sizeChart?.isPublished ||
      product.sizeChart.reviewStatus !== "APPROVED"
    ) {
      problems.push(
        `${product.internalCode} has no approved public size chart`,
      );
    }
    if (
      !product.images.some(
        (image) => image.reviewStatus === "APPROVED" && image.approvedAt,
      )
    ) {
      problems.push(`${product.internalCode} has no approved primary image`);
    }
  }
  if (historicalOrder) {
    const paidMinor = historicalOrder.payments.reduce(
      (sum, payment) => sum + payment.amountMinor,
      0,
    );
    if (
      historicalOrder.status !== "NEW" ||
      historicalOrder.confirmedTotalMinor !== null ||
      paidMinor !== 0 ||
      historicalOrder.items.length !== 1 ||
      historicalOrder.items[0]?.colorSnapshot !== "Must" ||
      historicalOrder.items[0]?.sizeSnapshot !== "M/2"
    ) {
      problems.push("historical order AL-20261006-C0F902 changed unexpectedly");
    }
  }
  if (problems.length) throw new Error(problems.join("\n"));
  return { historicalOrder, publicProducts };
}

async function main() {
  if (process.env.PRODUCTION_CUTOVER_TARGET !== "andrelook.store") {
    throw new Error(
      "PRODUCTION_CUTOVER_TARGET=andrelook.store is required for production promotion.",
    );
  }
  if (!process.argv.includes("--write")) {
    throw new Error("Refusing to publish without --write.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient();
  try {
    const before = await inspect(prisma);
    const promoted = await prisma.product.updateMany({
      data: { publicationStatus: "PUBLISHED", publishedAt: new Date() },
      where: {
        internalCode: {
          in: before.publicProducts.map((item) => item.internalCode),
        },
        publicationStatus: "READY",
      },
    });
    const after = await inspect(prisma);
    const published = after.publicProducts.filter(
      (product) => product.publicationStatus === "PUBLISHED",
    ).length;
    if (published !== expectedPublicCodes) {
      throw new Error(
        `Published products ${published}/${expectedPublicCodes}.`,
      );
    }
    console.log(
      JSON.stringify(
        {
          historicalOrderImported: after.historicalOrder?.displayNumber ?? null,
          prices: `${after.publicProducts.filter((item) => item.retailPriceMinor !== null).length}/22`,
          promoted: promoted.count,
          published,
          sizeGuides: `${after.publicProducts.filter((item) => item.sizeChart?.isPublished).length}/22`,
          tibb: "private DRAFT",
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

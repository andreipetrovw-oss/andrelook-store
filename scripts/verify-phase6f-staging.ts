import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

import { PrismaClient } from "@prisma/client";

import {
  readPhase6fLaunchCatalog,
  verifyPhase6fAssetHashes,
} from "./lib/phase6f-launch";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const catalog = await readPhase6fLaunchCatalog();
  await verifyPhase6fAssetHashes(catalog);
  const expected = new Map(
    catalog.products.map((product) => [product.internalCode, product]),
  );
  const prisma = new PrismaClient();
  try {
    const [launch, supplierCount, supplierReady, launchSourceImages] =
      await Promise.all([
        prisma.product.findMany({
          orderBy: { sortOrder: "asc" },
          select: {
            availabilityType: true,
            brand: { select: { displayName: true } },
            category: {
              select: {
                parent: { select: { slug: true } },
                slug: true,
              },
            },
            colors: {
              orderBy: { sortOrder: "asc" },
              select: {
                code: true,
                reviewStatus: true,
                swatchHex: true,
                translations: { select: { locale: true, name: true } },
              },
            },
            currency: true,
            images: {
              orderBy: { sortOrder: "asc" },
              select: {
                approvedAt: true,
                height: true,
                reviewStatus: true,
                role: true,
                storageKey: true,
                translations: { select: { altText: true, locale: true } },
                url: true,
                width: true,
              },
            },
            internalCode: true,
            preorderEstimateText: true,
            privateData: { select: { sourcePayload: true } },
            publicationStatus: true,
            retailPriceMinor: true,
            sizeChart: {
              select: {
                chartData: true,
                evidence: {
                  select: {
                    chartScope: true,
                    notes: true,
                    sourceAlbumId: true,
                    sourceImagePosition: true,
                    sourceImageSha256: true,
                    sourceImageUrl: true,
                    verification: true,
                  },
                },
                isPublished: true,
                reviewStatus: true,
                units: true,
              },
            },
            slug: true,
            translations: {
              select: {
                description: true,
                locale: true,
                name: true,
                shortDescription: true,
              },
            },
          },
          where: { internalCode: { startsWith: "AL-LEGACY-" } },
        }),
        prisma.product.count({
          where: { internalCode: { startsWith: "AL-SRC-" } },
        }),
        prisma.product.count({
          where: {
            internalCode: { startsWith: "AL-SRC-" },
            publicationStatus: { in: ["READY", "PUBLISHED"] },
          },
        }),
        prisma.productSourceImage.count({
          where: { product: { internalCode: { startsWith: "AL-LEGACY-" } } },
        }),
      ]);

    const problems: string[] = [];
    if (launch.length !== 23)
      problems.push(`launch products: ${launch.length}/23`);
    if (supplierCount !== 63)
      problems.push(`preserved supplier products: ${supplierCount}/63`);
    if (supplierReady !== 0)
      problems.push(`supplier records visible in review: ${supplierReady}`);
    if (launchSourceImages !== 0)
      problems.push(
        "legacy public images were incorrectly stored as private supplier references",
      );

    for (const product of launch) {
      const source = expected.get(product.internalCode);
      if (!source) {
        problems.push(`${product.internalCode}: not in launch artifact`);
        continue;
      }
      if (
        product.publicationStatus !== source.publicationStatus ||
        product.availabilityType !== "PRE_ORDER" ||
        product.preorderEstimateText !== "2–3 weeks" ||
        product.currency !== "EUR" ||
        product.retailPriceMinor !== source.retailPriceMinor ||
        product.slug !== source.slug ||
        product.brand?.displayName !== source.brand ||
        product.category?.slug !== source.category.slug ||
        product.category.parent?.slug !== "launch-collection" ||
        product.translations.length !== 3
      ) {
        problems.push(
          `${product.internalCode}: launch identity/commercial state mismatch`,
        );
      }
      if (product.images.length !== source.images.length) {
        problems.push(`${product.internalCode}: image count mismatch`);
      }
      for (const [index, image] of product.images.entries()) {
        const sourceImage = source.images[index];
        if (
          !sourceImage ||
          image.reviewStatus !== "APPROVED" ||
          !image.approvedAt ||
          image.url !== sourceImage.url ||
          image.width !== sourceImage.width ||
          image.height !== sourceImage.height ||
          image.role !== sourceImage.role ||
          !image.storageKey.includes(sourceImage.optimizedSha256) ||
          image.translations.length !== 3
        ) {
          problems.push(
            `${product.internalCode}: public image ${index + 1} mismatch`,
          );
        }
      }
      if (product.colors.length !== source.colors.length) {
        problems.push(`${product.internalCode}: colour count mismatch`);
      }
      if (!source.sizeChart && product.sizeChart) {
        problems.push(
          `${product.internalCode}: unsupported size chart attached`,
        );
      }
      if (source.sizeChart) {
        const chart = product.sizeChart;
        if (
          !chart ||
          chart.reviewStatus !== "APPROVED" ||
          !chart.isPublished ||
          chart.units !== source.sizeChart.units ||
          !isDeepStrictEqual(chart.chartData, source.sizeChart.chartData) ||
          chart.evidence?.sourceAlbumId !==
            source.sizeChart.evidence.sourceAlbumId ||
          chart.evidence?.sourceImagePosition !==
            source.sizeChart.evidence.sourceImagePosition ||
          chart.evidence?.sourceImageSha256 !==
            source.sizeChart.evidence.sourceImageSha256 ||
          chart.evidence?.sourceImageUrl !==
            source.sizeChart.evidence.sourceImageUrl ||
          chart.evidence?.verification !==
            source.sizeChart.evidence.verification
        ) {
          problems.push(
            `${product.internalCode}: verified size-chart evidence mismatch`,
          );
        }
      }
      const payload = product.privateData?.sourcePayload as
        { masterImages?: Array<{ file: string; sha256: string }> } | undefined;
      if (payload?.masterImages?.length !== source.images.length) {
        problems.push(
          `${product.internalCode}: legacy provenance manifest mismatch`,
        );
      }
    }

    if (problems.length) throw new Error(problems.join("\n"));
    const imageCount = launch.flatMap((product) => product.images).length;
    const imageBytes = await Promise.all(
      catalog.products.flatMap((product) =>
        product.images.map((image) =>
          readFile(image.url.replace(/^\//, "public/")),
        ),
      ),
    );
    const publicLaunch = launch.filter(
      (product) => product.publicationStatus === "READY",
    );
    const retired = launch.filter(
      (product) => product.publicationStatus === "DRAFT",
    );
    if (publicLaunch.length !== 22)
      problems.push(`public launch products: ${publicLaunch.length}/22`);
    if (retired.length !== 1 || retired[0]?.internalCode !== "AL-LEGACY-006") {
      problems.push("private retired product is not exactly AL-LEGACY-006");
    }
    if (problems.length) throw new Error(problems.join("\n"));

    const report = {
      availability: { PRE_ORDER: publicLaunch.length },
      catalogRecords: launch.length,
      ownerApprovedPrices: publicLaunch.filter(
        (product) => product.retailPriceMinor !== null,
      ).length,
      privateRetiredProducts: retired.map((product) => product.internalCode),
      publicLaunchProducts: publicLaunch.length,
      publicLaunchProductsMissingOwnerPrice: publicLaunch.filter(
        (product) => product.retailPriceMinor === null,
      ).length,
      publicLaunchProductsWithColours: publicLaunch.filter(
        (product) => product.colors.length,
      ).length,
      publicLaunchProductsWithSelectableSizes: publicLaunch.filter(
        (product) => product.sizeChart,
      ).length,
      publicLaunchProductsWithoutVerifiedChart: publicLaunch.filter(
        (product) => !product.sizeChart,
      ).length,
      publicLegacyImages: imageCount,
      publicLegacyImagesCombinedSha256: createHash("sha256")
        .update(Buffer.concat(imageBytes))
        .digest("hex"),
      supplierResearchProductsPreserved: supplierCount,
      supplierResearchProductsVisible: supplierReady,
      verifiedPublicSizeCharts: publicLaunch.filter(
        (product) => product.sizeChart,
      ).length,
    };
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

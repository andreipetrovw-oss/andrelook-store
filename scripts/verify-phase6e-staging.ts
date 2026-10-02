import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { PrismaClient } from "@prisma/client";

import {
  assertExpectedCatalog,
  parseCatalog,
  summarizeCatalog,
} from "./lib/phase5-catalog";

const expectedSha256 =
  "5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21";

function argument(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const file = path.resolve(
    argument("--file") ??
      process.env.PHASE5_CATALOG_PATH ??
      path.resolve(process.cwd(), "../phase5c1/final-master-catalog.json"),
  );
  const contents = await readFile(file);
  const sha256 = createHash("sha256").update(contents).digest("hex");
  if (sha256 !== expectedSha256)
    throw new Error("Phase 5C1 checksum mismatch.");
  const catalog = parseCatalog(JSON.parse(contents.toString("utf8")));
  const sourceSummary = summarizeCatalog(catalog);
  assertExpectedCatalog(sourceSummary);
  const sourceByCode = new Map(
    catalog.products.map((product) => [product.internal_id, product]),
  );

  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      orderBy: { internalCode: "asc" },
      select: {
        availabilityType: true,
        colors: { select: { reviewStatus: true } },
        currency: true,
        images: { select: { approvedAt: true, reviewStatus: true } },
        internalCode: true,
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
            reviewStatus: true,
            units: true,
          },
        },
        slug: true,
        translations: { select: { locale: true } },
      },
      where: { internalCode: { in: [...sourceByCode.keys()] } },
    });

    if (products.length !== 63)
      throw new Error("Staging product count mismatch.");
    let verifiedChartMappings = 0;
    const mismatches: string[] = [];
    for (const product of products) {
      const source = sourceByCode.get(product.internalCode);
      if (!source) {
        mismatches.push(`${product.internalCode}: no source record`);
        continue;
      }
      const expectsChart = source.size_data.status === "SIZE CHART VERIFIED";
      if (expectsChart) {
        const sourceChart = source.size_data.chart;
        if (
          !sourceChart ||
          product.sizeChart?.reviewStatus !== "APPROVED" ||
          product.sizeChart.evidence?.sourceImageSha256 !==
            (sourceChart.source_image_sha256 ?? null) ||
          product.sizeChart.units !== (sourceChart.units ?? null) ||
          !isDeepStrictEqual(product.sizeChart.chartData, {
            measurements: sourceChart.measurements,
            sizes: sourceChart.sizes,
          }) ||
          product.sizeChart.evidence?.chartScope !==
            (sourceChart.chart_scope ?? null) ||
          product.sizeChart.evidence?.sourceAlbumId !==
            (sourceChart.source_album_id ?? null) ||
          product.sizeChart.evidence?.sourceImagePosition !==
            (sourceChart.source_image_position ?? null) ||
          product.sizeChart.evidence?.sourceImageUrl !==
            (sourceChart.source_image_url ?? null) ||
          product.sizeChart.evidence?.verification !==
            (sourceChart.verification ?? null) ||
          !isDeepStrictEqual(
            product.sizeChart.evidence?.notes ?? null,
            sourceChart.notes ?? null,
          )
        ) {
          mismatches.push(
            `${product.internalCode}: chart data, unit, label, anomaly-note or evidence mismatch`,
          );
        } else {
          verifiedChartMappings += 1;
        }
      } else if (product.sizeChart) {
        mismatches.push(`${product.internalCode}: unexpected chart`);
      }
      if (!product.slug || product.translations.length !== 3) {
        mismatches.push(`${product.internalCode}: incomplete identity`);
      }
    }
    if (mismatches.length) throw new Error(mismatches.join("\n"));

    const publicationStates = Object.fromEntries(
      ["DRAFT", "READY", "PUBLISHED", "ARCHIVED"].map((status) => [
        status,
        products.filter((product) => product.publicationStatus === status)
          .length,
      ]),
    );
    const report = {
      approvedPublicPhotography: products.filter((product) =>
        product.images.some(
          (image) => image.reviewStatus === "APPROVED" && image.approvedAt,
        ),
      ).length,
      availabilityKnown: products.filter((product) => product.availabilityType)
        .length,
      catalogProductsPrepared: products.filter(
        (product) => product.slug && product.translations.length === 3,
      ).length,
      coloursApproved: products.filter((product) =>
        product.colors.some((color) => color.reviewStatus === "APPROVED"),
      ).length,
      phase5Sha256: sha256,
      photographyRequired: products.filter(
        (product) =>
          !product.images.some(
            (image) => image.reviewStatus === "APPROVED" && image.approvedAt,
          ),
      ).length,
      pricesKnown: products.filter(
        (product) =>
          product.retailPriceMinor !== null && Boolean(product.currency),
      ).length,
      productsMissingCharts: products.filter((product) => !product.sizeChart)
        .length,
      productsRequiringOwnerFacts: products.filter(
        (product) =>
          !product.availabilityType ||
          product.retailPriceMinor === null ||
          !product.currency,
      ).length,
      publicationStates,
      selectableSizes: products.filter((product) => {
        const data = product.sizeChart?.chartData;
        return Boolean(
          product.sizeChart?.reviewStatus === "APPROVED" &&
          data &&
          !Array.isArray(data) &&
          typeof data === "object" &&
          Array.isArray((data as { sizes?: unknown }).sizes) &&
          (data as { sizes: unknown[] }).sizes.length,
        );
      }).length,
      verifiedChartMappings,
      ...sourceSummary,
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

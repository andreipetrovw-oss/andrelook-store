import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Prisma, PrismaClient } from "@prisma/client";

import {
  assertExpectedCatalog,
  parseCatalog,
  privateReviewStatus,
  summarizeCatalog,
  taxonomySlug,
  type Phase5Catalog,
  type Phase5Product,
} from "./lib/phase5-catalog";

const expectedSha256 =
  "5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21";

type Arguments = {
  file: string;
  target: "development" | "staging" | null;
  write: boolean;
};

function parseArguments(argv: string[]): Arguments {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  const file =
    valueAfter("--file") ??
    process.env.PHASE5_CATALOG_PATH ??
    path.resolve(process.cwd(), "../../phase5c1/final-master-catalog.json");
  const targetValue = valueAfter("--target");
  const target =
    targetValue === "development" || targetValue === "staging"
      ? targetValue
      : null;

  return { file: path.resolve(file), target, write: argv.includes("--write") };
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function optionalDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function supplierCostMinor(product: Phase5Product): number | null {
  const price = product.supplier_pricing.price;
  return typeof price === "number" && Number.isFinite(price)
    ? Math.round(price * 100)
    : null;
}

async function upsertTaxonomy(prisma: PrismaClient, product: Phase5Product) {
  const parentSlug = taxonomySlug(product.identity.category);
  const childSlug = taxonomySlug(product.identity.subcategory);
  const parent = await prisma.category.upsert({
    create: { slug: parentSlug },
    update: {},
    where: { slug: parentSlug },
  });
  return prisma.category.upsert({
    create: { parentId: parent.id, slug: childSlug },
    update: { parentId: parent.id },
    where: { slug: childSlug },
  });
}

async function importProduct(prisma: PrismaClient, source: Phase5Product) {
  const category = await upsertTaxonomy(prisma, source);
  const existing = await prisma.product.findUnique({
    select: {
      id: true,
      publicationStatus: true,
      sizeChart: { select: { isPublished: true } },
    },
    where: { internalCode: source.internal_id },
  });

  if (
    existing?.publicationStatus === "PUBLISHED" ||
    existing?.sizeChart?.isPublished
  ) {
    throw new Error(
      `Refusing to overwrite published owner content for ${source.internal_id}.`,
    );
  }

  const status = privateReviewStatus(source);
  const product = await prisma.product.upsert({
    create: {
      categoryId: category.id,
      internalCode: source.internal_id,
      publicationStatus: "DRAFT",
    },
    update: { categoryId: category.id },
    where: { internalCode: source.internal_id },
  });

  const privateData = {
    internalNotes: source.data_quality.review_notes.join("\n") || null,
    sourcePayload: json({
      colours: source.colours,
      current_production_match: source.current_production_match ?? null,
      data_quality: source.data_quality,
      future_fields: source.future_fields,
      identity: source.identity,
      source: source.source,
      supplier_pricing: source.supplier_pricing,
    }),
    sourceReviewStatus: status,
    supplierAvailabilityCheckedAt: optionalDate(source.source.last_checked),
    supplierAlbumUrl: source.source.url,
    supplierCostMinor: supplierCostMinor(source),
    supplierCurrency: source.supplier_pricing.currency ?? null,
    supplierName: source.source.supplier,
    supplierSourceId: source.source.source_id,
    supplierUrl: source.source.url,
  } satisfies Prisma.ProductPrivateUncheckedCreateWithoutProductInput;

  await prisma.productPrivate.upsert({
    create: { ...privateData, productId: product.id },
    update: privateData,
    where: { productId: product.id },
  });

  await prisma.productSourceImage.deleteMany({
    where: { productId: product.id },
  });
  await prisma.productSourceImage.createMany({
    data: source.images.source_references.map((image) => ({
      assignedSourceRole: image.assigned_role ?? null,
      height: image.height ?? null,
      httpValidation: image.http_validation
        ? json(image.http_validation)
        : Prisma.JsonNull,
      inferredView: image.inferred_view ?? null,
      isSizeChart: Boolean(image.is_size_chart),
      localOriginalPath: image.local_original_path ?? null,
      previewUrl: image.preview_url ?? null,
      productId: product.id,
      reviewStatus: status,
      sourceName: image.name ?? null,
      sourcePosition: image.position,
      sourceSha256: image.source_image_sha256 ?? null,
      sourceUrl: image.url,
      width: image.width ?? null,
    })),
  });

  const chart = source.size_data.chart;
  if (source.size_data.status === "SIZE CHART VERIFIED" && chart) {
    const sizeChart = await prisma.sizeChart.upsert({
      create: {
        chartData: json({
          measurements: chart.measurements,
          sizes: chart.sizes,
        }),
        isPublished: false,
        productId: product.id,
        reviewStatus: "APPROVED",
        reviewedAt: optionalDate(chart.verification_date),
        units: chart.units ?? null,
      },
      update: {
        chartData: json({
          measurements: chart.measurements,
          sizes: chart.sizes,
        }),
        reviewStatus: "APPROVED",
        reviewedAt: optionalDate(chart.verification_date),
        units: chart.units ?? null,
      },
      where: { productId: product.id },
    });

    await prisma.sizeChartEvidence.upsert({
      create: {
        chartScope: chart.chart_scope ?? null,
        notes: chart.notes ? json(chart.notes) : Prisma.JsonNull,
        sizeChartId: sizeChart.id,
        sourceAlbumId: chart.source_album_id ?? null,
        sourceImagePosition: chart.source_image_position ?? null,
        sourceImageSha256: chart.source_image_sha256 ?? null,
        sourceImageUrl: chart.source_image_url ?? null,
        verification: chart.verification ?? null,
        verificationDate: optionalDate(chart.verification_date),
      },
      update: {
        chartScope: chart.chart_scope ?? null,
        notes: chart.notes ? json(chart.notes) : Prisma.JsonNull,
        sourceAlbumId: chart.source_album_id ?? null,
        sourceImagePosition: chart.source_image_position ?? null,
        sourceImageSha256: chart.source_image_sha256 ?? null,
        sourceImageUrl: chart.source_image_url ?? null,
        verification: chart.verification ?? null,
        verificationDate: optionalDate(chart.verification_date),
      },
      where: { sizeChartId: sizeChart.id },
    });
  }
}

async function writeCatalog(catalog: Phase5Catalog) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required with --write.");
  }

  const prisma = new PrismaClient();
  try {
    for (const product of catalog.products) {
      await prisma.$transaction(async (transaction) => {
        await importProduct(transaction as PrismaClient, product);
      });
    }

    const internalCodes = catalog.products.map(
      (product) => product.internal_id,
    );
    const [products, sourceImages, verifiedSizeCharts, candidates, review] =
      await Promise.all([
        prisma.product.count({
          where: { internalCode: { in: internalCodes } },
        }),
        prisma.productSourceImage.count({
          where: { product: { internalCode: { in: internalCodes } } },
        }),
        prisma.sizeChart.count({
          where: {
            product: { internalCode: { in: internalCodes } },
            reviewStatus: "APPROVED",
          },
        }),
        prisma.productPrivate.count({
          where: {
            product: { internalCode: { in: internalCodes } },
            sourceReviewStatus: "CANDIDATE",
          },
        }),
        prisma.productPrivate.count({
          where: {
            product: { internalCode: { in: internalCodes } },
            sourceReviewStatus: "NEEDS_REVIEW",
          },
        }),
      ]);

    return {
      candidates,
      products,
      publicationStatus: "DRAFT",
      reviewBeforeCatalog: review,
      sourceImages,
      verifiedSizeCharts,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const contents = await readFile(args.file);
  const sha256 = createHash("sha256").update(contents).digest("hex");
  if (sha256 !== expectedSha256) {
    throw new Error(
      `Phase 5C1 checksum mismatch: expected ${expectedSha256}, received ${sha256}.`,
    );
  }

  const catalog = parseCatalog(JSON.parse(contents.toString("utf8")));
  const summary = summarizeCatalog(catalog);
  assertExpectedCatalog(summary);

  if (!args.write) {
    console.log(
      JSON.stringify(
        { file: args.file, mode: "dry-run", sha256, ...summary },
        null,
        2,
      ),
    );
    return;
  }

  if (!args.target) {
    throw new Error(
      "--write requires --target development or --target staging. Production is refused.",
    );
  }

  const result = await writeCatalog(catalog);
  assertExpectedCatalog(result);
  console.log(
    JSON.stringify(
      {
        file: args.file,
        mode: "write",
        sha256,
        target: args.target,
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

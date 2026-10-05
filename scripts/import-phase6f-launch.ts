import { Prisma, PrismaClient, type Locale } from "@prisma/client";

import {
  readPhase6fLaunchCatalog,
  type LaunchLocale,
  type LaunchProduct,
} from "./lib/phase6f-launch";

const localeMap: Record<LaunchLocale, Locale> = {
  en: "EN",
  et: "ET",
  ru: "RU",
};

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function brandSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function date(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function upsertTaxonomy(prisma: PrismaClient, source: LaunchProduct) {
  const root = await prisma.category.upsert({
    create: { slug: "launch-collection", sortOrder: 0 },
    update: { isActive: true, sortOrder: 0 },
    where: { slug: "launch-collection" },
  });
  const rootNames = {
    EN: "Collection",
    ET: "Kollektsioon",
    RU: "Коллекция",
  } as const;
  for (const locale of Object.keys(rootNames) as Locale[]) {
    await prisma.categoryTranslation.upsert({
      create: { categoryId: root.id, locale, name: rootNames[locale] },
      update: { name: rootNames[locale] },
      where: { categoryId_locale: { categoryId: root.id, locale } },
    });
  }
  const category = await prisma.category.upsert({
    create: {
      parentId: root.id,
      slug: source.category.slug,
      sortOrder: source.legacyId,
    },
    update: {
      isActive: true,
      parentId: root.id,
      sortOrder: source.legacyId,
    },
    where: { slug: source.category.slug },
  });
  for (const sourceLocale of Object.keys(localeMap) as LaunchLocale[]) {
    const locale = localeMap[sourceLocale];
    await prisma.categoryTranslation.upsert({
      create: {
        categoryId: category.id,
        locale,
        name: source.category.names[sourceLocale],
      },
      update: { name: source.category.names[sourceLocale] },
      where: { categoryId_locale: { categoryId: category.id, locale } },
    });
  }
  return category;
}

async function importProduct(prisma: PrismaClient, source: LaunchProduct) {
  const category = await upsertTaxonomy(prisma, source);
  const brand = await prisma.brand.upsert({
    create: { displayName: source.brand, slug: brandSlug(source.brand) },
    update: { displayName: source.brand, isActive: true },
    where: { slug: brandSlug(source.brand) },
  });

  const collision = await prisma.product.findFirst({
    select: { id: true, internalCode: true, slug: true },
    where: { internalCode: { not: source.internalCode }, slug: source.slug },
  });
  if (collision?.slug) {
    await prisma.product.update({
      data: {
        slug: `research-${collision.slug}-${collision.internalCode.toLowerCase()}`,
      },
      where: { id: collision.id },
    });
  }

  const product = await prisma.product.upsert({
    create: {
      availabilityType: source.availabilityType,
      brandId: brand.id,
      categoryId: category.id,
      currency: source.currency,
      internalCode: source.internalCode,
      isFeatured: source.isFeatured,
      preorderEstimateText: source.preorderEstimateText,
      publicationStatus: source.publicationStatus,
      retailPriceMinor: source.retailPriceMinor,
      slug: source.slug,
      sortOrder: source.sortOrder,
    },
    update: {
      availabilityType: source.availabilityType,
      brandId: brand.id,
      categoryId: category.id,
      currency: source.currency,
      isFeatured: source.isFeatured,
      preorderEstimateText: source.preorderEstimateText,
      publicationStatus: source.publicationStatus,
      retailPriceMinor: source.retailPriceMinor,
      slug: source.slug,
      sortOrder: source.sortOrder,
    },
    where: { internalCode: source.internalCode },
  });

  await prisma.productPrivate.upsert({
    create: {
      internalNotes:
        "Phase 6F launch record reconstructed from the verified Phase 4 production catalog. Retail price requires owner approval before publication.",
      productId: product.id,
      sourcePayload: json({
        legacyId: source.legacyId,
        masterImages: source.images.map((image) => ({
          file: image.masterFile,
          sha256: image.masterSha256,
        })),
        phase5Mapping: source.phase5Mapping,
      }),
      sourceReviewStatus: "APPROVED",
    },
    update: {
      internalNotes:
        "Phase 6F launch record reconstructed from the verified Phase 4 production catalog. Retail price requires owner approval before publication.",
      sourcePayload: json({
        legacyId: source.legacyId,
        masterImages: source.images.map((image) => ({
          file: image.masterFile,
          sha256: image.masterSha256,
        })),
        phase5Mapping: source.phase5Mapping,
      }),
      sourceReviewStatus: "APPROVED",
    },
    where: { productId: product.id },
  });

  for (const translation of source.translations) {
    const locale = localeMap[translation.locale];
    await prisma.productTranslation.upsert({
      create: {
        description: translation.description,
        locale,
        name: translation.name,
        productId: product.id,
        seoDescription: translation.shortDescription,
        seoTitle: translation.name,
        shortDescription: translation.shortDescription,
      },
      update: {
        description: translation.description,
        name: translation.name,
        seoDescription: translation.shortDescription,
        seoTitle: translation.name,
        shortDescription: translation.shortDescription,
      },
      where: { productId_locale: { locale, productId: product.id } },
    });
  }

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  for (const image of source.images) {
    const created = await prisma.productImage.create({
      data: {
        approvedAt: new Date("2026-10-04T00:00:00.000Z"),
        height: image.height,
        productId: product.id,
        reviewStatus: "APPROVED",
        role: image.role,
        sortOrder: image.sortOrder,
        storageKey: `phase6f/legacy/${image.optimizedSha256}.webp`,
        url: image.url,
        width: image.width,
      },
    });
    await prisma.productImageTranslation.createMany({
      data: (Object.keys(localeMap) as LaunchLocale[]).map((sourceLocale) => ({
        altText: image.alt[sourceLocale],
        imageId: created.id,
        locale: localeMap[sourceLocale],
      })),
    });
  }

  await prisma.productColor.deleteMany({ where: { productId: product.id } });
  for (const color of source.colors) {
    const created = await prisma.productColor.create({
      data: {
        code: color.code,
        productId: product.id,
        reviewStatus: "APPROVED",
        sortOrder: color.sortOrder,
        swatchHex: color.swatchHex,
      },
    });
    await prisma.productColorTranslation.createMany({
      data: (Object.keys(localeMap) as LaunchLocale[]).map((sourceLocale) => ({
        colorId: created.id,
        locale: localeMap[sourceLocale],
        name: color.names[sourceLocale],
      })),
    });
  }

  if (!source.sizeChart) {
    await prisma.sizeChart.deleteMany({ where: { productId: product.id } });
    return;
  }
  const chart = await prisma.sizeChart.upsert({
    create: {
      chartData: json(source.sizeChart.chartData),
      isPublished: true,
      productId: product.id,
      reviewStatus: "APPROVED",
      reviewedAt: date(source.sizeChart.evidence.verificationDate),
      units: source.sizeChart.units,
    },
    update: {
      chartData: json(source.sizeChart.chartData),
      isPublished: true,
      reviewStatus: "APPROVED",
      reviewedAt: date(source.sizeChart.evidence.verificationDate),
      units: source.sizeChart.units,
    },
    where: { productId: product.id },
  });
  await prisma.sizeChartEvidence.upsert({
    create: {
      chartScope: source.sizeChart.evidence.chartScope,
      notes: json(source.sizeChart.evidence.notes),
      sizeChartId: chart.id,
      sourceAlbumId: source.sizeChart.evidence.sourceAlbumId,
      sourceImagePosition: source.sizeChart.evidence.sourceImagePosition,
      sourceImageSha256: source.sizeChart.evidence.sourceImageSha256,
      sourceImageUrl: source.sizeChart.evidence.sourceImageUrl,
      verification: source.sizeChart.evidence.verification,
      verificationDate: date(source.sizeChart.evidence.verificationDate),
    },
    update: {
      chartScope: source.sizeChart.evidence.chartScope,
      notes: json(source.sizeChart.evidence.notes),
      sourceAlbumId: source.sizeChart.evidence.sourceAlbumId,
      sourceImagePosition: source.sizeChart.evidence.sourceImagePosition,
      sourceImageSha256: source.sizeChart.evidence.sourceImageSha256,
      sourceImageUrl: source.sizeChart.evidence.sourceImageUrl,
      verification: source.sizeChart.evidence.verification,
      verificationDate: date(source.sizeChart.evidence.verificationDate),
    },
    where: { sizeChartId: chart.id },
  });
}

async function main() {
  if (!process.argv.includes("--write")) {
    throw new Error("Refusing to mutate the database without --write.");
  }
  if (process.env.PHASE6F_TARGET !== "staging") {
    throw new Error("PHASE6F_TARGET=staging is required.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const catalog = await readPhase6fLaunchCatalog();
  const prisma = new PrismaClient();
  try {
    const supplierCount = await prisma.product.count({
      where: { internalCode: { startsWith: "AL-SRC-" } },
    });
    if (supplierCount !== 63) {
      throw new Error(
        `Expected 63 preserved supplier records, received ${supplierCount}.`,
      );
    }
    const publishedSupplier = await prisma.product.count({
      where: {
        internalCode: { startsWith: "AL-SRC-" },
        publicationStatus: "PUBLISHED",
      },
    });
    if (publishedSupplier) {
      throw new Error(
        "Refusing to alter staging with published supplier products.",
      );
    }
    await prisma.product.updateMany({
      data: { publicationStatus: "DRAFT" },
      where: {
        internalCode: { startsWith: "AL-SRC-" },
        publicationStatus: "READY",
      },
    });
    for (const product of catalog.products) {
      await prisma.$transaction(
        (transaction) => importProduct(transaction as PrismaClient, product),
        { maxWait: 10_000, timeout: 30_000 },
      );
    }
    console.log(JSON.stringify(catalog.summary, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

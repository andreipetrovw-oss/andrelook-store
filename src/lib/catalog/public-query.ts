import "server-only";

import { Prisma } from "@prisma/client";

import { databaseLocale, type Locale } from "@/config/locales";
import { getPrisma } from "@/lib/db";

import {
  toPublicProductDto,
  type PublicProductDto,
  type PublicProductRecord,
} from "./public-dto";

const publicProductSelect = {
  availabilityType: true,
  brand: { select: { displayName: true, slug: true } },
  category: {
    select: {
      slug: true,
      translations: {
        select: { locale: true, name: true },
      },
    },
  },
  colors: {
    select: {
      code: true,
      swatchHex: true,
      translations: { select: { locale: true, name: true } },
    },
    where: { reviewStatus: "APPROVED" },
  },
  currency: true,
  id: true,
  images: {
    orderBy: { sortOrder: "asc" },
    select: {
      height: true,
      role: true,
      sortOrder: true,
      translations: { select: { altText: true, locale: true } },
      url: true,
      width: true,
    },
    where: { approvedAt: { not: null } },
  },
  preorderEstimateText: true,
  retailPriceMinor: true,
  sizeChart: {
    select: { chartData: true, units: true },
    where: { isPublished: true, reviewStatus: "APPROVED" },
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
} as const satisfies Prisma.ProductSelect;

function completePublicWhere(locale: Locale): Prisma.ProductWhereInput {
  return {
    availabilityType: { not: null },
    category: {
      is: { translations: { some: { locale: databaseLocale[locale] } } },
    },
    currency: { not: null },
    publicationStatus: "PUBLISHED",
    retailPriceMinor: { not: null },
    slug: { not: null },
    translations: { some: { locale: databaseLocale[locale] } },
  };
}

function mapRecord(
  record: Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>,
  locale: Locale,
): PublicProductDto | null {
  return toPublicProductDto(record as PublicProductRecord, locale);
}

export async function getPublicCatalog(
  locale: Locale,
): Promise<PublicProductDto[]> {
  const products = await getPrisma().product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: publicProductSelect,
    where: completePublicWhere(locale),
  });

  return products.flatMap((product) => {
    const dto = mapRecord(product, locale);
    return dto ? [dto] : [];
  });
}

export async function getPublicCategoryProducts(
  locale: Locale,
  categorySlug: string,
): Promise<PublicProductDto[]> {
  const products = await getPrisma().product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: publicProductSelect,
    where: {
      AND: [
        completePublicWhere(locale),
        { category: { is: { slug: categorySlug } } },
      ],
    },
  });

  return products.flatMap((product) => {
    const dto = mapRecord(product, locale);
    return dto ? [dto] : [];
  });
}

export async function getPublicProduct(
  locale: Locale,
  categorySlug: string,
  productSlug: string,
): Promise<PublicProductDto | null> {
  const product = await getPrisma().product.findFirst({
    select: publicProductSelect,
    where: {
      AND: [
        completePublicWhere(locale),
        { category: { is: { slug: categorySlug } } },
        { slug: productSlug },
      ],
    },
  });

  return product ? mapRecord(product, locale) : null;
}

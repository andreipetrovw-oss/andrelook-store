import "server-only";

import { Prisma } from "@prisma/client";

import { databaseLocale, type Locale } from "@/config/locales";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

import {
  toPublicProductDto,
  type PublicProductDto,
  type PublicProductRecord,
} from "./public-dto";
import { getCustomerCategoryName } from "./presentation";
import {
  approvedPublicAssetWhere,
  visiblePublicationStatuses,
} from "./visibility";

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
    where: approvedPublicAssetWhere,
  },
  preorderEstimateText: true,
  retailPriceMinor: true,
  sizeChart: {
    select: { chartData: true, isPublished: true, units: true },
    where: { reviewStatus: "APPROVED" },
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
  updatedAt: true,
} as const satisfies Prisma.ProductSelect;

export type StorefrontScope = "public" | "local-review";

export function storefrontProductWhere(
  locale: Locale,
  scope: StorefrontScope,
): Prisma.ProductWhereInput {
  const reviewAllowed =
    scope === "local-review" && getServerConfig().storefrontReviewMode;
  const statuses = visiblePublicationStatuses(scope, reviewAllowed);
  return {
    category: {
      is: { translations: { some: { locale: databaseLocale[locale] } } },
    },
    ...(reviewAllowed
      ? { publicationStatus: { in: [...statuses] } }
      : {
          availabilityType: { not: null },
          currency: { not: null },
          publicationStatus: "PUBLISHED" as const,
          retailPriceMinor: { not: null },
        }),
    slug: { not: null },
    translations: { some: { locale: databaseLocale[locale] } },
  };
}

function mapRecord(
  record: Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>,
  locale: Locale,
  scope: StorefrontScope,
): PublicProductDto | null {
  return toPublicProductDto(
    record as PublicProductRecord,
    locale,
    scope === "local-review" && getServerConfig().storefrontReviewMode,
  );
}

export async function getPublicCatalog(
  locale: Locale,
  scope: StorefrontScope = "public",
): Promise<PublicProductDto[]> {
  const products = await getPrisma().product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: publicProductSelect,
    where: storefrontProductWhere(locale, scope),
  });

  return products.flatMap((product) => {
    const dto = mapRecord(product, locale, scope);
    return dto ? [dto] : [];
  });
}

export async function getPublicCategoryProducts(
  locale: Locale,
  categorySlug: string,
  scope: StorefrontScope = "public",
): Promise<PublicProductDto[]> {
  const products = await getPrisma().product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: publicProductSelect,
    where: {
      AND: [
        storefrontProductWhere(locale, scope),
        { category: { is: { slug: categorySlug } } },
      ],
    },
  });

  return products.flatMap((product) => {
    const dto = mapRecord(product, locale, scope);
    return dto ? [dto] : [];
  });
}

export async function getPublicProduct(
  locale: Locale,
  categorySlug: string,
  productSlug: string,
  scope: StorefrontScope = "public",
): Promise<PublicProductDto | null> {
  const product = await getPrisma().product.findFirst({
    select: publicProductSelect,
    where: {
      AND: [
        storefrontProductWhere(locale, scope),
        { category: { is: { slug: categorySlug } } },
        { slug: productSlug },
      ],
    },
  });

  return product ? mapRecord(product, locale, scope) : null;
}

export type PublicCategoryDto = {
  name: string;
  slug: string;
  children: Array<{ name: string; slug: string; productCount: number }>;
};

export async function getPublicCategories(
  locale: Locale,
  scope: StorefrontScope = "public",
): Promise<PublicCategoryDto[]> {
  const dbLocale = databaseLocale[locale];
  const categories = await getPrisma().category.findMany({
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    select: {
      children: {
        orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
        select: {
          _count: {
            select: {
              products: { where: storefrontProductWhere(locale, scope) },
            },
          },
          slug: true,
          translations: {
            select: { locale: true, name: true },
            where: { locale: dbLocale },
          },
        },
        where: { isActive: true },
      },
      slug: true,
      translations: {
        select: { locale: true, name: true },
        where: { locale: dbLocale },
      },
    },
    where: { isActive: true, parentId: null },
  });

  return categories.flatMap((category) => {
    const translation = category.translations[0];
    if (!translation) return [];
    const children = category.children.flatMap((child) => {
      const childTranslation = child.translations[0];
      return childTranslation && child._count.products > 0
        ? [
            {
              name: getCustomerCategoryName(
                locale,
                child.slug,
                childTranslation.name,
              ),
              productCount: child._count.products,
              slug: child.slug,
            },
          ]
        : [];
    });
    return children.length
      ? [{ children, name: translation.name, slug: category.slug }]
      : [];
  });
}

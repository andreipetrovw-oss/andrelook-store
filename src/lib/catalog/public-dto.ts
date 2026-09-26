import type { Locale } from "@/config/locales";

export type PublicProductDto = {
  availability: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE";
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string };
  colors: Array<{ code: string; name: string; swatchHex: string | null }>;
  currency: string;
  description: string | null;
  id: string;
  images: Array<{
    alt: string;
    height: number;
    role: "PRIMARY" | "GALLERY" | "SIZE_CHART" | "DETAIL";
    url: string;
    width: number;
  }>;
  name: string;
  preorderEstimate: string | null;
  retailPriceMinor: number;
  shortDescription: string | null;
  sizeChart: { data: unknown; units: string | null } | null;
  slug: string;
};

type LocalizedText = { locale: "RU" | "ET" | "EN"; name: string };

export type PublicProductRecord = {
  availabilityType: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE" | null;
  brand: { displayName: string; slug: string } | null;
  category: {
    slug: string;
    translations: LocalizedText[];
  } | null;
  colors: Array<{
    code: string;
    swatchHex: string | null;
    translations: LocalizedText[];
  }>;
  currency: string | null;
  id: string;
  images: Array<{
    height: number;
    role: "PRIMARY" | "GALLERY" | "SIZE_CHART" | "DETAIL";
    sortOrder: number;
    translations: Array<{
      altText: string;
      locale: "RU" | "ET" | "EN";
    }>;
    url: string;
    width: number;
  }>;
  preorderEstimateText: string | null;
  retailPriceMinor: number | null;
  sizeChart: { chartData: unknown; units: string | null } | null;
  slug: string | null;
  translations: Array<{
    description: string | null;
    locale: "RU" | "ET" | "EN";
    name: string;
    shortDescription: string | null;
  }>;
};

const databaseLocale = { ru: "RU", et: "ET", en: "EN" } as const;

export function toPublicProductDto(
  record: PublicProductRecord,
  locale: Locale,
): PublicProductDto | null {
  const selectedLocale = databaseLocale[locale];
  const translation = record.translations.find(
    (item) => item.locale === selectedLocale,
  );
  const categoryTranslation = record.category?.translations.find(
    (item) => item.locale === selectedLocale,
  );

  if (
    !record.slug ||
    !record.availabilityType ||
    record.retailPriceMinor === null ||
    !record.currency ||
    !translation ||
    !record.category ||
    !categoryTranslation
  ) {
    return null;
  }

  return {
    availability: record.availabilityType,
    brand: record.brand
      ? { name: record.brand.displayName, slug: record.brand.slug }
      : null,
    category: {
      name: categoryTranslation.name,
      slug: record.category.slug,
    },
    colors: record.colors.flatMap((color) => {
      const colorTranslation = color.translations.find(
        (item) => item.locale === selectedLocale,
      );
      return colorTranslation
        ? [
            {
              code: color.code,
              name: colorTranslation.name,
              swatchHex: color.swatchHex,
            },
          ]
        : [];
    }),
    currency: record.currency,
    description: translation.description,
    id: record.id,
    images: [...record.images]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .flatMap((image) => {
        const imageTranslation = image.translations.find(
          (item) => item.locale === selectedLocale,
        );
        return imageTranslation
          ? [
              {
                alt: imageTranslation.altText,
                height: image.height,
                role: image.role,
                url: image.url,
                width: image.width,
              },
            ]
          : [];
      }),
    name: translation.name,
    preorderEstimate: record.preorderEstimateText,
    retailPriceMinor: record.retailPriceMinor,
    shortDescription: translation.shortDescription,
    sizeChart: record.sizeChart
      ? { data: record.sizeChart.chartData, units: record.sizeChart.units }
      : null,
    slug: record.slug,
  };
}

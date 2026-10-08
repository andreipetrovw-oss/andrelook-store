import type { Metadata } from "next";

import {
  defaultLocale,
  localePath,
  locales,
  type Locale,
} from "@/config/locales";
import { getServerConfig } from "@/lib/env";

const openGraphLocales: Record<Locale, string> = {
  en: "en_GB",
  et: "et_EE",
  ru: "ru_RU",
};

export function localizedOpenGraph(locale: Locale) {
  return {
    alternateLocale: locales
      .filter((item) => item !== locale)
      .map((item) => openGraphLocales[item]),
    locale: openGraphLocales[locale],
  };
}

export function brandedTitle(title: string) {
  return `${title} | Andrelook`;
}

export function localizedAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const config = getServerConfig();
  const pathFor = (targetLocale: Locale) => localePath(targetLocale, path);

  return {
    canonical: new URL(pathFor(locale), config.siteUrl).toString(),
    languages: Object.fromEntries([
      ...locales.map((targetLocale) => [
        targetLocale,
        new URL(pathFor(targetLocale), config.siteUrl).toString(),
      ]),
      ["x-default", new URL(pathFor(defaultLocale), config.siteUrl).toString()],
    ]),
  };
}

export function indexingRobots(): NonNullable<Metadata["robots"]> {
  const enabled = getServerConfig().indexingEnabled;
  return enabled
    ? { follow: true, index: true }
    : { follow: false, index: false, nocache: true };
}

export function productStructuredData({
  availability,
  brand,
  currency,
  description,
  images,
  name,
  priceMinor,
  url,
}: {
  availability: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE" | null;
  brand: string | null;
  currency: string | null;
  description: string | null;
  images: string[];
  name: string;
  priceMinor: number | null;
  url: string;
}) {
  const productionOrigin = new URL(url).origin;
  const offer =
    availability && currency && priceMinor !== null
      ? {
          "@type": "Offer",
          availability: {
            IN_STOCK: "https://schema.org/InStock",
            PRE_ORDER: "https://schema.org/PreOrder",
            UNAVAILABLE: "https://schema.org/OutOfStock",
          }[availability],
          price: (priceMinor / 100).toFixed(2),
          priceCurrency: currency,
          url,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    description: description ?? undefined,
    image: images.map((image) => new URL(image, productionOrigin).toString()),
    name,
    offers: offer,
    url,
  };
}

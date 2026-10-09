import type { Metadata } from "next";

import {
  defaultLocale,
  localePath,
  locales,
  type Locale,
} from "@/config/locales";
import { getServerConfig } from "@/lib/env";

export const canonicalEntityName = "Andrelook";

export const publicSocialProfiles = [
  "https://t.me/andrelookstore",
  "https://www.instagram.com/andrelook.store/",
] as const;

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

export function organizationStructuredData(siteUrl: URL) {
  const origin = siteUrl.origin;
  return {
    "@context": "https://schema.org",
    "@id": `${origin}/#organization`,
    "@type": "Organization",
    areaServed: [
      { "@type": "City", name: "Tallinn" },
      { "@type": "Country", name: "Estonia" },
      { "@type": "Place", name: "Europe" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      availableLanguage: ["Estonian", "Russian", "English"],
      contactType: "customer service",
      email: "info.andrelook@gmail.com",
    },
    description:
      "Andrelook is a Tallinn-based pre-order fashion service with a curated selection of Moncler and Parajumpers products, personal sizing support and delivery in Europe.",
    email: "info.andrelook@gmail.com",
    logo: {
      "@type": "ImageObject",
      contentUrl: new URL("/brand/logo.png", siteUrl).toString(),
      height: 302,
      width: 476,
    },
    name: canonicalEntityName,
    sameAs: [...publicSocialProfiles],
    url: origin,
  };
}

export function websiteStructuredData(siteUrl: URL) {
  const origin = siteUrl.origin;
  return {
    "@context": "https://schema.org",
    "@id": `${origin}/#website`,
    "@type": "WebSite",
    inLanguage: ["et", "ru", "en"],
    name: canonicalEntityName,
    publisher: { "@id": `${origin}/#organization` },
    url: origin,
  };
}

export function faqPageStructuredData(
  sections: Array<{ body: string; title: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.map((section) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: section.body },
      name: section.title,
    })),
  };
}

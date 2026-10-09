import type { MetadataRoute } from "next";

import {
  defaultLocale,
  localePath,
  locales,
  type Locale,
} from "@/config/locales";
import { publicBrandSlugs } from "@/i18n/brand-content";
import { infoPageSlugs } from "@/i18n/info-content";
import { getPublicCatalog } from "@/lib/catalog/public-query";
import { getServerConfig } from "@/lib/env";

type SitemapEntry = MetadataRoute.Sitemap[number];

function localizedLanguages(path: string, siteUrl: URL) {
  return Object.fromEntries([
    ...locales.map((locale) => [
      locale,
      new URL(localePath(locale, path), siteUrl).toString(),
    ]),
    ["x-default", new URL(localePath(defaultLocale, path), siteUrl).toString()],
  ]);
}

function sitemapEntry({
  images,
  lastModified,
  locale,
  path,
  priority,
  siteUrl,
}: {
  images?: string[];
  lastModified?: string;
  locale: Locale;
  path: string;
  priority: number;
  siteUrl: URL;
}): SitemapEntry {
  return {
    alternates: { languages: localizedLanguages(path, siteUrl) },
    changeFrequency: "weekly",
    images,
    lastModified,
    priority,
    url: new URL(localePath(locale, path), siteUrl).toString(),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getServerConfig();
  if (!config.indexingEnabled) return [];

  const entries = await Promise.all(
    locales.map(async (locale) => {
      const products = await getPublicCatalog(locale, "public");
      const categories = [
        ...new Set(products.map((product) => product.category.slug)),
      ];
      const staticEntries = [
        sitemapEntry({
          locale,
          path: "",
          priority: 1,
          siteUrl: config.siteUrl,
        }),
        sitemapEntry({
          locale,
          path: "catalog",
          priority: 0.9,
          siteUrl: config.siteUrl,
        }),
        ...publicBrandSlugs.map((brandSlug) =>
          sitemapEntry({
            locale,
            path: `brands/${brandSlug}`,
            priority: 0.8,
            siteUrl: config.siteUrl,
          }),
        ),
        ...categories.map((categorySlug) =>
          sitemapEntry({
            locale,
            path: `catalog/${categorySlug}`,
            priority: 0.8,
            siteUrl: config.siteUrl,
          }),
        ),
        ...infoPageSlugs.map((slug) =>
          sitemapEntry({
            locale,
            path: slug,
            priority: slug === "about" || slug === "faq" ? 0.7 : 0.6,
            siteUrl: config.siteUrl,
          }),
        ),
      ];
      const productEntries = products.map((product) =>
        sitemapEntry({
          images: product.images.map((image) =>
            new URL(image.url, config.siteUrl).toString(),
          ),
          lastModified: product.version,
          locale,
          path: `catalog/${product.category.slug}/${product.slug}`,
          priority: 0.9,
          siteUrl: config.siteUrl,
        }),
      );
      return [...staticEntries, ...productEntries];
    }),
  );

  return entries.flat();
}

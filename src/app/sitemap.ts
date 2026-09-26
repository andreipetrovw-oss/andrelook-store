import type { MetadataRoute } from "next";

import { localePath, locales } from "@/config/locales";
import { getPublicCatalog } from "@/lib/catalog/public-query";
import { getServerConfig } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getServerConfig();
  if (!config.indexingEnabled) {
    return [];
  }

  const entries = await Promise.all(
    locales.map(async (locale) => {
      const products = await getPublicCatalog(locale, "public");
      const paths = new Set([
        localePath(locale),
        localePath(locale, "catalog"),
        ...products.map((product) =>
          localePath(locale, `catalog/${product.category.slug}`),
        ),
        ...products.map((product) =>
          localePath(
            locale,
            `catalog/${product.category.slug}/${product.slug}`,
          ),
        ),
      ]);
      return [...paths].map((path) => ({
        changeFrequency: "weekly" as const,
        priority: path === localePath(locale) ? 1 : 0.8,
        url: new URL(path, config.siteUrl).toString(),
      }));
    }),
  );

  return entries.flat();
}

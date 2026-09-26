import type { MetadataRoute } from "next";

import { localePath, locales } from "@/config/locales";
import { getServerConfig } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getServerConfig();
  if (!config.indexingEnabled) {
    return [];
  }

  return locales.flatMap((locale) =>
    [localePath(locale), localePath(locale, "catalog")].map((path) => ({
      changeFrequency: "weekly" as const,
      priority: path.endsWith("catalog") ? 0.8 : 1,
      url: new URL(path, config.siteUrl).toString(),
    })),
  );
}

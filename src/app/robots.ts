import type { MetadataRoute } from "next";

import { getServerConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const config = getServerConfig();
  return config.indexingEnabled
    ? {
        host: config.siteUrl.origin,
        rules: { allow: "/", disallow: "/admin/", userAgent: "*" },
        sitemap: new URL("/sitemap.xml", config.siteUrl).toString(),
      }
    : { rules: { disallow: "/", userAgent: "*" } };
}

import type { MetadataRoute } from "next";

import { getServerConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const config = getServerConfig();
  const privatePaths = ["/admin", "/api/", "/sign-in"];
  return config.indexingEnabled
    ? {
        host: config.siteUrl.origin,
        rules: [
          { allow: "/", disallow: privatePaths, userAgent: "*" },
          {
            allow: "/",
            disallow: privatePaths,
            userAgent: "Googlebot",
          },
          {
            allow: "/",
            disallow: privatePaths,
            userAgent: "Bingbot",
          },
          {
            allow: "/",
            disallow: privatePaths,
            userAgent: "OAI-SearchBot",
          },
        ],
        sitemap: new URL("/sitemap.xml", config.siteUrl).toString(),
      }
    : { rules: { disallow: "/", userAgent: "*" } };
}

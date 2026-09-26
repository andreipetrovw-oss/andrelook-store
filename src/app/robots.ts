import type { MetadataRoute } from "next";

import { getServerConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const config = getServerConfig();
  return config.indexingEnabled
    ? { rules: { allow: "/", disallow: "/admin/", userAgent: "*" } }
    : { rules: { disallow: "/", userAgent: "*" } };
}

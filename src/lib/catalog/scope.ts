import "server-only";

import { getServerConfig } from "@/lib/env";

import type { StorefrontScope } from "./public-query";

export function storefrontScope(): StorefrontScope {
  return getServerConfig().storefrontReviewMode ? "local-review" : "public";
}

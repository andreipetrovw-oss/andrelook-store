import "server-only";
import { getServerConfig } from "@/lib/env";

export function reviewSiteUrl() {
  // Keep production invitations canonical, and keep isolated preview UAT on
  // the actual protected deployment instead of an older staging alias.
  if (
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_PROJECT_ID === "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m" &&
    process.env.VERCEL_URL?.endsWith(".vercel.app")
  ) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return getServerConfig().siteUrl;
}

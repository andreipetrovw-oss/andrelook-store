import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getServerConfig } from "./env";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("staging environment safety", () => {
  it("allows review mode only on localhost", () => {
    process.env.STOREFRONT_REVIEW_MODE = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getServerConfig().storefrontReviewMode).toBe(true);
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://andrelook-v1-staging.vercel.app";
    expect(getServerConfig().storefrontReviewMode).toBe(false);
  });

  it("binds remote review mode to one exact Vercel project", () => {
    process.env.STOREFRONT_REVIEW_MODE = "true";
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://andrelook-v1-staging.vercel.app";
    process.env.STAGING_REVIEW_PROJECT_ID = "prj_staging";
    process.env.VERCEL_PROJECT_ID = "prj_other";
    expect(getServerConfig().storefrontReviewMode).toBe(false);
    process.env.VERCEL_PROJECT_ID = "prj_staging";
    expect(getServerConfig().storefrontReviewMode).toBe(true);
  });

  it("fails closed when Clerk is selected without complete credentials", () => {
    process.env.AUTH_PROVIDER = "clerk";
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.OWNER_EMAILS;
    expect(() => getServerConfig()).toThrow("Clerk authentication requires");
  });

  it("uses the dedicated CRM origin when configured", () => {
    process.env.CRM_URL = "https://crm.andrelook.store";
    expect(getServerConfig().crmUrl?.origin).toBe(
      "https://crm.andrelook.store",
    );
  });
});

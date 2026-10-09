import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import robots from "./robots";

const originalIndexing = process.env.INDEXING_ENABLED;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalIndexing === undefined) delete process.env.INDEXING_ENABLED;
  else process.env.INDEXING_ENABLED = originalIndexing;
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("robots policy", () => {
  it("allows discovery crawlers and keeps private surfaces disallowed", () => {
    process.env.INDEXING_ENABLED = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.andrelook.store";

    const result = robots();
    expect(result.rules).toEqual([
      {
        allow: "/",
        disallow: ["/admin", "/api/", "/sign-in"],
        userAgent: "*",
      },
      {
        allow: "/",
        disallow: ["/admin", "/api/", "/sign-in"],
        userAgent: "Googlebot",
      },
      {
        allow: "/",
        disallow: ["/admin", "/api/", "/sign-in"],
        userAgent: "Bingbot",
      },
      {
        allow: "/",
        disallow: ["/admin", "/api/", "/sign-in"],
        userAgent: "OAI-SearchBot",
      },
    ]);
    expect(result.sitemap).toBe("https://www.andrelook.store/sitemap.xml");
    expect(JSON.stringify(result.rules)).not.toContain("GPTBot");
  });

  it("keeps non-production environments fully blocked", () => {
    process.env.INDEXING_ENABLED = "false";
    expect(robots()).toEqual({
      rules: { disallow: "/", userAgent: "*" },
    });
  });
});

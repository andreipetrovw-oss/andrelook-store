import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { localizedAlternates } from "./seo";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("localized metadata", () => {
  it("emits distinct absolute hreflang URLs and the provisional RU default", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.test";

    expect(localizedAlternates("et", "/catalog/outerwear/")).toEqual({
      canonical: "https://staging.example.test/et/catalog/outerwear",
      languages: {
        en: "https://staging.example.test/en/catalog/outerwear",
        et: "https://staging.example.test/et/catalog/outerwear",
        ru: "https://staging.example.test/ru/catalog/outerwear",
        "x-default": "https://staging.example.test/ru/catalog/outerwear",
      },
    });
  });
});

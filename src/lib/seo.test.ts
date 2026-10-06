import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "./seo";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalIndexing = process.env.INDEXING_ENABLED;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
  if (originalIndexing === undefined) delete process.env.INDEXING_ENABLED;
  else process.env.INDEXING_ENABLED = originalIndexing;
});

describe("localized metadata", () => {
  it("emits distinct absolute hreflang URLs and the owner-approved ET default", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.test";

    expect(localizedAlternates("et", "/catalog/outerwear/")).toEqual({
      canonical: "https://staging.example.test/et/catalog/outerwear",
      languages: {
        en: "https://staging.example.test/en/catalog/outerwear",
        et: "https://staging.example.test/et/catalog/outerwear",
        ru: "https://staging.example.test/ru/catalog/outerwear",
        "x-default": "https://staging.example.test/et/catalog/outerwear",
      },
    });
  });

  it("emits localized OpenGraph locales and consistent branded titles", () => {
    expect(localizedOpenGraph("et")).toEqual({
      alternateLocale: ["ru_RU", "en_GB"],
      locale: "et_EE",
    });
    expect(brandedTitle("Kataloog")).toBe("Kataloog | Andrelook");
  });

  it("keeps staging noindex unless indexing is explicitly enabled", () => {
    process.env.INDEXING_ENABLED = "false";
    expect(indexingRobots()).toEqual({
      follow: false,
      index: false,
      nocache: true,
    });
  });
});

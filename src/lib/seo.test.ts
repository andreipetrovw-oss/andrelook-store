import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  brandedTitle,
  faqPageStructuredData,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
  organizationStructuredData,
  productStructuredData,
  websiteStructuredData,
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

  it("emits Product schema without inventing an Offer before price approval", () => {
    const withoutPrice = productStructuredData({
      availability: "PRE_ORDER",
      brand: "Moncler",
      currency: "EUR",
      description: "Evidence-backed product description.",
      images: ["/products/example.webp"],
      name: "Maya Down Jacket",
      priceMinor: null,
      url: "https://staging.example.test/en/catalog/jackets/maya",
    });
    expect(withoutPrice["@type"]).toBe("Product");
    expect(withoutPrice.offers).toBeUndefined();

    const withPrice = productStructuredData({
      ...withoutPrice,
      availability: "PRE_ORDER",
      brand: "Moncler",
      currency: "EUR",
      description: "Evidence-backed product description.",
      images: ["/products/example.webp"],
      name: "Maya Down Jacket",
      priceMinor: 12500,
      url: "https://www.andrelook.store/en/catalog/jackets/maya",
    });
    expect(withPrice.offers).toMatchObject({
      availability: "https://schema.org/PreOrder",
      price: "125.00",
      priceCurrency: "EUR",
    });
    expect(withPrice.offers).not.toHaveProperty("priceValidUntil");
    expect(withPrice.image).toEqual([
      "https://www.andrelook.store/products/example.webp",
    ]);
  });

  it("emits stable factual Organization and WebSite entities", () => {
    const siteUrl = new URL("https://www.andrelook.store");
    const organization = organizationStructuredData(siteUrl);
    const website = websiteStructuredData(siteUrl);

    expect(organization).toMatchObject({
      "@id": "https://www.andrelook.store/#organization",
      "@type": "Organization",
      email: "info.andrelook@gmail.com",
      name: "Andrelook",
      url: "https://www.andrelook.store",
    });
    expect(organization).not.toHaveProperty("address");
    expect(organization).not.toHaveProperty("legalName");
    expect(organization).not.toHaveProperty("telephone");
    expect(website).toEqual({
      "@context": "https://schema.org",
      "@id": "https://www.andrelook.store/#website",
      "@type": "WebSite",
      inLanguage: ["et", "ru", "en"],
      name: "Andrelook",
      publisher: { "@id": "https://www.andrelook.store/#organization" },
      url: "https://www.andrelook.store",
    });
  });

  it("maps visible FAQ copy without adding claims", () => {
    expect(
      faqPageStructuredData([{ body: "Visible answer", title: "Question?" }]),
    ).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: { "@type": "Answer", text: "Visible answer" },
          name: "Question?",
        },
      ],
    });
  });
});

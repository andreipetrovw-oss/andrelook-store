import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { trustContent } from "./trust-content";
import { getInfoPage } from "./info-content";
import { getStorefrontContent } from "./storefront-content";

describe("concrete localized process explanations", () => {
  for (const locale of ["et", "ru", "en"] as const) {
    it(`${locale}: shares six real steps between home and how-to-order`, () => {
      const trust = trustContent[locale];
      expect(trust.steps).toHaveLength(6);
      expect(getStorefrontContent(locale).home.orderSteps).toEqual(trust.steps);
      expect(getInfoPage(locale, "how-to-order")?.sections).toEqual(
        trust.steps,
      );
      expect(getStorefrontContent(locale).home.serviceItems).toHaveLength(4);
      expect(getStorefrontContent(locale).home.heroTitle).toBe("ANDRELOOK");
      expect(getInfoPage(locale, "faq")?.sections.slice(-2)).toEqual([
        { title: trust.trackingTitle, body: trust.tracking },
        { title: trust.reviewTitle, body: trust.review },
      ]);
      expect(
        new Set(getInfoPage(locale, "faq")?.sections.map((s) => s.title)).size,
      ).toBe(10);
      expect(JSON.stringify(trust)).not.toMatch(
        /17track|superbuy|dhl|CM526|GPS|100%|24\/7|Andreluk OÜ/i,
      );
    });
  }
  it("keeps the existing product configurator before the explanatory copy", () => {
    const pdp = readFileSync(
      "src/app/(localized)/[locale]/catalog/[categorySlug]/[productSlug]/page.tsx",
      "utf8",
    );
    expect(pdp.indexOf("<ProductConfigurator")).toBeLessThan(
      pdp.indexOf('className="product-trust-note"'),
    );
    expect(pdp).toContain("href={`/track?lang=${locale}`}");
  });
});

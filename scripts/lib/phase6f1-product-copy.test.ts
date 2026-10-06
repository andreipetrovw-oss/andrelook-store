import { describe, expect, it } from "vitest";

import { productDescriptions } from "./phase6f1-product-copy";

const locales = ["ru", "et", "en"] as const;

describe("Phase 6F launch product copy", () => {
  it("has complete, distinct descriptions for all 23 launch products", () => {
    expect(Object.keys(productDescriptions)).toHaveLength(23);
    for (const locale of locales) {
      const descriptions = Object.values(productDescriptions).map(
        (description) => description[locale],
      );
      expect(new Set(descriptions).size).toBe(23);
      for (const description of descriptions) {
        expect(description.length).toBeGreaterThan(120);
        expect(description).not.toMatch(
          /authentic|authorized retailer|waterproof|водонепроница|veekindel|guaranteed|гарантирован|garanteeritud/i,
        );
      }
    }
  });
});

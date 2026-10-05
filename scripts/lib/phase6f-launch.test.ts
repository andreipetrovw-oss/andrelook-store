import { describe, expect, it } from "vitest";

import {
  readPhase6fLaunchCatalog,
  verifyPhase6fAssetHashes,
} from "./phase6f-launch";
import { categoryNames, productDescriptions } from "./phase6f1-product-copy";

describe("Phase 6F launch catalog", () => {
  it("preserves the approved launch counts and evidence-safe mappings", async () => {
    const catalog = await readPhase6fLaunchCatalog();

    expect(catalog.products).toHaveLength(23);
    expect(catalog.products.flatMap((product) => product.images)).toHaveLength(
      53,
    );
    expect(
      catalog.products.filter((product) => product.sizeChart),
    ).toHaveLength(17);
    expect(
      catalog.products.filter((product) => !product.sizeChart),
    ).toHaveLength(6);
    expect(
      new Set(
        catalog.products.flatMap((product) =>
          product.phase5Mapping ? [product.phase5Mapping.sourceInternalId] : [],
        ),
      ).size,
    ).toBe(17);
    await expect(verifyPhase6fAssetHashes(catalog)).resolves.toBeUndefined();
  });

  it("has complete customer-facing copy for every launch product and locale", () => {
    const locales = ["ru", "et", "en"] as const;

    expect(Object.keys(productDescriptions)).toHaveLength(23);
    expect(Object.keys(categoryNames)).toHaveLength(6);
    for (let id = 1; id <= 23; id += 1) {
      for (const locale of locales) {
        expect(productDescriptions[id]?.[locale].trim().length).toBeGreaterThan(
          40,
        );
      }
    }
    for (const category of Object.values(categoryNames)) {
      for (const locale of locales) {
        expect(category[locale].trim()).not.toBe("");
      }
    }
  });
});

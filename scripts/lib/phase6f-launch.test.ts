import { describe, expect, it } from "vitest";

import {
  readPhase6fLaunchCatalog,
  verifyPhase6fAssetHashes,
} from "./phase6f-launch";

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
});

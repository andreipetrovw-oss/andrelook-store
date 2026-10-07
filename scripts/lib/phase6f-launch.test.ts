import { describe, expect, it } from "vitest";

import {
  readPhase6fLaunchCatalog,
  verifyPhase6fAssetHashes,
} from "./phase6f-launch";
import { categoryNames, productDescriptions } from "./phase6f1-product-copy";

describe("Phase 6F launch catalog", () => {
  it("preserves the approved commercial launch counts and evidence-safe mappings", async () => {
    const catalog = await readPhase6fLaunchCatalog();
    const publicProducts = catalog.products.filter(
      (product) => product.publicationStatus === "READY",
    );
    const tibb = catalog.products.find(
      (product) => product.internalCode === "AL-LEGACY-006",
    );

    expect(catalog.products).toHaveLength(23);
    expect(publicProducts).toHaveLength(22);
    expect(catalog.products.flatMap((product) => product.images)).toHaveLength(
      53,
    );
    expect(publicProducts.filter((product) => product.sizeChart)).toHaveLength(
      22,
    );
    expect(
      publicProducts.filter((product) => product.retailPriceMinor !== null),
    ).toHaveLength(22);
    expect(tibb).toMatchObject({
      publicationStatus: "DRAFT",
      retailPriceMinor: null,
      sizeChart: null,
    });
    expect(
      new Set(
        catalog.products.flatMap((product) =>
          product.phase5Mapping ? [product.phase5Mapping.sourceInternalId] : [],
        ),
      ).size,
    ).toBe(17);
    await expect(verifyPhase6fAssetHashes(catalog)).resolves.toBeUndefined();
  });

  it("locks every owner-approved public EUR price without recalculation", async () => {
    const catalog = await readPhase6fLaunchCatalog();
    const expectedPrices = {
      "AL-LEGACY-001": 25_900,
      "AL-LEGACY-002": 28_900,
      "AL-LEGACY-003": 27_900,
      "AL-LEGACY-004": 22_900,
      "AL-LEGACY-005": 21_900,
      "AL-LEGACY-007": 21_900,
      "AL-LEGACY-008": 19_900,
      "AL-LEGACY-009": 18_900,
      "AL-LEGACY-010": 19_900,
      "AL-LEGACY-011": 20_900,
      "AL-LEGACY-012": 24_900,
      "AL-LEGACY-013": 23_900,
      "AL-LEGACY-014": 19_900,
      "AL-LEGACY-015": 21_900,
      "AL-LEGACY-016": 21_900,
      "AL-LEGACY-017": 6_900,
      "AL-LEGACY-018": 7_900,
      "AL-LEGACY-019": 7_900,
      "AL-LEGACY-020": 14_900,
      "AL-LEGACY-021": 11_900,
      "AL-LEGACY-022": 7_900,
      "AL-LEGACY-023": 6_900,
    } as const;

    expect(
      Object.fromEntries(
        catalog.products
          .filter((product) => product.publicationStatus === "READY")
          .map((product) => [product.internalCode, product.retailPriceMinor]),
      ),
    ).toEqual(expectedPrices);
  });

  it("maps only the five newly owner-supplied exact first-image charts", async () => {
    const catalog = await readPhase6fLaunchCatalog();
    const expected = {
      "AL-LEGACY-009": [
        "209196360",
        "07d52e592409c40a1e121f96b608f73085efdd18f13d9260c219724d867dac3b",
      ],
      "AL-LEGACY-013": [
        "203151534",
        "c9986bc9f7afcde98fe079ce11e42d11e2c1b0a1a483f2735016355b6b834894",
      ],
      "AL-LEGACY-019": [
        "198289561",
        "c56cd616f31918fd656883e95b9906a66b38150c30f9e53ba035051ac70d7240",
      ],
      "AL-LEGACY-020": [
        "209196624",
        "e31d1de4b0a7a7d1bf83bd16e6c227d1b678579f7ffa0372f882b782b6ccc467",
      ],
      "AL-LEGACY-022": [
        "209196436",
        "b41b57ee48e63211d9fe7fb0c5fa54bafb303479802d7c5af049fd1b7c1f1800",
      ],
    } as const;

    for (const [internalCode, [albumId, imageSha256]] of Object.entries(
      expected,
    )) {
      const chart = catalog.products.find(
        (product) => product.internalCode === internalCode,
      )?.sizeChart;
      expect(chart).toMatchObject({
        evidence: {
          chartScope: null,
          sourceAlbumId: albumId,
          sourceImagePosition: 1,
          sourceImageSha256: imageSha256,
          verification: "OWNER_EXACT_SOURCE_AND_VISUALLY_VERIFIED",
        },
        units: null,
      });
      expect(chart?.evidence.notes).toContain(
        'The source label "Bust" is preserved exactly; the chart does not explicitly state width/half-chest versus circumference.',
      );
    }
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

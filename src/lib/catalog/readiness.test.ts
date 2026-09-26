import { describe, expect, it } from "vitest";

import {
  assertPublicationReady,
  evaluatePublicationReadiness,
  type PublicationReadinessInput,
} from "./readiness";

function completeProduct(): PublicationReadinessInput {
  return {
    availabilityType: "IN_STOCK",
    categoryId: "category",
    currency: "EUR",
    enabledVariantCount: 1,
    primaryImages: [
      {
        approvedAt: new Date("2026-09-26T00:00:00Z"),
        reviewStatus: "APPROVED",
      },
    ],
    retailPriceMinor: 25_000,
    review: {
      blockingIssues: [],
      categoryDecision: "APPROVED",
      commercialDecision: "APPROVED",
      contentDecision: "APPROVED",
      identityDecision: "APPROVED",
      imageDecision: "APPROVED",
      optionsDecision: "APPROVED",
      ownerPublicationApproved: true,
      sizeDecision: "APPROVED",
      visualDecision: "APPROVED",
    },
    sizeChart: { isPublished: true, reviewStatus: "APPROVED" },
    slug: "golden-product",
    translations: ["RU", "ET", "EN"].map((locale) => ({
      description: `${locale} description`,
      locale,
      name: `${locale} name`,
    })),
  };
}

describe("golden product publication readiness", () => {
  it("passes only when every source and owner gate passes", () => {
    expect(evaluatePublicationReadiness(completeProduct()).ready).toBe(true);
  });

  it("blocks missing commercial facts, public imagery and owner approval", () => {
    const product = completeProduct();
    product.retailPriceMinor = null;
    product.primaryImages = [];
    product.review!.ownerPublicationApproved = false;
    expect(evaluatePublicationReadiness(product)).toMatchObject({
      ready: false,
      reasons: expect.arrayContaining([
        "commercial",
        "imagery",
        "ownerApproval",
      ]),
    });
    expect(() => assertPublicationReady(product)).toThrow(
      "Product is not publication-ready",
    );
  });

  it("blocks unresolved review issues and missing localized descriptions", () => {
    const product = completeProduct();
    product.review!.blockingIssues = ["Confirm colour"];
    product.translations[1]!.description = null;
    const result = evaluatePublicationReadiness(product);
    expect(result.checks.noBlockingIssues).toBe(false);
    expect(result.checks.content).toBe(false);
  });
});

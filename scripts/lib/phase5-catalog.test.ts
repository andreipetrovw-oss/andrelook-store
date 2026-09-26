import { describe, expect, it } from "vitest";

import {
  parseCatalog,
  privateReviewStatus,
  summarizeCatalog,
  taxonomySlug,
  type Phase5Product,
} from "./phase5-catalog";

function product(
  readiness: "CATALOG CANDIDATE" | "REVIEW BEFORE CATALOG",
  chart: boolean,
): Phase5Product {
  return {
    colours: {},
    data_quality: {
      catalog_readiness: readiness,
      owner_review_required: readiness === "REVIEW BEFORE CATALOG",
      review_notes: [],
    },
    future_fields: { retail_price: null, publication_status: null },
    identity: {
      category: "Outerwear",
      normalized_internal_name: "Internal name",
      subcategory: "Shell & rain jackets",
    },
    images: {
      source_references: [
        { position: 1, url: "https://private.invalid/one.jpg" },
        { position: 2, url: "https://private.invalid/two.jpg" },
      ],
    },
    internal_id: `AL-${readiness}`,
    size_data: {
      chart: chart
        ? { measurements: [], sizes: ["S"], verification: "VERIFIED" }
        : null,
      status: chart ? "SIZE CHART VERIFIED" : "NO SIZE CHART",
    },
    source: {
      source_id: "supplier-id",
      supplier: "Private supplier",
      url: "https://private.invalid/album",
    },
    supplier_pricing: { currency: "RMB", price: 100 },
  };
}

describe("Phase 5C1 catalog parser", () => {
  it("summarizes candidates, review records, images and charts", () => {
    const catalog = parseCatalog({
      artifact_type: "test",
      products: [
        product("CATALOG CANDIDATE", true),
        product("REVIEW BEFORE CATALOG", false),
      ],
      schema_version: "test",
      summary: {},
    });

    expect(summarizeCatalog(catalog)).toEqual({
      candidates: 1,
      products: 2,
      reviewBeforeCatalog: 1,
      sourceImages: 4,
      verifiedSizeCharts: 1,
    });
  });

  it("maps readiness without inventing approval", () => {
    expect(privateReviewStatus(product("CATALOG CANDIDATE", true))).toBe(
      "CANDIDATE",
    );
    expect(privateReviewStatus(product("REVIEW BEFORE CATALOG", true))).toBe(
      "NEEDS_REVIEW",
    );
  });

  it("creates stable internal taxonomy slugs", () => {
    expect(taxonomySlug("Shell & rain jackets")).toBe("shell-and-rain-jackets");
  });
});

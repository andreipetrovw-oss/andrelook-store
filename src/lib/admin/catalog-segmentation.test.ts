import { describe, expect, it } from "vitest";

import {
  getAdminCatalogOverview,
  getAdminCatalogSection,
  getAdminCatalogView,
} from "./catalog-segmentation";

function product(
  internalCode: string,
  publicationStatus: string,
  ready = true,
) {
  return {
    availabilityType: ready ? "PRE_ORDER" : null,
    contentComplete: ready,
    currency: ready ? "EUR" : null,
    imageReady: ready,
    internalCode,
    publicationStatus,
    retailPriceMinor: ready ? 10_000 : null,
    sizeReady: ready,
  };
}

describe("owner catalog presentation", () => {
  it("uses published products as the default operational view", () => {
    expect(getAdminCatalogView()).toBe("published");
    expect(getAdminCatalogView("research")).toBe("research");
    expect(getAdminCatalogView("invalid")).toBe("published");
  });

  it("separates 22 launch products, 63 research records and private Tibb", () => {
    const products = [
      ...Array.from({ length: 22 }, (_, index) =>
        product(`AL-LEGACY-${String(index + 1).padStart(3, "0")}`, "PUBLISHED"),
      ),
      ...Array.from({ length: 63 }, (_, index) =>
        product(`AL-SRC-TEST-${index + 1}`, "DRAFT", false),
      ),
      product("AL-LEGACY-006", "ARCHIVED", false),
    ];

    const overview = getAdminCatalogOverview(products);
    expect(overview.published).toHaveLength(22);
    expect(overview.research).toHaveLength(63);
    expect(overview.drafts.map((item) => item.internalCode)).toEqual([
      "AL-LEGACY-006",
    ]);
    expect(overview.ready).toBe(22);
    expect(overview.metrics).toEqual({
      availability: 22,
      charts: 22,
      content: 22,
      images: 22,
      prices: 22,
    });
  });

  it("never treats a research record as launch readiness", () => {
    expect(getAdminCatalogSection(product("AL-SRC-EXACT", "PUBLISHED"))).toBe(
      "research",
    );
    expect(getAdminCatalogSection(product("AL-LEGACY-006", "ARCHIVED"))).toBe(
      "drafts",
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  assessRequestEligibility,
  type RequestEligibilityProduct,
} from "./eligibility";

const product: RequestEligibilityProduct = {
  availability: "PRE_ORDER",
  colours: ["black"],
  currency: "EUR",
  publicationStatus: "PUBLISHED",
  retailPriceMinor: 25_000,
  sizes: ["S", "M"],
  version: "2026-09-26T12:00:00.000Z",
};
const request = {
  colour: "black",
  productVersion: product.version,
  size: "M",
};

describe("server-side request eligibility", () => {
  it("accepts only a current selectable published product", () => {
    expect(assessRequestEligibility(product, request, false)).toBeNull();
  });

  it("rejects draft, stale and incomplete published products", () => {
    expect(
      assessRequestEligibility(
        { ...product, publicationStatus: "DRAFT" },
        request,
        false,
      ),
    ).toBe("not-found");
    expect(
      assessRequestEligibility(
        product,
        { ...request, productVersion: "stale" },
        false,
      ),
    ).toBe("selection");
    expect(
      assessRequestEligibility(
        { ...product, retailPriceMinor: null },
        request,
        false,
      ),
    ).toBe("not-found");
  });

  it("rejects unavailable and invalid size or colour selections", () => {
    expect(
      assessRequestEligibility(
        { ...product, availability: "UNAVAILABLE" },
        request,
        false,
      ),
    ).toBe("unavailable");
    expect(
      assessRequestEligibility(product, { ...request, size: "XL" }, false),
    ).toBe("selection");
    expect(
      assessRequestEligibility(product, { ...request, colour: "white" }, false),
    ).toBe("selection");
  });

  it("permits incomplete READY records only for explicit local review", () => {
    const ready = {
      ...product,
      availability: null,
      currency: null,
      publicationStatus: "READY" as const,
      retailPriceMinor: null,
    };
    expect(assessRequestEligibility(ready, request, false)).toBe("not-found");
    expect(assessRequestEligibility(ready, request, true)).toBeNull();
  });
});

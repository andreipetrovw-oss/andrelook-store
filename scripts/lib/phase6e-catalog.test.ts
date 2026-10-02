import { describe, expect, it } from "vitest";

import type { Phase5Product } from "./phase5-catalog";
import {
  prepareProductIdentity,
  storefrontSlug,
  taxonomyNames,
} from "./phase6e-catalog";

describe("Phase 6E catalog preparation", () => {
  it("builds stable evidence-based storefront identities", () => {
    const product = {
      identity: { normalized_internal_name: "Classical Wool Cardigan" },
      internal_id: "AL-SRC-KINGCN-209196603",
    } as Phase5Product;

    expect(prepareProductIdentity(product)).toEqual({
      internalCode: "AL-SRC-KINGCN-209196603",
      name: "Classical Wool Cardigan",
      slug: "classical-wool-cardigan",
      translations: [
        { locale: "RU", name: "Classical Wool Cardigan" },
        { locale: "ET", name: "Classical Wool Cardigan" },
        { locale: "EN", name: "Classical Wool Cardigan" },
      ],
    });
  });

  it("normalizes punctuation without adding product claims", () => {
    expect(storefrontSlug("GRS Full-Zip Sweater")).toBe("grs-full-zip-sweater");
    expect(storefrontSlug("Hoodies & Sweatshirts")).toBe(
      "hoodies-and-sweatshirts",
    );
  });

  it("has localized names for every Phase 5C1 taxonomy slug", () => {
    for (const slug of [
      "accessories",
      "bottoms",
      "cardigans",
      "down-jackets",
      "headwear",
      "hoodies-and-sweatshirts",
      "jackets",
      "knitwear",
      "outerwear",
      "overshirts",
      "pants",
      "polos",
      "shell-and-rain-jackets",
      "shorts",
      "sweaters",
      "t-shirts",
      "tops",
      "vests",
    ]) {
      expect(Object.keys(taxonomyNames(slug))).toEqual(["EN", "ET", "RU"]);
    }
  });
});

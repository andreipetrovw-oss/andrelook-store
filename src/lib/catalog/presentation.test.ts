import { describe, expect, it } from "vitest";

import { getCustomerCategoryName, getProductDisplayName } from "./presentation";

describe("customer catalog presentation", () => {
  it("uses the final customer taxonomy without changing route slugs", () => {
    expect(getCustomerCategoryName("en", "warm-jackets", "Fallback")).toBe(
      "Outerwear",
    );
    expect(getCustomerCategoryName("et", "light-jackets", "Fallback")).toBe(
      "Jakid ja kudumid",
    );
    expect(getCustomerCategoryName("ru", "bottoms", "Fallback")).toBe(
      "Пляжная одежда",
    );
    expect(getCustomerCategoryName("en", "unknown", "Fallback")).toBe(
      "Fallback",
    );
  });

  it("removes only an exact repeated brand prefix from display names", () => {
    expect(getProductDisplayName("Moncler Maya Down Jacket", "Moncler")).toBe(
      "Maya Down Jacket",
    );
    expect(getProductDisplayName("Moncler-inspired Coat", "Moncler")).toBe(
      "Moncler-inspired Coat",
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  formatProductCount,
  getCustomerCategoryName,
  getProductDisplayName,
} from "./presentation";

describe("customer catalog presentation", () => {
  it("uses the final customer taxonomy without changing route slugs", () => {
    expect(getCustomerCategoryName("en", "warm-jackets", "Fallback")).toBe(
      "Puffer jackets",
    );
    expect(getCustomerCategoryName("et", "light-jackets", "Fallback")).toBe(
      "Joped ja kardiganid",
    );
    expect(getCustomerCategoryName("ru", "bottoms", "Fallback")).toBe(
      "Плавательные шорты",
    );
    expect(getCustomerCategoryName("en", "unknown", "Fallback")).toBe(
      "Fallback",
    );
  });

  it("uses correct Estonian singular and plural product counts", () => {
    expect(formatProductCount("et", 1)).toBe("1 toode");
    expect(formatProductCount("et", 2)).toBe("2 toodet");
  });

  it("keeps equivalent hoodie taxonomy in all locales", () => {
    expect(getCustomerCategoryName("ru", "hoodies", "Fallback")).toBe(
      "Свитшоты и худи",
    );
    expect(getCustomerCategoryName("et", "hoodies", "Fallback")).toBe(
      "Dressipluusid ja pusad",
    );
    expect(getCustomerCategoryName("en", "hoodies", "Fallback")).toBe(
      "Sweatshirts & hoodies",
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

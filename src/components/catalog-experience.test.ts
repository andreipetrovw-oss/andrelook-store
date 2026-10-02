import { describe, expect, it } from "vitest";

import type { PublicProductDto } from "@/lib/catalog/public-dto";

import { filterAndSortProducts } from "./catalog-experience";

function product(
  id: string,
  name: string,
  availability: PublicProductDto["availability"],
  price: number | null,
): PublicProductDto {
  return {
    availability,
    brand: { name: "Test Brand", slug: "test-brand" },
    category: { name: "Outerwear", slug: "outerwear" },
    colors: [],
    currency: price === null ? null : "EUR",
    description: null,
    id,
    images: [],
    name,
    preorderEstimate: null,
    retailPriceMinor: price,
    shortDescription: null,
    sizeChart: null,
    slug: id,
    version: "2026-01-01T00:00:00.000Z",
  };
}

const products = [
  product("b", "Boreal Coat", "PRE_ORDER", null),
  product("a", "Alpine Jacket", "IN_STOCK", 20_000),
  product("c", "City Parka", "IN_STOCK", 15_000),
];

describe("catalog browsing state", () => {
  it("searches only public DTO text and combines availability", () => {
    expect(
      filterAndSortProducts(products, { availability: "IN_STOCK", q: "coat" }),
    ).toEqual([]);
    expect(filterAndSortProducts(products, { q: "test brand" })).toHaveLength(
      3,
    );
  });

  it("sorts known prices while keeping pending prices intentional", () => {
    expect(
      filterAndSortProducts(products, { sort: "price-asc" }).map(
        (item) => item.id,
      ),
    ).toEqual(["c", "a", "b"]);
  });
});

import { describe, expect, it } from "vitest";

import { toPublicProductDto, type PublicProductRecord } from "./public-dto";

const record: PublicProductRecord & Record<string, unknown> = {
  availabilityType: "PRE_ORDER",
  brand: { displayName: "Approved Brand", slug: "approved-brand" },
  category: {
    slug: "outerwear",
    translations: [{ locale: "EN", name: "Outerwear" }],
  },
  colors: [
    {
      code: "black",
      swatchHex: "#000000",
      translations: [{ locale: "EN", name: "Black" }],
    },
  ],
  currency: "EUR",
  customer: { email: "private@example.com" },
  id: "product_1",
  images: [
    {
      height: 1500,
      role: "PRIMARY",
      sortOrder: 0,
      translations: [{ altText: "Approved product", locale: "EN" }],
      url: "https://assets.example.com/approved.jpg",
      width: 1200,
    },
  ],
  internalNotes: "never public",
  landedCostMinor: 10000,
  margin: 15000,
  preorderEstimateText: null,
  privateData: {
    supplierName: "Private Supplier",
    supplierUrl: "https://supplier.invalid/private",
  },
  retailPriceMinor: 25000,
  sizeChart: null,
  slug: "approved-product",
  sourceImages: [{ sourceUrl: "https://supplier.invalid/image.jpg" }],
  studioCandidates: [
    {
      privateBlobUrl: "https://private.blob.invalid/golden-master.png",
      referencePack: { sourceUrl: "https://supplier.invalid/private-source" },
    },
  ],
  supplierCostMinor: 9000,
  translations: [
    {
      description: "Approved description",
      locale: "EN",
      name: "Approved product",
      shortDescription: null,
    },
  ],
  updatedAt: new Date("2026-09-26T12:00:00.000Z"),
};

describe("public product serialization", () => {
  it("constructs a deliberately limited customer DTO", () => {
    const dto = toPublicProductDto(record, "en");
    expect(dto).not.toBeNull();
    expect(dto?.name).toBe("Approved product");
    expect(dto?.retailPriceMinor).toBe(25000);
    expect(dto?.version).toBe("2026-09-26T12:00:00.000Z");
  });

  it("cannot serialize private catalog or customer information", () => {
    const serialized = JSON.stringify(toPublicProductDto(record, "en"));
    for (const forbidden of [
      "supplier",
      "supplierUrl",
      "supplierCostMinor",
      "landedCostMinor",
      "margin",
      "internalNotes",
      "sourceImages",
      "studioCandidates",
      "private.blob.invalid",
      "customer",
      "private@example.com",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("rejects a record that is not publication-complete", () => {
    expect(
      toPublicProductDto({ ...record, retailPriceMinor: null }, "en"),
    ).toBeNull();
    expect(toPublicProductDto({ ...record, slug: null }, "en")).toBeNull();
  });

  it("allows explicit owner-review serialization without inventing commercial fields", () => {
    const dto = toPublicProductDto(
      {
        ...record,
        availabilityType: null,
        currency: null,
        retailPriceMinor: null,
      },
      "en",
      true,
    );
    expect(dto).toMatchObject({
      availability: null,
      currency: null,
      retailPriceMinor: null,
    });
  });
});

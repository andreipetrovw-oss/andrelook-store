import { describe, expect, it } from "vitest";
import {
  productReviewSchema,
  publicReviewDTO,
  reviewProductName,
} from "./model";

describe("customer-safe review product names", () => {
  it("uses the existing published storefront translation in each language", () => {
    const product = {
      publicationStatus: "PUBLISHED",
      translations: [
        { locale: "ET", name: "Avalik mudel" },
        { locale: "RU", name: "Публичная модель" },
        { locale: "EN", name: "Public model" },
      ],
    };
    for (const t of product.translations)
      expect(reviewProductName("AL-SRC-PRIVATE-123", t.locale, product)).toBe(
        t.name,
      );
  });
  it("preserves a safe historical purchased name without exposing private draft translations", () => {
    expect(
      reviewProductName("Purchased jacket", "en", {
        publicationStatus: "DRAFT",
        translations: [{ locale: "EN", name: "Private research title" }],
      }),
    ).toBe("Purchased jacket");
  });
  it.each([
    ["et", "Ostetud toode"],
    ["ru", "Приобретённый товар"],
    ["en", "Purchased item"],
  ])(
    "uses a human fallback in %s when a draft item has only an internal code",
    (locale, expected) =>
      expect(
        reviewProductName("AL-SRC-PRIVATE-123", locale, {
          publicationStatus: "DRAFT",
          translations: [],
        }),
      ).toBe(expected),
  );
  it("redacts internal names at the public DTO boundary while preserving association", () => {
    const dto = publicReviewDTO({
      publicId: "public-review",
      rating: 4,
      publicText: "Helpful service and delivery.",
      displayName: "Anonymous customer",
      locale: "EN",
      submittedAt: new Date(),
      productNameSnapshot: "AL-SRC-PRIVATE-123",
      productId: "same-product-id",
      kind: "PRODUCT",
    });
    expect(dto.productName).toBe("Purchased item");
    expect(dto.productId).toBe("same-product-id");
    expect(JSON.stringify([dto, productReviewSchema([dto])])).not.toContain(
      "AL-SRC",
    );
    expect(productReviewSchema([dto]).aggregateRating?.reviewCount).toBe(1);
  });
});

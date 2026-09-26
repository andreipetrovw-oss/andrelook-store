import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  commercialFind: vi.fn(),
  commercialUpdate: vi.fn(),
  requireActiveAdmin: vi.fn(),
  reviewUpsert: vi.fn(),
  transaction: vi.fn(),
  translationFind: vi.fn(),
  translationUpsert: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({ del: vi.fn(), put: vi.fn() }));
vi.mock("sharp", () => ({ default: vi.fn() }));
vi.mock("@/lib/admin/identity", () => ({
  requireActiveAdmin: mocks.requireActiveAdmin,
}));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ $transaction: mocks.transaction }),
}));

import {
  updateCommercialFields,
  updateLocalizedContent,
} from "./owner-control";

function transactionClient() {
  return {
    product: {
      findUniqueOrThrow: mocks.commercialFind,
      update: mocks.commercialUpdate,
    },
    productReview: { upsert: mocks.reviewUpsert },
    productReviewEvent: { create: mocks.auditCreate },
    productTranslation: {
      findMany: mocks.translationFind,
      upsert: mocks.translationUpsert,
    },
  };
}

describe("owner catalog controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveAdmin.mockResolvedValue({ id: "admin_1" });
    mocks.transaction.mockImplementation(async (callback) =>
      callback(transactionClient()),
    );
    mocks.commercialFind.mockResolvedValue({
      availabilityType: null,
      currency: null,
      preorderEstimateText: null,
      retailPriceMinor: null,
    });
    mocks.commercialUpdate.mockResolvedValue({
      availabilityType: "PRE_ORDER",
      currency: "EUR",
      preorderEstimateText: "Owner-approved estimate",
      retailPriceMinor: 25000,
    });
    mocks.translationFind.mockResolvedValue([]);
  });

  it("rejects a commercial mutation before any database write when owner authorization fails", async () => {
    mocks.requireActiveAdmin.mockRejectedValueOnce(new Error("forbidden"));
    await expect(
      updateCommercialFields({
        availabilityType: "PRE_ORDER",
        currency: "EUR",
        preorderEstimateText: "Owner-approved estimate",
        productId: "product_1",
        retailPrice: "250",
      }),
    ).rejects.toThrow("forbidden");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("records owner commercial values, resets approval, and writes an audit event", async () => {
    await updateCommercialFields({
      availabilityType: "PRE_ORDER",
      currency: "eur",
      preorderEstimateText: "Owner-approved estimate",
      productId: "product_1",
      retailPrice: "250",
    });
    expect(mocks.commercialUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currency: "EUR",
          retailPriceMinor: 25000,
        }),
      }),
    );
    expect(mocks.reviewUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          commercialDecision: "NEEDS_REVISION",
          ownerPublicationApproved: false,
        }),
      }),
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "COMMERCIAL_FIELDS_UPDATED",
          changedByAdminId: "admin_1",
        }),
      }),
    );
  });

  it("writes all three localized descriptions and keeps them pending owner re-approval", async () => {
    await updateLocalizedContent({
      descriptionEN: "English source-supported copy",
      descriptionET: "Eestikeelne allikapõhine tekst",
      descriptionRU: "Русский текст на основе источника",
      nameEN: "English name",
      nameET: "Eesti nimi",
      nameRU: "Русское название",
      productId: "product_1",
    });
    expect(mocks.translationUpsert).toHaveBeenCalledTimes(3);
    expect(mocks.reviewUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          contentDecision: "NEEDS_REVISION",
          ownerPublicationApproved: false,
        }),
      }),
    );
  });
});

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
  studioFind: vi.fn(),
  studioUpdate: vi.fn(),
}));

vi.mock("@/lib/admin/identity", () => ({
  requireActiveAdmin: mocks.requireActiveAdmin,
}));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ $transaction: mocks.transaction }),
}));

import {
  updateCommercialFields,
  updateLocalizedContent,
  updateStudioCandidateReview,
} from "./owner-control";
import { studioFidelityCheckIds } from "@/lib/studio/fidelity";

function transactionClient() {
  return {
    product: {
      findUniqueOrThrow: mocks.commercialFind,
      update: mocks.commercialUpdate,
    },
    productReview: { upsert: mocks.reviewUpsert },
    productReviewEvent: { create: mocks.auditCreate },
    studioCandidate: {
      findFirstOrThrow: mocks.studioFind,
      update: mocks.studioUpdate,
    },
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
    mocks.studioFind.mockResolvedValue({
      id: "candidate_1",
      role: "PRIMARY",
      status: "NEEDS_REVIEW",
      version: 1,
    });
    mocks.studioUpdate.mockResolvedValue({
      id: "candidate_1",
      role: "PRIMARY",
      status: "OWNER_APPROVED",
      version: 1,
    });
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

  it("blocks candidate approval until every fidelity item is checked", async () => {
    await expect(
      updateStudioCandidateReview({
        candidateId: "candidate_1",
        checks: studioFidelityCheckIds.slice(0, -1),
        decision: "OWNER_APPROVED",
        productId: "product_1",
      }),
    ).rejects.toThrow("чек-лист");
    expect(mocks.requireActiveAdmin).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("records explicit owner approval without creating a public image", async () => {
    await updateStudioCandidateReview({
      candidateId: "candidate_1",
      checks: studioFidelityCheckIds,
      decision: "OWNER_APPROVED",
      productId: "product_1",
    });
    expect(mocks.studioUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "OWNER_APPROVED" }),
      }),
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "STUDIO_CANDIDATE_REVIEWED" }),
      }),
    );
    expect(transactionClient()).not.toHaveProperty("productImage");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  studioFindUnique: vi.fn(),
  requireOwner: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    product: { findUnique: mocks.findUnique },
    studioCandidate: { findUnique: mocks.studioFindUnique },
  }),
}));

import {
  getPrivateCatalogProduct,
  getPrivateStudioCandidate,
} from "./private-query";

describe("private catalog product query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ email: "owner@example.com" });
    mocks.findUnique.mockResolvedValue(null);
  });

  it("keeps supplier URLs out of the owner page result", async () => {
    await getPrivateCatalogProduct("product_1");

    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          privateData: {
            select: {
              sourceReviewStatus: true,
              supplierName: true,
              supplierProductCode: true,
            },
          },
        }),
      }),
    );
  });

  it("authorizes candidate lookups and selects only proxy metadata", async () => {
    mocks.studioFindUnique.mockResolvedValue(null);
    await getPrivateStudioCandidate("candidate_1");
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.studioFindUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        privateBlobUrl: true,
        productId: true,
        status: true,
      },
      where: { id: "candidate_1" },
    });
  });
});

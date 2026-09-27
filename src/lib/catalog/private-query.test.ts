import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  requireOwner: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ product: { findUnique: mocks.findUnique } }),
}));

import { getPrivateCatalogProduct } from "./private-query";

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
});

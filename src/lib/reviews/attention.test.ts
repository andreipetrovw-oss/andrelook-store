import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ owner: vi.fn(), findMany: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.owner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ customerReview: { findMany: mocks.findMany } }),
}));
import { getReviewAttention } from "./attention";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.owner.mockResolvedValue({ email: "owner" });
});
describe("private review attention", () => {
  it("counts only eligible submitted non-revoked reviews, with no writes", async () => {
    const order = {
      id: "o",
      displayNumber: "AL-REAL",
      status: "DELIVERED",
      customer: { name: "Henri" },
    };
    mocks.findMany.mockResolvedValue([
      { id: "r", invitation: { order } },
      {
        id: "test",
        invitation: { order: { ...order, customer: { name: "TEST UAT" } } },
      },
    ]);
    expect(await getReviewAttention()).toEqual([{ id: "r", orderId: "o" }]);
    expect(mocks.findMany.mock.calls[0]![0].where).toEqual({
      status: "SUBMITTED",
      invitation: { revokedAt: null },
    });
    // PUBLISH/REJECT change status through existing moderation, clearing this query.
    mocks.findMany.mockResolvedValue([]);
    expect(await getReviewAttention()).toEqual([]);
  });
  it("rejects non-owner before querying private data", async () => {
    mocks.owner.mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(getReviewAttention()).rejects.toThrow("Unauthorized");
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

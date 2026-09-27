import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  groupBy: vi.fn(),
  productCount: vi.fn(),
  requireOwner: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: {
      count: mocks.count,
      findMany: mocks.findMany,
      groupBy: mocks.groupBy,
    },
    product: { count: mocks.productCount, findMany: mocks.findMany },
  }),
}));

import { getAdminCatalog, getAdminOrders, getAdminOverview } from "./query";

describe("owner CRM data boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ email: "owner@example.com" });
  });

  it("authorizes before dashboard reads", async () => {
    mocks.groupBy.mockResolvedValue([{ _count: { _all: 2 }, status: "NEW" }]);
    mocks.count.mockResolvedValue(1);
    mocks.productCount.mockResolvedValue(4);
    await expect(getAdminOverview()).resolves.toEqual({
      counts: { NEW: 2 },
      overdue: 1,
      productsForReview: 4,
    });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
  });

  it("applies search/status filters and calculates order balances", async () => {
    mocks.findMany.mockResolvedValue([
      {
        confirmedTotalMinor: 20_000,
        currency: "EUR",
        payments: [{ amountMinor: 5_000, kind: "DEPOSIT" }],
      },
    ]);
    const orders = await getAdminOrders({ query: "Alice", status: "NEW" });
    expect(orders[0]!).toMatchObject({
      balanceMinor: 15_000,
      paidMinor: 5_000,
    });
    expect(mocks.findMany.mock.calls[0]![0].where).toMatchObject({
      status: "NEW",
    });
  });

  it("fails before private catalog data is read when authorization fails", async () => {
    mocks.requireOwner.mockRejectedValueOnce(new Error("forbidden"));
    await expect(getAdminCatalog()).rejects.toThrow("forbidden");
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  groupBy: vi.fn(),
  requireOwner: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: {
      count: mocks.count,
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      groupBy: mocks.groupBy,
    },
    product: { findMany: mocks.findMany },
  }),
}));

import {
  getAdminCatalog,
  getAdminOrder,
  getAdminOrders,
  getAdminOverview,
} from "./query";

describe("owner CRM data boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ email: "owner@example.com" });
  });

  it("authorizes before dashboard reads", async () => {
    mocks.groupBy.mockResolvedValue([{ _count: { _all: 2 }, status: "NEW" }]);
    mocks.count.mockResolvedValue(1);
    await expect(getAdminOverview()).resolves.toEqual({
      counts: { NEW: 2 },
      overdue: 1,
    });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          displayNumber: {
            notIn: [
              "AL-20261007-3C7477",
              "AL-20261011-302FDC",
              "AL-20261023-424699",
            ],
          },
        },
      }),
    );
    expect(mocks.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          displayNumber: {
            notIn: [
              "AL-20261007-3C7477",
              "AL-20261011-302FDC",
              "AL-20261023-424699",
            ],
          },
        }),
      }),
    );
  });

  it("applies search/status filters and calculates order balances", async () => {
    mocks.findMany.mockResolvedValue([
      {
        agreedTotalMinor: null,
        confirmedTotalMinor: 20_000,
        currency: "EUR",
        displayNumber: "AL-REAL-CUSTOMER",
        items: [
          {
            productNameSnapshot: "Product",
            quantity: 1,
            unitPriceMinor: 20_000,
          },
        ],
        paymentPreference: "FULL_ADVANCE",
        payments: [{ amountMinor: 5_000, kind: "DEPOSIT", status: "ACTIVE" }],
      },
    ]);
    const orders = await getAdminOrders({ query: "Alice", status: "NEW" });
    expect(orders[0]!).toMatchObject({
      balanceMinor: 15_000,
      isTest: false,
      paidMinor: 5_000,
    });
    expect(mocks.findMany.mock.calls[0]![0].where).toMatchObject({
      status: "NEW",
    });
  });

  it("keeps the acceptance order accessible and clearly classified", async () => {
    mocks.findUnique.mockResolvedValue({
      agreedTotalMinor: null,
      confirmedTotalMinor: 7_900,
      currency: "EUR",
      displayNumber: "AL-20261007-3C7477",
      items: [{ quantity: 1, unitPriceMinor: 7_900 }],
      paymentPreference: "FULL_ADVANCE",
      payments: [],
    });

    await expect(getAdminOrder("acceptance-order-id")).resolves.toMatchObject({
      displayNumber: "AL-20261007-3C7477",
      isTest: true,
    });
    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "acceptance-order-id" } }),
    );
  });

  it("keeps the Meta verification order accessible and clearly classified", async () => {
    mocks.findUnique.mockResolvedValue({
      agreedTotalMinor: null,
      confirmedTotalMinor: 25_900,
      currency: "EUR",
      displayNumber: "AL-20261011-302FDC",
      items: [{ quantity: 1, unitPriceMinor: 25_900 }],
      paymentPreference: "FULL_ADVANCE",
      payments: [],
    });

    await expect(getAdminOrder("meta-test-order-id")).resolves.toMatchObject({
      displayNumber: "AL-20261011-302FDC",
      isTest: true,
    });
  });

  it("fails before private catalog data is read when authorization fails", async () => {
    mocks.requireOwner.mockRejectedValueOnce(new Error("forbidden"));
    await expect(getAdminCatalog()).rejects.toThrow("forbidden");
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

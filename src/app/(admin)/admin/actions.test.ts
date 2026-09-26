import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUniqueOrThrow: vi.fn(),
  requireActiveAdmin: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/identity", () => ({
  requireActiveAdmin: mocks.requireActiveAdmin,
}));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    $transaction: mocks.transaction,
    payment: { create: vi.fn() },
  }),
}));

import { updateOrderStatus } from "./actions";

describe("owner CRM status mutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveAdmin.mockResolvedValue({ id: "admin_1" });
    mocks.findUniqueOrThrow.mockResolvedValue({ status: "NEW" });
    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        order: {
          findUniqueOrThrow: mocks.findUniqueOrThrow,
          update: mocks.update,
        },
      }),
    );
  });

  it("writes the status and its auditable history entry together", async () => {
    const form = new FormData();
    form.set("orderId", "order_1");
    form.set("status", "CONTACTED");
    form.set("note", "Replied in Telegram");
    await updateOrderStatus(form);
    expect(mocks.update).toHaveBeenCalledWith({
      data: {
        status: "CONTACTED",
        statusHistory: {
          create: {
            changedByAdminId: "admin_1",
            fromStatus: "NEW",
            note: "Replied in Telegram",
            toStatus: "CONTACTED",
          },
        },
      },
      where: { id: "order_1" },
    });
  });

  it("does not enter the transaction if authorization fails", async () => {
    mocks.requireActiveAdmin.mockRejectedValueOnce(new Error("forbidden"));
    const form = new FormData();
    form.set("orderId", "order_1");
    form.set("status", "CONTACTED");
    await expect(updateOrderStatus(form)).rejects.toThrow("forbidden");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
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

import { updateOrderOperations, updateOrderStatus } from "./actions";

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
        orderAuditEvent: { create: mocks.auditCreate },
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

  it("updates operational fields and records an immutable audit event", async () => {
    mocks.findUniqueOrThrow.mockResolvedValueOnce({
      cancelledReason: null,
      confirmedTotalMinor: null,
      currency: null,
      etaDate: null,
      etaText: null,
      internalNotes: null,
      nextActionAt: null,
      supplierOrderedAt: null,
      trackingReference: null,
    });
    const form = new FormData();
    form.set("orderId", "order_1");
    form.set("confirmedTotal", "200");
    form.set("currency", "eur");
    form.set("nextActionAt", "2026-09-28T10:30");
    form.set("supplierOrderedAt", "2026-09-27");
    form.set("etaDate", "2026-10-05");
    form.set("etaText", "Проверочный срок");
    form.set("trackingReference", "STAGING-TEST");
    form.set("internalNotes", "Изолированная тестовая запись");
    form.set("cancelledReason", "");

    await updateOrderOperations(form);

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          confirmedTotalMinor: 20_000,
          currency: "EUR",
          internalNotes: "Изолированная тестовая запись",
        }),
        where: { id: "order_1" },
      }),
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "OPERATIONAL_FIELDS_UPDATED",
        changedByAdminId: "admin_1",
        orderId: "order_1",
      }),
    });
  });
});

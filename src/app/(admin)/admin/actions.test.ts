import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  addPaymentRecord: vi.fn(),
  correctAgreedPrice: vi.fn(),
  createOwnerLogisticsEvidence: vi.fn(),
  requireOwner: vi.fn(),
  upsertAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ adminUser: { upsert: mocks.upsertAdmin } }),
}));
vi.mock("@/lib/orders/corrections", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/orders/corrections")>()),
  addPaymentRecord: mocks.addPaymentRecord,
  correctAgreedPrice: mocks.correctAgreedPrice,
  correctOrderDetails: vi.fn(),
  correctOrderItem: vi.fn(),
  editPaymentRecord: vi.fn(),
  voidPaymentRecord: vi.fn(),
}));
vi.mock("@/lib/tracking/owner-evidence", () => ({
  createOwnerLogisticsEvidence: mocks.createOwnerLogisticsEvidence,
  reviseOwnerLogisticsEvidence: vi.fn(),
  voidOwnerLogisticsEvidence: vi.fn(),
}));

import {
  addShipmentLogisticsEvidence,
  saveFinancialCorrection,
  updateAgreedPrice,
} from "./actions";
import { FinancialCorrectionError } from "@/lib/orders/corrections";

describe("owner-only order correction actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed before a correction when owner authorization is denied", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("forbidden"));
    const form = new FormData();
    form.set("agreedPrice", "240.00");
    form.set("orderId", "order-1");

    await expect(updateAgreedPrice(form)).rejects.toThrow("forbidden");
    expect(mocks.upsertAdmin).not.toHaveBeenCalled();
    expect(mocks.correctAgreedPrice).not.toHaveBeenCalled();
  });

  it("fails closed before owner logistics evidence can be created", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("forbidden"));
    const form = new FormData();
    form.set("customerVisible", "true");
    form.set("eventTimestamp", "2026-10-15T15:03");
    form.set("eventType", "EUROPE_PROCESSING_AWAITING_CUSTOMS");
    form.set("evidenceNote", "Owner-verified upstream evidence.");
    form.set("internalLocation", "");
    form.set("internalReference", "");
    form.set("shipmentId", "shipment-pilot");
    form.set("sourceLabel", "Private owner source");
    form.set("sourceTimeZone", "Asia/Shanghai");
    form.set("sourceType", "OWNER_VERIFIED_LOGISTICS");
    form.set("verificationStatus", "VERIFIED");

    await expect(addShipmentLogisticsEvidence(form)).rejects.toThrow(
      "forbidden",
    );
    expect(mocks.upsertAdmin).not.toHaveBeenCalled();
    expect(mocks.createOwnerLogisticsEvidence).not.toHaveBeenCalled();
  });

  it("does not catch or weaken failed owner authorization in the payment form", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("forbidden"));
    await expect(
      saveFinancialCorrection({ error: null }, new FormData()),
    ).rejects.toThrow("forbidden");
    expect(mocks.addPaymentRecord).not.toHaveBeenCalled();
  });

  it("renders safe localized payment feedback instead of crashing the page", async () => {
    mocks.requireOwner.mockResolvedValue({
      email: "owner@example.invalid",
      subject: "owner",
    });
    mocks.upsertAdmin.mockResolvedValue({ id: "owner" });
    mocks.addPaymentRecord.mockRejectedValue(
      new FinancialCorrectionError("Payment exceeds the available balance."),
    );
    const form = new FormData();
    for (const [key, value] of Object.entries({
      operation: "ADD",
      orderId: "order",
      amount: "149",
      currency: "EUR",
      kind: "BALANCE",
      requestKey: "d7d589ce-374d-4bed-a698-0b31b2b2bf6b",
    }))
      form.set(key, value);
    await expect(
      saveFinancialCorrection({ error: null }, form),
    ).resolves.toEqual({
      error: "Сумма превышает остаток к оплате или доступную сумму возврата.",
    });
    mocks.addPaymentRecord.mockRejectedValue(
      new Error("PRIVATE_DATABASE_CONNECTION_SECRET"),
    );
    const result = await saveFinancialCorrection({ error: null }, form);
    expect(result.error).not.toContain("PRIVATE");
    expect(result.error).not.toBeNull();
  });

  it("handles malformed payment input without calling the ledger", async () => {
    mocks.requireOwner.mockResolvedValue({ email: "owner@example.invalid" });
    const form = new FormData();
    form.set("operation", "ADD");
    expect(
      (await saveFinancialCorrection({ error: null }, form)).error,
    ).not.toBeNull();
    expect(mocks.addPaymentRecord).not.toHaveBeenCalled();
  });
});

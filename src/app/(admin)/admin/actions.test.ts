import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
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
vi.mock("@/lib/orders/corrections", () => ({
  addPaymentRecord: vi.fn(),
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

import { addShipmentLogisticsEvidence, updateAgreedPrice } from "./actions";

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
});

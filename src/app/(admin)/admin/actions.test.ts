import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  correctAgreedPrice: vi.fn(),
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

import { updateAgreedPrice } from "./actions";

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
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  evidenceFindMany: vi.fn(),
  importEvidence: vi.fn(),
  requireOwner: vi.fn(),
  shipmentFind: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    adminUser: { upsert: vi.fn() },
    shipment: { findUniqueOrThrow: mocks.shipmentFind },
    shipmentLogisticsEvidence: { findMany: mocks.evidenceFindMany },
  }),
}));
vi.mock("@/lib/tracking/notifications", () => ({
  notifyLinkedOrders: vi.fn(),
}));
vi.mock("@/lib/tracking/owner-evidence", async (loadOriginal) => {
  const original =
    await loadOriginal<typeof import("@/lib/tracking/owner-evidence")>();
  return {
    ...original,
    importOwnerLogisticsEvidence: mocks.importEvidence,
  };
});
vi.mock("@/lib/tracking/service", () => ({
  reconcileShipment: vi.fn(),
}));

import { previewSuperbuyUpdate } from "./actions";

const initial = {
  error: null,
  eta: null,
  etaProposed: false,
  events: [],
  rawText: "",
  unrecognized: [],
};

describe("simplified logistics actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ email: "owner@example.com" });
    mocks.evidenceFindMany.mockResolvedValue([]);
    mocks.shipmentFind.mockResolvedValue({ etaFrom: null, etaTo: null });
  });

  it("fails closed before preview data can be read", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("forbidden"));
    const form = new FormData();
    form.set("shipmentId", "shipment-1");
    form.set(
      "rawText",
      "2026-10-13 09:19 Flight landed in Europe / unloading in progress.",
    );

    await expect(previewSuperbuyUpdate(initial, form)).rejects.toThrow(
      "forbidden",
    );
    expect(mocks.evidenceFindMany).not.toHaveBeenCalled();
    expect(mocks.importEvidence).not.toHaveBeenCalled();
  });

  it("previews recognized evidence without writing anything", async () => {
    const form = new FormData();
    form.set("shipmentId", "shipment-1");
    form.set(
      "rawText",
      "2026-10-13 09:19 Flight landed in Europe / unloading in progress.",
    );

    const result = await previewSuperbuyUpdate(initial, form);

    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.label).toBe("Прибыло в Европу");
    expect(mocks.importEvidence).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findShipment = vi.fn();
const createEvent = vi.fn();
const createOverride = vi.fn();
const updateShipment = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
  callback({
    shipment: { findUniqueOrThrow: findShipment, update: updateShipment },
    shipmentStatusOverride: { create: createOverride },
    trackingEvent: { create: createEvent },
  }),
);

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ $transaction: transaction }),
}));

vi.mock("./providers", () => ({
  getTrackingAdapter: vi.fn(() => null),
}));

import { recordOperationalMilestone } from "./service";

describe("operational tracking evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findShipment.mockResolvedValue({
      lastConfirmedEventAt: new Date("2026-10-10T10:00:00Z"),
      normalizedStatus: "ARRIVED_AT_ANDRELOOK",
    });
    createEvent.mockResolvedValue({});
    createOverride.mockResolvedValue({});
    updateShipment.mockResolvedValue({});
  });

  it("rejects an ordinary operational update that would move backwards", async () => {
    await expect(
      recordOperationalMilestone({
        adminId: "owner",
        evidenceSource: "OWNER_CONFIRMED",
        occurredAt: new Date("2026-10-11T10:00:00Z"),
        reason: "Owner evidence",
        shipmentId: "shipment",
        status: "PREPARING_ORDER",
      }),
    ).rejects.toThrow("backwards");
    expect(createEvent).not.toHaveBeenCalled();
    expect(updateShipment).not.toHaveBeenCalled();
  });

  it("records an explicit manual override in a separate audit row", async () => {
    await recordOperationalMilestone({
      adminId: "owner",
      evidenceSource: "MANUAL_OVERRIDE",
      occurredAt: null,
      reason: "Verified correction",
      shipmentId: "shipment",
      status: "PREPARING_ORDER",
    });

    expect(createEvent).toHaveBeenCalledWith({
      data: expect.objectContaining({
        createdByAdminId: "owner",
        evidenceSource: "MANUAL_OVERRIDE",
        publicTimestamp: null,
        shipmentId: "shipment",
      }),
    });
    expect(createOverride).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changedByAdminId: "owner",
        fromStatus: "ARRIVED_AT_ANDRELOOK",
        reason: "Verified correction",
        toStatus: "PREPARING_ORDER",
      }),
    });
    expect(updateShipment).toHaveBeenCalledWith({
      data: expect.objectContaining({
        lastConfirmedEventAt: new Date("2026-10-10T10:00:00Z"),
        normalizedStatus: "PREPARING_ORDER",
      }),
      where: { id: "shipment" },
    });
  });
});

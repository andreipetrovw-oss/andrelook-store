import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findShipment = vi.fn();
const createEvent = vi.fn();
const upsertEvent = vi.fn();
const upsertProviderRecord = vi.fn();
const createOverride = vi.fn();
const updateShipment = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
  callback({
    shipment: { findUniqueOrThrow: findShipment, update: updateShipment },
    shipmentStatusOverride: { create: createOverride },
    trackingEvent: { create: createEvent, upsert: upsertEvent },
    trackingProviderRecord: { upsert: upsertProviderRecord },
  }),
);

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ $transaction: transaction }),
}));

vi.mock("./providers", () => ({
  getTrackingAdapter: vi.fn(() => null),
}));

import { ingestProviderSnapshot, recordOperationalMilestone } from "./service";

describe("operational tracking evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findShipment.mockResolvedValue({
      lastConfirmedEventAt: new Date("2026-10-10T10:00:00Z"),
      normalizedStatus: "ARRIVED_AT_ANDRELOOK",
      provider: "SEVENTEEN_TRACK",
      requiresOwnerReview: false,
    });
    createEvent.mockResolvedValue({});
    createOverride.mockResolvedValue({});
    updateShipment.mockResolvedValue({});
    upsertEvent.mockResolvedValue({});
    upsertProviderRecord.mockResolvedValue({});
  });

  it("records InfoReceived as an informational public event without inventing movement", async () => {
    findShipment.mockResolvedValue({
      kind: "INTERNATIONAL_INBOUND",
      lastConfirmedEventAt: null,
      normalizedStatus: "ORDER_CONFIRMED",
      provider: "SEVENTEEN_TRACK",
      requiresOwnerReview: false,
    });
    const result = await ingestProviderSnapshot("shipment", {
      carrierCode: "7041",
      carrierName: "DHL Paket",
      estimatedDeliveryAt: null,
      estimatedDeliveryFrom: null,
      estimatedDeliveryTo: null,
      events: [
        {
          description: "Electronic shipment data received",
          id: "event-info",
          location: null,
          occurredAt: new Date("2026-10-04T09:00:00Z"),
          stage: "InfoReceived",
          status: "InfoReceived",
        },
      ],
      provider: "SEVENTEEN_TRACK",
      providerTrackingId: null,
      raw: { private: true },
      rawStatus: "InfoReceived",
      syncStatus: "SUCCESS",
    });
    expect(upsertEvent).toHaveBeenCalledWith({
      create: expect.objectContaining({
        customerVisible: true,
        normalizedStatus: "ORDER_CONFIRMED",
        publicTimestamp: new Date("2026-10-04T09:00:00Z"),
      }),
      update: {},
      where: expect.any(Object),
    });
    expect(result.status).toBe("ORDER_CONFIRMED");
    expect(result.newlyVisible).toEqual([]);
  });

  it("uses the same provider-event identity when an InfoReceived webhook is retried", async () => {
    findShipment.mockResolvedValue({
      kind: "INTERNATIONAL_INBOUND",
      lastConfirmedEventAt: null,
      normalizedStatus: "ORDER_CONFIRMED",
      provider: "SEVENTEEN_TRACK",
      requiresOwnerReview: false,
    });
    const snapshot = {
      carrierCode: "7041",
      carrierName: "DHL Paket",
      estimatedDeliveryAt: null,
      estimatedDeliveryFrom: null,
      estimatedDeliveryTo: null,
      events: [
        {
          description: "Electronic shipment data received",
          id: "event-info",
          location: null,
          occurredAt: new Date("2026-10-04T09:00:00Z"),
          stage: "InfoReceived",
          status: "InfoReceived",
        },
      ],
      provider: "SEVENTEEN_TRACK" as const,
      providerTrackingId: null,
      raw: { private: true },
      rawStatus: "InfoReceived",
      syncStatus: "SUCCESS" as const,
    };

    await ingestProviderSnapshot("shipment", snapshot);
    await ingestProviderSnapshot("shipment", snapshot);

    expect(upsertEvent).toHaveBeenCalledTimes(2);
    expect(upsertEvent.mock.calls[0]?.[0].where).toEqual(
      upsertEvent.mock.calls[1]?.[0].where,
    );
    expect(upsertEvent.mock.calls[0]?.[0].update).toEqual({});
  });

  it("persists a provider-supported ETA window without creating one otherwise", async () => {
    findShipment.mockResolvedValue({
      kind: "INTERNATIONAL_INBOUND",
      lastConfirmedEventAt: null,
      normalizedStatus: "ORDER_CONFIRMED",
      provider: "SEVENTEEN_TRACK",
      requiresOwnerReview: false,
    });
    await ingestProviderSnapshot("shipment", {
      carrierCode: "7041",
      carrierName: "DHL Paket",
      estimatedDeliveryAt: new Date("2026-10-21T00:00:00Z"),
      estimatedDeliveryFrom: new Date("2026-10-18T00:00:00Z"),
      estimatedDeliveryTo: new Date("2026-10-21T00:00:00Z"),
      events: [],
      provider: "SEVENTEEN_TRACK",
      providerTrackingId: null,
      raw: {},
      rawStatus: "InfoReceived",
      syncStatus: "SUCCESS",
    });
    expect(updateShipment).toHaveBeenCalledWith({
      data: expect.objectContaining({
        etaConfidence: "MEDIUM",
        etaFrom: new Date("2026-10-18T00:00:00Z"),
        etaWindowSource: "PROVIDER",
        etaTo: new Date("2026-10-21T00:00:00Z"),
      }),
      where: { id: "shipment" },
    });
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

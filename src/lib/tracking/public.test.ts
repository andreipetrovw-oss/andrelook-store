import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findUnique = vi.fn();
const findFirst = vi.fn();
const updateMany = vi.fn();
const upsertBucket = vi.fn();
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: { findFirst, findUnique, updateMany },
    trackingLookupBucket: { upsert: upsertBucket },
  }),
}));

import {
  authenticateTrackingLookup,
  consumeLookupAttempt,
  getPublicTrackingOrder,
  inferDeliveryMode,
  publicStatusLabel,
} from "./public";

function trackedOrder(overrides: Record<string, unknown> = {}) {
  return {
    city: "Tartu",
    countryCode: "EE",
    createdAt: new Date("2026-10-15T20:30:00Z"),
    deliveryMode: "ESTONIA_DELIVERY",
    displayNumber: "AL-CUSTOMER-C",
    fulfilmentMethod: "DELIVERY",
    items: [
      {
        colorSnapshot: "черный",
        productNameSnapshot: "Customer C item",
        product: {
          translations: [
            { locale: "ET", name: "Kliendi toode" },
            { locale: "EN", name: "Customer item" },
            { locale: "RU", name: "Товар клиента" },
          ],
        },
        quantity: 1,
        sizeSnapshot: "M",
      },
    ],
    requestedLocale: "ET",
    shipmentLinks: [],
    trackingMilestones: [],
    ...overrides,
  };
}

describe("public tracking presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertBucket.mockResolvedValue({ attempts: 1 });
  });

  it("rejects invalid public tokens without touching the database", async () => {
    await expect(getPublicTrackingOrder("guessable-token")).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("maps fulfilment facts and exact localized customer labels", () => {
    expect(
      inferDeliveryMode({
        countryCode: "EE",
        deliveryMode: null,
        fulfilmentMethod: "DELIVERY",
      }),
    ).toBe("ESTONIA_DELIVERY");
    expect(publicStatusLabel("ET", "LOGISTICS_REGISTERED")).toBe(
      "Logistikaandmed edastatud",
    );
    expect(publicStatusLabel("RU", "READY_FOR_HANDOVER")).not.toContain(
      "17TRACK",
    );
  });

  it("uses a neutral tracking-added event when confirmation evidence is unknown", async () => {
    findUnique.mockResolvedValue(trackedOrder());
    const result = await getPublicTrackingOrder("a".repeat(43));
    expect(result).toMatchObject({
      lastUpdatedAt: null,
      status: "TRACKING_ADDED",
      statusLabel: "Tellimus lisati Andrelooki jälgimissüsteemi",
    });
    expect(result?.timeline).toEqual([
      {
        label: "Tellimus lisati Andrelooki jälgimissüsteemi",
        occurredAt: "2026-10-15T20:30:00.000Z",
        status: "TRACKING_ADDED",
      },
    ]);
    expect(result?.items[0]?.colour).toBe("must");
    expect(result?.items[0]?.name).toBe("Kliendi toode");
  });

  it("uses only evidence-backed milestones for status and last update", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        trackingMilestones: [
          {
            kind: "ORDER_CONFIRMED",
            occurredAt: new Date("2026-10-01T09:00:00Z"),
          },
          {
            kind: "PREPARATION_STARTED",
            occurredAt: new Date("2026-10-02T10:00:00Z"),
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("b".repeat(43), "EN");
    expect(result?.status).toBe("PREPARING");
    expect(result?.lastUpdatedAt).toBe("2026-10-02T10:00:00.000Z");
    expect(result?.timeline.map((event) => event.status)).toEqual([
      "ORDER_CONFIRMED",
      "PREPARING",
    ]);
  });

  it("returns a safe DTO without master-shipment or provider secrets", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "HANDED_TO_LOGISTICS",
                  publicTimestamp: new Date("2026-10-02T10:00:00Z"),
                  rawStatus: "InTransit",
                },
              ],
              exposePublicTracking: false,
              internalTrackingNumber: "MUST-NEVER-LEAK",
              normalizedStatus: "HANDED_TO_LOGISTICS",
              providerPayload: "SUPERBUY-CHINA-MUST-NEVER-LEAK",
              publicCarrierName: null,
              publicTrackingNumber: null,
            },
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("c".repeat(43));
    expect(result?.status).toBe("IN_TRANSIT");
    expect(JSON.stringify(result)).not.toContain("MUST-NEVER-LEAK");
    expect(JSON.stringify(result)).not.toContain("SUPERBUY");
    const query = findUnique.mock.calls[0]?.[0];
    expect(JSON.stringify(query)).not.toContain("internalTrackingNumber");
    expect(JSON.stringify(query)).not.toContain("payload");
  });

  it("follows a customer's own local leg and exposes only owner-approved carrier data", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        requestedLocale: "EN",
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "ARRIVED_AT_ANDRELOOK",
                  publicTimestamp: new Date("2026-10-10T10:00:00Z"),
                  rawStatus: "Delivered",
                },
              ],
              exposePublicTracking: false,
              normalizedStatus: "ARRIVED_AT_ANDRELOOK",
              publicCarrierName: null,
              publicTrackingNumber: null,
            },
          },
          {
            sequence: 1,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "LOCAL_CARRIER",
                  publicTimestamp: new Date("2026-10-11T10:00:00Z"),
                  rawStatus: "PickedUp",
                },
              ],
              exposePublicTracking: true,
              normalizedStatus: "LOCAL_CARRIER",
              publicCarrierName: "Safe local carrier",
              publicTrackingNumber: "OWNER-APPROVED-LOCAL",
            },
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("d".repeat(43));
    expect(result).toMatchObject({
      carrierName: "Safe local carrier",
      deliveryMethod: "Delivery within Estonia",
      status: "LOCAL_DELIVERY",
      trackingNumber: "OWNER-APPROVED-LOCAL",
    });
  });

  it("requires the exact order and access-code pair without email", async () => {
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "order-c",
      publicTrackingToken: "e".repeat(43),
    });
    await expect(
      authenticateTrackingLookup({
        accessCode: "2345-6789",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBeNull();
    await expect(
      authenticateTrackingLookup({
        accessCode: "ABCD-EFGH",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBe("e".repeat(43));
    expect(findFirst.mock.calls[1]?.[0]).toMatchObject({
      where: {
        displayNumber: "AL-TARTU-C",
        trackingAccessCodeHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
    expect(JSON.stringify(findFirst.mock.calls)).not.toContain("@example.com");
  });

  it("rate-limits both address and address/order buckets", async () => {
    upsertBucket
      .mockResolvedValueOnce({ attempts: 15 })
      .mockResolvedValueOnce({ attempts: 5 })
      .mockResolvedValueOnce({ attempts: 16 })
      .mockResolvedValueOnce({ attempts: 6 });
    await expect(consumeLookupAttempt("198.51.100.1", "AL-ONE")).resolves.toBe(
      true,
    );
    await expect(consumeLookupAttempt("198.51.100.1", "AL-ONE")).resolves.toBe(
      false,
    );
    expect(upsertBucket).toHaveBeenCalledTimes(4);
  });
});

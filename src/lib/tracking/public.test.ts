import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findUnique = vi.fn();
const findFirst = vi.fn();
const updateMany = vi.fn();
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: { findFirst, findUnique, updateMany },
  }),
}));

import {
  getPublicTrackingOrder,
  authenticateTrackingLookup,
  inferDeliveryMode,
  publicStatusLabel,
} from "./public";

describe("public tracking presentation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid public tokens without touching the database", async () => {
    await expect(getPublicTrackingOrder("guessable-token")).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("maps existing fulfilment facts without inventing a route", () => {
    expect(
      inferDeliveryMode({
        countryCode: "EE",
        deliveryMode: null,
        fulfilmentMethod: "DELIVERY",
      }),
    ).toBe("ESTONIA_DELIVERY");
    expect(
      inferDeliveryMode({
        countryCode: "FI",
        deliveryMode: null,
        fulfilmentMethod: "DELIVERY",
      }),
    ).toBe("INTERNATIONAL_DELIVERY");
  });

  it("uses simple customer language without raw provider details", () => {
    expect(publicStatusLabel("EN", "HANDED_TO_LOGISTICS")).toBe(
      "Handed to logistics partner",
    );
    expect(publicStatusLabel("RU", "READY_FOR_HANDOVER")).not.toContain(
      "17TRACK",
    );
  });

  it("returns one customer's safe DTO without master-shipment secrets", async () => {
    findUnique.mockResolvedValue({
      city: "Tartu",
      countryCode: "EE",
      deliveryMode: "ESTONIA_DELIVERY",
      displayNumber: "AL-CUSTOMER-C",
      fulfilmentMethod: "DELIVERY",
      items: [
        {
          colorSnapshot: "Must",
          productNameSnapshot: "Customer C item",
          quantity: 1,
          sizeSnapshot: "M",
        },
      ],
      orderDate: new Date("2026-10-01T10:00:00Z"),
      requestedLocale: "ET",
      shipmentLinks: [
        {
          sequence: 0,
          shipment: {
            estimatedDeliveryAt: null,
            events: [
              {
                createdAt: new Date("2026-10-02T10:00:00Z"),
                normalizedStatus: "HANDED_TO_LOGISTICS",
                publicTimestamp: new Date("2026-10-02T10:00:00Z"),
              },
            ],
            exposePublicTracking: false,
            internalTrackingNumber: "MUST-NEVER-LEAK",
            lastConfirmedEventAt: new Date("2026-10-02T10:00:00Z"),
            normalizedStatus: "HANDED_TO_LOGISTICS",
            publicCarrierName: null,
            publicTrackingNumber: null,
            rawLocation: "MUST-NEVER-LEAK",
          },
        },
      ],
    });
    const result = await getPublicTrackingOrder("a".repeat(43));
    expect(result?.reference).toBe("AL-CUSTOMER-C");
    expect(JSON.stringify(result)).not.toContain("MUST-NEVER-LEAK");
    const query = findUnique.mock.calls[0]?.[0];
    expect(JSON.stringify(query)).not.toContain("internalTrackingNumber");
    expect(JSON.stringify(query)).not.toContain("rawLocation");
  });

  it("follows a customer's own later local leg without exposing the master leg", async () => {
    findUnique.mockResolvedValue({
      city: "Tartu",
      countryCode: "EE",
      deliveryMode: "ESTONIA_DELIVERY",
      displayNumber: "AL-TARTU-C",
      fulfilmentMethod: "DELIVERY",
      items: [
        {
          colorSnapshot: "Black",
          productNameSnapshot: "Customer C item",
          quantity: 1,
          sizeSnapshot: "M",
        },
      ],
      orderDate: new Date("2026-10-01T10:00:00Z"),
      requestedLocale: "EN",
      shipmentLinks: [
        {
          sequence: 0,
          shipment: {
            estimatedDeliveryAt: null,
            events: [
              {
                createdAt: new Date("2026-10-10T10:00:00Z"),
                normalizedStatus: "ARRIVED_AT_ANDRELOOK",
                publicTimestamp: new Date("2026-10-10T10:00:00Z"),
              },
            ],
            exposePublicTracking: false,
            lastConfirmedEventAt: new Date("2026-10-10T10:00:00Z"),
            normalizedStatus: "ARRIVED_AT_ANDRELOOK",
            publicCarrierName: null,
            publicTrackingNumber: null,
          },
        },
        {
          sequence: 1,
          shipment: {
            estimatedDeliveryAt: null,
            events: [
              {
                createdAt: new Date("2026-10-11T10:00:00Z"),
                normalizedStatus: "LOCAL_CARRIER",
                publicTimestamp: new Date("2026-10-11T10:00:00Z"),
              },
            ],
            exposePublicTracking: true,
            lastConfirmedEventAt: new Date("2026-10-11T10:00:00Z"),
            normalizedStatus: "LOCAL_CARRIER",
            publicCarrierName: "Safe local carrier",
            publicTrackingNumber: "OWNER-APPROVED-LOCAL",
          },
        },
      ],
    });

    const result = await getPublicTrackingOrder("b".repeat(43));
    expect(result).toMatchObject({
      carrierName: "Safe local carrier",
      deliveryMethod: "Local Estonia delivery",
      reference: "AL-TARTU-C",
      status: "LOCAL_CARRIER",
      trackingNumber: "OWNER-APPROVED-LOCAL",
    });
    expect(result?.timeline.map((event) => event.status)).toEqual([
      "ORDER_CONFIRMED",
      "ARRIVED_AT_ANDRELOOK",
      "LOCAL_CARRIER",
    ]);
  });

  it("requires the order and email pair for manual lookup", async () => {
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "order-c",
      publicTrackingToken: "c".repeat(43),
    });

    await expect(
      authenticateTrackingLookup({
        email: "wrong@example.com",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBeNull();
    await expect(
      authenticateTrackingLookup({
        email: "customer@example.com",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBe("c".repeat(43));
    expect(findFirst.mock.calls[1]?.[0]).toMatchObject({
      where: {
        displayNumber: "AL-TARTU-C",
      },
    });
  });
});

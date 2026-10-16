import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseShip24Webhook } from "./ship24";

describe("Ship24 parsing", () => {
  it("uses the physical milestone and provider ETA without inventing fields", () => {
    const result = parseShip24Webhook({
      trackings: [
        {
          events: [
            {
              eventId: "real-event-id",
              occurrenceDatetime: "2026-10-13T12:00:00Z",
              status: "Package moved",
              statusMilestone: "in_transit",
            },
          ],
          shipment: {
            delivery: { estimatedDeliveryDate: "2026-10-20" },
            recognizedCouriers: [
              { courierCode: "carrier", courierName: "Carrier" },
            ],
            statusMilestone: "in_transit",
          },
          tracker: {
            trackerId: "tracker-id",
            trackingNumber: "INTERNAL-NUMBER",
          },
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.snapshot).toMatchObject({
      carrierCode: "carrier",
      carrierName: "Carrier",
      estimatedDeliveryAt: new Date("2026-10-20"),
      estimatedDeliveryFrom: new Date("2026-10-20"),
      estimatedDeliveryTo: new Date("2026-10-20"),
      providerTrackingId: "tracker-id",
      rawStatus: "in_transit",
      syncStatus: "SUCCESS",
    });
    expect(result[0]?.snapshot.events[0]).toMatchObject({
      occurredAt: new Date("2026-10-13T12:00:00Z"),
      stage: "in_transit",
    });
  });
});

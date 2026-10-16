import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  parseSeventeenTrackSnapshot,
  parseSeventeenTrackWebhook,
} from "./seventeen-track";

describe("17TRACK v2.4 parsing", () => {
  it("keeps NotFound distinct from shipment failure", () => {
    const result = parseSeventeenTrackSnapshot({
      data: {
        accepted: [
          {
            carrier: 100001,
            track_info: {
              latest_event: null,
              latest_status: {
                status: "NotFound",
                sub_status: "NotFound_Other",
              },
            },
          },
        ],
      },
    });
    expect(result.syncStatus).toBe("NOT_FOUND");
    expect(result.events).toEqual([]);
    expect(result.carrierCode).toBe("100001");
  });

  it("maps a v2.4 rejected no-information response to NotFound", () => {
    const result = parseSeventeenTrackSnapshot({
      code: 0,
      data: {
        accepted: [],
        rejected: [
          {
            carrier: null,
            error: {
              code: -18019909,
              message: "No tracking information at this time.",
            },
            number: "PRIVATE-TRACKING-NUMBER",
          },
        ],
      },
    });

    expect(result.syncStatus).toBe("NOT_FOUND");
    expect(result.rawStatus).toBe(
      "-18019909: No tracking information at this time.",
    );
    expect(result.events).toEqual([]);
  });

  it("treats an already-registered response as idempotent pending work", () => {
    const result = parseSeventeenTrackSnapshot({
      code: 0,
      data: {
        accepted: [],
        rejected: [
          {
            error: {
              code: -18019901,
              message: "The tracking number has already been registered.",
            },
            number: "PRIVATE-TRACKING-NUMBER",
          },
        ],
      },
    });

    expect(result.syncStatus).toBe("PENDING");
    expect(result.events).toEqual([]);
  });

  it("maps an unavailable real-time entitlement without inventing data", () => {
    const result = parseSeventeenTrackSnapshot({
      code: -18019912,
      data: {
        errors: [
          {
            code: -18019912,
            message: "The real-time query interface is not authorized.",
          },
        ],
      },
    });

    expect(result.syncStatus).toBe("UNAVAILABLE");
    expect(result.rawStatus).toBe(
      "-18019912: The real-time query interface is not authorized.",
    );
    expect(result.events).toEqual([]);
  });

  it("uses package status instead of subscription lifecycle status", () => {
    const result = parseSeventeenTrackSnapshot({
      code: 0,
      data: {
        accepted: [
          {
            carrier: 7041,
            package_status: "NotFound",
            sync_status: null,
            tracking_status: "Tracking",
          },
        ],
      },
    });

    expect(result.carrierCode).toBe("7041");
    expect(result.rawStatus).toBe("NotFound");
    expect(result.syncStatus).toBe("NOT_FOUND");
  });

  it("selects the detected carrier and combines multi-provider events", () => {
    const result = parseSeventeenTrackSnapshot({
      code: 0,
      data: {
        accepted: [
          {
            carrier: 7041,
            track_info: {
              latest_status: {
                status: "InfoReceived",
                sub_status: "InfoReceived",
              },
              tracking: {
                providers: [
                  {
                    events: [],
                    latest_sync_status: "Success",
                    provider: { key: 6041, name: "Posti" },
                  },
                  {
                    events: [
                      {
                        description: "Electronic shipment data received",
                        stage: "InfoReceived",
                        sub_status: "InfoReceived",
                        time_utc: "2026-10-04T09:00:00Z",
                      },
                    ],
                    latest_sync_status: "Success",
                    provider: { key: 7041, name: "DHL Paket" },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    expect(result.carrierCode).toBe("7041");
    expect(result.carrierName).toBe("DHL Paket");
    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.occurredAt?.toISOString()).toBe(
      "2026-10-04T09:00:00.000Z",
    );
    expect(result.syncStatus).toBe("SUCCESS");
  });

  it("preserves the provider ETA window instead of inventing an exact date", () => {
    const result = parseSeventeenTrackSnapshot({
      code: 0,
      data: {
        accepted: [
          {
            carrier: 7041,
            track_info: {
              time_metrics: {
                estimated_delivery_date: {
                  from: "2026-10-18",
                  to: "2026-10-21",
                },
              },
              tracking: {
                providers: [
                  {
                    latest_sync_status: "Success",
                    provider: { key: 7041, name: "DHL Paket" },
                  },
                ],
              },
            },
          },
        ],
      },
    });
    expect(result.estimatedDeliveryFrom).toEqual(new Date("2026-10-18"));
    expect(result.estimatedDeliveryTo).toEqual(new Date("2026-10-21"));
  });

  it("retains raw location internally while producing provider events", () => {
    const payload = {
      event: "TRACKING_UPDATED",
      data: {
        number: "PRIVATE-TRACKING-NUMBER",
        carrier: 3011,
        track_info: {
          latest_status: { status: "InTransit", sub_status: "InTransit" },
          tracking: {
            providers: [
              {
                provider: { key: 3011, name: "Carrier" },
                latest_sync_status: "Success",
                events: [
                  {
                    description: "Departed facility",
                    location: "Internal raw location",
                    stage: "Departure",
                    sub_status: "InTransit",
                    time_utc: "2026-10-10T10:00:00Z",
                  },
                ],
              },
            ],
          },
        },
      },
    };
    const webhook = parseSeventeenTrackWebhook(payload);
    expect(webhook.records).toHaveLength(1);
    expect(webhook.records[0]?.snapshot.events[0]).toMatchObject({
      location: "Internal raw location",
      status: "InTransit",
    });
    expect(webhook.records[0]?.snapshot.syncStatus).toBe("SUCCESS");
  });
});

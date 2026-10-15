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

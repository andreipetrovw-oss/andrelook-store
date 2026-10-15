import { describe, expect, it } from "vitest";

import {
  normalizeProviderEvent,
  shouldApplyCandidate,
  shipmentStatusRank,
} from "./normalization";

describe("tracking normalization", () => {
  it("does not turn Not Found or label creation into physical movement", () => {
    expect(
      normalizeProviderEvent(
        {
          description: "Shipment information received",
          id: "1",
          location: null,
          occurredAt: null,
          stage: "InfoReceived",
          status: "NotFound",
        },
        "INTERNATIONAL_INBOUND",
      ),
    ).toBeNull();
  });

  it("maps physical transit conservatively by shipment leg", () => {
    const event = {
      description: "Parcel is in transit",
      id: "2",
      location: "private",
      occurredAt: new Date("2026-10-10T10:00:00Z"),
      stage: "InTransit",
      status: "InTransit",
    };
    expect(normalizeProviderEvent(event, "INTERNATIONAL_INBOUND")).toBe(
      "INTERNATIONAL_TRANSIT",
    );
    expect(normalizeProviderEvent(event, "LOCAL_OUTBOUND")).toBe(
      "LOCAL_CARRIER",
    );
  });

  it("never moves a normal shipment backwards automatically", () => {
    expect(
      shouldApplyCandidate({
        candidate: "HANDED_TO_LOGISTICS",
        candidateAt: new Date("2026-10-12T10:00:00Z"),
        current: "ARRIVED_AT_ANDRELOOK",
        currentAt: new Date("2026-10-11T10:00:00Z"),
      }),
    ).toEqual({ apply: false, contradiction: true });
    expect(shipmentStatusRank("DELIVERED")).toBeGreaterThan(
      shipmentStatusRank("LOCAL_DELIVERY"),
    );
  });

  it("allows a newer confirmed event to clear a genuine exception", () => {
    expect(
      shouldApplyCandidate({
        candidate: "INTERNATIONAL_TRANSIT",
        candidateAt: new Date("2026-10-12T10:00:00Z"),
        current: "DELAYED_OR_EXCEPTION",
        currentAt: new Date("2026-10-11T10:00:00Z"),
      }).apply,
    ).toBe(true);
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildSuperbuyImportPreview,
  parseSuperbuyTrackingHistory,
} from "./superbuy-import";

const existingHistory = `
2026-10-04 11:00
Shipment instruction data provided electronically to DHL.
2026-10-04 11:29 Electronic goods/shipment information received.
2026-10-04 15:39 Parcel on the way to carrier warehouse.
2026-10-05 17:23 Arrived at receiving point.
2026-10-06 13:41 Express parcel outbound / sent to airline company.
2026-10-09 15:25 Flight booked / expected flight around 10 October.
2026-10-10 23:58 Flight departure.
2026-10-13 09:19 Flight landed in Europe / unloading in progress.
2026-10-15 15:03 Dismantling/unloading completed, awaiting customs clearance.
Status: TRANSIT
ETA: 2026-10-19
`;

describe("Superbuy owner paste parser", () => {
  it("recognizes the verified history and ETA without inventing events", () => {
    const result = parseSuperbuyTrackingHistory(existingHistory, "shipment-1");

    expect(result.evidence).toHaveLength(9);
    expect(result.evidence.map(({ eventType }) => eventType)).toEqual([
      "LOGISTICS_INSTRUCTION_PROVIDED",
      "LOGISTICS_INFORMATION_RECEIVED",
      "MOVING_TO_CARRIER_WAREHOUSE",
      "INTERNATIONAL_LOGISTICS_ACCEPTED",
      "AIR_TRANSPORT_HANDOFF",
      "FLIGHT_BOOKED",
      "INTERNATIONAL_TRANSIT_STARTED",
      "ARRIVED_IN_EUROPE",
      "EUROPE_PROCESSING_AWAITING_CUSTOMS",
    ]);
    expect(result.eta?.date.toISOString()).toBe("2026-10-19T09:00:00.000Z");
    expect(result.unrecognized).toEqual([]);
  });

  it("reports unknown lines and does not turn them into movement", () => {
    const result = parseSuperbuyTrackingHistory(
      "2026-10-16 09:00 Parcel is somewhere near Estonia",
      "shipment-1",
    );

    expect(result.evidence).toEqual([]);
    expect(result.eta).toBeNull();
    expect(result.unrecognized).toEqual([
      "2026-10-16 09:00 Parcel is somewhere near Estonia",
    ]);
  });

  it("deduplicates repeated equivalent lines by canonical evidence key", () => {
    const line = "2026-10-13 09:19 Flight landed in Europe.";
    const result = parseSuperbuyTrackingHistory(
      `${line}\n${line}`,
      "shipment-1",
    );

    expect(result.evidence).toHaveLength(1);
  });

  it("proposes nothing for existing history and only one genuinely new event", () => {
    const existing = parseSuperbuyTrackingHistory(
      existingHistory,
      "shipment-1",
    );
    const noChanges = buildSuperbuyImportPreview(
      existing,
      existing.evidence.map(({ canonicalKey }) => canonicalKey),
      { from: existing.eta!.date, to: existing.eta!.date },
    );
    expect(noChanges).toMatchObject({ etaProposed: false, newEvidence: [] });

    const updated = parseSuperbuyTrackingHistory(
      `${existingHistory}\n2026-10-16 10:30 Flight landed in Europe.`,
      "shipment-1",
    );
    const oneChange = buildSuperbuyImportPreview(
      updated,
      existing.evidence.map(({ canonicalKey }) => canonicalKey),
      { from: existing.eta!.date, to: existing.eta!.date },
    );
    expect(oneChange.newEvidence).toHaveLength(1);
    expect(oneChange.newEvidence[0]?.eventType).toBe("ARRIVED_IN_EUROPE");
  });

  it("proposes an updated ETA without treating it as a movement event", () => {
    const parsed = parseSuperbuyTrackingHistory(
      "Estimated arrival: 2026-10-21",
      "shipment-1",
    );
    const preview = buildSuperbuyImportPreview(parsed, [], {
      from: new Date("2026-10-19T09:00:00.000Z"),
      to: new Date("2026-10-19T09:00:00.000Z"),
    });

    expect(preview.etaProposed).toBe(true);
    expect(preview.newEvidence).toEqual([]);
  });
});

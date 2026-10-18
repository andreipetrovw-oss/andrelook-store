import "server-only";

import { parseEvidenceLocalDateTime, parseTallinnDate } from "./time";
import type { OwnerEvidenceInput } from "./owner-evidence";

export const verifiedPilotOrderNumbers = [
  "AL-20261015-32CC44",
  "AL-20261015-3D0AA1",
  "AL-20261015-4F3DAD",
] as const;

export function isVerifiedPilotOrderSet(orderNumbers: string[]) {
  const sorted = orderNumbers.toSorted();
  return (
    sorted.length === verifiedPilotOrderNumbers.length &&
    sorted.every(
      (orderNumber, index) => orderNumber === verifiedPilotOrderNumbers[index],
    )
  );
}

function upstreamTimestamp(value: string) {
  const parsed = parseEvidenceLocalDateTime(value, "Asia/Shanghai");
  if (!parsed) throw new Error("Invalid verified upstream timestamp.");
  return parsed;
}

function evidence(
  shipmentId: string,
  input: {
    customerVisible: boolean;
    eventType: OwnerEvidenceInput["eventType"];
    note: string;
    timestamp: string;
  },
): OwnerEvidenceInput & { canonicalKey: string } {
  return {
    canonicalKey: `owner-verified-upstream:${input.timestamp}:${input.eventType}`,
    customerVisible: input.customerVisible,
    eventTimestamp: upstreamTimestamp(input.timestamp),
    eventType: input.eventType,
    evidenceNote: input.note,
    internalLocation: null,
    internalReference: null,
    shipmentId,
    sourceLabel: "Superbuy (owner verified)",
    sourceTimestampText: input.timestamp.replace("T", " "),
    sourceTimeZone: "Asia/Shanghai",
    sourceType: "OWNER_VERIFIED_LOGISTICS",
    verificationStatus: "VERIFIED",
  };
}

export function verifiedPilotEvidence(shipmentId: string) {
  const eta = parseTallinnDate("2026-10-19");
  if (!eta) throw new Error("Invalid verified pilot ETA.");
  return {
    eta: {
      date: eta,
      note: "Owner-verified upstream logistics estimate shown by the live parcel source: 2026-10-19. Non-guaranteed estimate.",
    },
    evidence: [
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "LOGISTICS_INSTRUCTION_PROVIDED",
        note: "Shipment instruction data provided electronically to DHL.",
        timestamp: "2026-10-04T11:00",
      }),
      evidence(shipmentId, {
        customerVisible: false,
        eventType: "LOGISTICS_INFORMATION_RECEIVED",
        note: "Electronic goods/shipment information received.",
        timestamp: "2026-10-04T11:29",
      }),
      evidence(shipmentId, {
        customerVisible: false,
        eventType: "MOVING_TO_CARRIER_WAREHOUSE",
        note: "Parcel on the way to carrier warehouse.",
        timestamp: "2026-10-04T15:39",
      }),
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "INTERNATIONAL_LOGISTICS_ACCEPTED",
        note: "Arrived at receiving point.",
        timestamp: "2026-10-05T17:23",
      }),
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "AIR_TRANSPORT_HANDOFF",
        note: "Express parcel outbound / sent to airline company.",
        timestamp: "2026-10-06T13:41",
      }),
      evidence(shipmentId, {
        customerVisible: false,
        eventType: "FLIGHT_BOOKED",
        note: "Flight booked / expected flight around 10 October.",
        timestamp: "2026-10-09T15:25",
      }),
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "INTERNATIONAL_TRANSIT_STARTED",
        note: "Flight departure.",
        timestamp: "2026-10-10T23:58",
      }),
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "ARRIVED_IN_EUROPE",
        note: "Flight landed in Europe / unloading in progress.",
        timestamp: "2026-10-13T09:19",
      }),
      evidence(shipmentId, {
        customerVisible: true,
        eventType: "EUROPE_PROCESSING_AWAITING_CUSTOMS",
        note: "Dismantling/unloading completed, awaiting customs clearance.",
        timestamp: "2026-10-15T15:03",
      }),
    ],
  };
}

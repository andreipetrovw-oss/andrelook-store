import type { ShipmentKind, ShipmentStatus } from "@prisma/client";

import type { ProviderEvent } from "./types";

export const shipmentStatusOrder: ShipmentStatus[] = [
  "ORDER_CONFIRMED",
  "PREPARING_ORDER",
  "QUALITY_CHECK_COMPLETE",
  "HANDED_TO_LOGISTICS",
  "INTERNATIONAL_TRANSIT",
  "EUROPEAN_LOGISTICS",
  "ARRIVED_AT_ANDRELOOK",
  "READY_FOR_HANDOVER",
  "LOCAL_CARRIER",
  "LOCAL_DELIVERY",
  "DELIVERED",
];

export function shipmentStatusRank(status: ShipmentStatus): number {
  if (status === "DELAYED_OR_EXCEPTION") return -1;
  return shipmentStatusOrder.indexOf(status);
}

function searchable(event: ProviderEvent) {
  return [event.status, event.stage, event.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "");
}

export function normalizeProviderEvent(
  event: ProviderEvent,
  kind: ShipmentKind,
): ShipmentStatus | null {
  const value = searchable(event);
  if (!value || value.includes("notfound") || value.includes("inforeceived")) {
    return null;
  }
  if (
    value.includes("exception") ||
    value.includes("failedattempt") ||
    value.includes("returning") ||
    value.includes("expired")
  ) {
    return "DELAYED_OR_EXCEPTION";
  }
  if (value.includes("delivered")) {
    return kind === "LOCAL_OUTBOUND" ? "DELIVERED" : "ARRIVED_AT_ANDRELOOK";
  }
  if (
    value.includes("outfordelivery") ||
    value.includes("availableforpickup")
  ) {
    return kind === "LOCAL_OUTBOUND"
      ? "LOCAL_DELIVERY"
      : "INTERNATIONAL_TRANSIT";
  }
  if (
    value.includes("pickup") ||
    value.includes("pickedup") ||
    value.includes("departure") ||
    value.includes("transit") ||
    value.includes("arrival") ||
    value.includes("customs")
  ) {
    return kind === "LOCAL_OUTBOUND"
      ? "LOCAL_CARRIER"
      : "INTERNATIONAL_TRANSIT";
  }
  return null;
}

export function shouldApplyCandidate(input: {
  candidate: ShipmentStatus;
  candidateAt: Date | null;
  current: ShipmentStatus;
  currentAt: Date | null;
}): { apply: boolean; contradiction: boolean } {
  if (input.current === "DELIVERED") {
    return {
      apply: input.candidate === "DELIVERED",
      contradiction: input.candidate !== "DELIVERED",
    };
  }
  if (input.candidate === "DELAYED_OR_EXCEPTION") {
    const notOlder =
      !input.currentAt ||
      !input.candidateAt ||
      input.candidateAt >= input.currentAt;
    return { apply: notOlder, contradiction: !notOlder };
  }
  if (input.current === "DELAYED_OR_EXCEPTION") {
    const newer =
      !input.currentAt ||
      !input.candidateAt ||
      input.candidateAt >= input.currentAt;
    return { apply: newer, contradiction: !newer };
  }
  const candidateRank = shipmentStatusRank(input.candidate);
  const currentRank = shipmentStatusRank(input.current);
  if (candidateRank < currentRank) {
    return { apply: false, contradiction: true };
  }
  if (
    input.currentAt &&
    input.candidateAt &&
    input.candidateAt < input.currentAt
  ) {
    return {
      apply: candidateRank > currentRank,
      contradiction: candidateRank !== currentRank,
    };
  }
  return { apply: true, contradiction: false };
}

export function isMeaningfulMilestone(status: ShipmentStatus) {
  return [
    "HANDED_TO_LOGISTICS",
    "ARRIVED_AT_ANDRELOOK",
    "READY_FOR_HANDOVER",
    "LOCAL_CARRIER",
    "DELIVERED",
    "DELAYED_OR_EXCEPTION",
  ].includes(status);
}

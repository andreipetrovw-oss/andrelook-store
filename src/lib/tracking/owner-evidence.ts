import "server-only";

import { randomUUID } from "node:crypto";

import type {
  LogisticsEvidenceEventType,
  LogisticsEvidenceSourceType,
  LogisticsEvidenceVerificationStatus,
  Prisma,
  ShipmentStatus,
} from "@prisma/client";

import { getPrisma } from "@/lib/db";

import { shouldApplyCandidate } from "./normalization";
import type { PublicTrackingMilestoneStatus } from "./types";

export type OwnerEvidenceInput = {
  canonicalKey?: string;
  customerVisible: boolean;
  eventTimestamp: Date | null;
  eventType: LogisticsEvidenceEventType;
  evidenceNote: string;
  internalLocation: string | null;
  internalReference: string | null;
  shipmentId: string;
  sourceLabel: string;
  sourceTimestampText: string | null;
  sourceTimeZone: string | null;
  sourceType: LogisticsEvidenceSourceType;
  verificationStatus: Exclude<LogisticsEvidenceVerificationStatus, "VOIDED">;
};

type EvidenceForState = {
  eventTimestamp: Date | null;
  eventType: LogisticsEvidenceEventType;
  verificationStatus: LogisticsEvidenceVerificationStatus;
};

type ShipmentEvidenceState = {
  lastConfirmedEventAt: Date | null;
  normalizedStatus: ShipmentStatus;
  requiresOwnerReview: boolean;
};

export function normalizedStatusForOwnerEvidence(
  eventType: LogisticsEvidenceEventType,
): ShipmentStatus | null {
  if (eventType === "MOVING_TO_CARRIER_WAREHOUSE") {
    return "HANDED_TO_LOGISTICS";
  }
  if (
    eventType === "INTERNATIONAL_LOGISTICS_ACCEPTED" ||
    eventType === "AIR_TRANSPORT_HANDOFF" ||
    eventType === "INTERNATIONAL_TRANSIT_STARTED"
  ) {
    return "INTERNATIONAL_TRANSIT";
  }
  if (
    eventType === "ARRIVED_IN_EUROPE" ||
    eventType === "EUROPE_PROCESSING_AWAITING_CUSTOMS"
  ) {
    return "EUROPEAN_LOGISTICS";
  }
  return null;
}

export function isPhysicalOwnerEvidence(eventType: LogisticsEvidenceEventType) {
  return normalizedStatusForOwnerEvidence(eventType) !== null;
}

export function publicMilestoneForOwnerEvidence(
  eventType: LogisticsEvidenceEventType,
): PublicTrackingMilestoneStatus | null {
  if (
    eventType === "LOGISTICS_INSTRUCTION_PROVIDED" ||
    eventType === "LOGISTICS_INFORMATION_RECEIVED"
  ) {
    return "LOGISTICS_REGISTERED";
  }
  if (eventType === "INTERNATIONAL_LOGISTICS_ACCEPTED") {
    return "INTERNATIONAL_LOGISTICS_ACCEPTED";
  }
  if (eventType === "AIR_TRANSPORT_HANDOFF") {
    return "AIR_TRANSPORT_HANDOFF";
  }
  if (eventType === "INTERNATIONAL_TRANSIT_STARTED") {
    return "INTERNATIONAL_TRANSIT_STARTED";
  }
  if (eventType === "ARRIVED_IN_EUROPE") {
    return "ARRIVED_IN_EUROPE";
  }
  if (eventType === "EUROPE_PROCESSING_AWAITING_CUSTOMS") {
    return "EUROPE_PROCESSING_AWAITING_CUSTOMS";
  }
  return null;
}

function activeEvidence<T extends { id: string; supersedesId: string | null }>(
  records: T[],
) {
  const supersededIds = new Set(
    records.flatMap((record) =>
      record.supersedesId ? [record.supersedesId] : [],
    ),
  );
  return records.filter((record) => !supersededIds.has(record.id));
}

export function activeOwnerEvidence<
  T extends { id: string; supersedesId: string | null },
>(records: T[]) {
  return activeEvidence(records);
}

export function reconcileOwnerEvidenceState(
  shipment: ShipmentEvidenceState,
  records: Array<
    EvidenceForState & { id: string; supersedesId: string | null }
  >,
) {
  const verified = activeEvidence(records)
    .filter((record) => record.verificationStatus === "VERIFIED")
    .toSorted((left, right) => {
      if (!left.eventTimestamp) return 1;
      if (!right.eventTimestamp) return -1;
      return left.eventTimestamp.valueOf() - right.eventTimestamp.valueOf();
    });
  let currentStatus = shipment.normalizedStatus;
  let currentAt = shipment.lastConfirmedEventAt;
  let conflict = false;
  for (const evidence of verified) {
    const candidate = normalizedStatusForOwnerEvidence(evidence.eventType);
    if (!candidate || !evidence.eventTimestamp) continue;
    if (
      currentAt &&
      evidence.eventTimestamp < currentAt &&
      candidate !== currentStatus
    ) {
      conflict = true;
      continue;
    }
    const resolution = shouldApplyCandidate({
      candidate,
      candidateAt: evidence.eventTimestamp,
      current: currentStatus,
      currentAt,
    });
    conflict ||= resolution.contradiction;
    if (!resolution.apply) continue;
    currentStatus = candidate;
    currentAt = evidence.eventTimestamp;
  }
  return {
    conflict,
    lastConfirmedEventAt: currentAt,
    requiresOwnerReview: shipment.requiresOwnerReview || conflict,
    status: currentStatus,
  };
}

async function refreshShipmentEvidenceState(
  tx: Prisma.TransactionClient,
  shipmentId: string,
) {
  const [shipment, records] = await Promise.all([
    tx.shipment.findUniqueOrThrow({
      select: {
        lastConfirmedEventAt: true,
        normalizedStatus: true,
        requiresOwnerReview: true,
      },
      where: { id: shipmentId },
    }),
    tx.shipmentLogisticsEvidence.findMany({
      orderBy: [{ eventTimestamp: "asc" }, { createdAt: "asc" }],
      select: {
        eventTimestamp: true,
        eventType: true,
        id: true,
        supersedesId: true,
        verificationStatus: true,
      },
      where: { shipmentId },
    }),
  ]);
  const state = reconcileOwnerEvidenceState(shipment, records);
  await tx.shipment.update({
    data: {
      lastConfirmedEventAt: state.lastConfirmedEventAt,
      normalizedStatus: state.status,
      requiresOwnerReview: state.requiresOwnerReview,
      ...(state.lastConfirmedEventAt ? { staleFlag: false } : {}),
    },
    where: { id: shipmentId },
  });
  return state;
}

export async function createOwnerLogisticsEvidence(
  adminId: string,
  input: OwnerEvidenceInput,
) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const canonicalKey = input.canonicalKey ?? `owner:${randomUUID()}`;
    const existing = await tx.shipmentLogisticsEvidence.findFirst({
      select: { id: true },
      where: { canonicalKey, shipmentId: input.shipmentId },
    });
    if (existing) {
      return { created: false, evidenceId: existing.id };
    }
    const evidence = await tx.shipmentLogisticsEvidence.create({
      data: {
        canonicalKey,
        createdByAdminId: adminId,
        customerVisible: input.customerVisible,
        eventTimestamp: input.eventTimestamp,
        eventType: input.eventType,
        evidenceNote: input.evidenceNote,
        internalLocation: input.internalLocation,
        internalReference: input.internalReference,
        shipmentId: input.shipmentId,
        sourceLabel: input.sourceLabel,
        sourceTimestampText: input.sourceTimestampText,
        sourceTimeZone: input.sourceTimeZone,
        sourceType: input.sourceType,
        verificationStatus: input.verificationStatus,
      },
    });
    await refreshShipmentEvidenceState(tx, input.shipmentId);
    return { created: true, evidenceId: evidence.id };
  });
}

export async function reviseOwnerLogisticsEvidence(
  adminId: string,
  evidenceId: string,
  input: Omit<OwnerEvidenceInput, "canonicalKey" | "shipmentId">,
) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const current = await tx.shipmentLogisticsEvidence.findUniqueOrThrow({
      include: { supersededBy: { select: { id: true } } },
      where: { id: evidenceId },
    });
    if (current.supersededBy) {
      throw new Error("Only the latest evidence revision can be edited.");
    }
    const revision = await tx.shipmentLogisticsEvidence.create({
      data: {
        canonicalKey: current.canonicalKey,
        createdByAdminId: adminId,
        customerVisible: input.customerVisible,
        eventTimestamp: input.eventTimestamp,
        eventType: input.eventType,
        evidenceNote: input.evidenceNote,
        internalLocation: input.internalLocation,
        internalReference: input.internalReference,
        revision: current.revision + 1,
        shipmentId: current.shipmentId,
        sourceLabel: input.sourceLabel,
        sourceTimestampText: input.sourceTimestampText,
        sourceTimeZone: input.sourceTimeZone,
        sourceType: input.sourceType,
        supersedesId: current.id,
        verificationStatus: input.verificationStatus,
      },
    });
    await refreshShipmentEvidenceState(tx, current.shipmentId);
    return revision;
  });
}

export async function voidOwnerLogisticsEvidence(
  adminId: string,
  evidenceId: string,
  reason: string,
) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const current = await tx.shipmentLogisticsEvidence.findUniqueOrThrow({
      include: { supersededBy: { select: { id: true } } },
      where: { id: evidenceId },
    });
    if (current.supersededBy) {
      throw new Error("Only the latest evidence revision can be voided.");
    }
    const revision = await tx.shipmentLogisticsEvidence.create({
      data: {
        canonicalKey: current.canonicalKey,
        createdByAdminId: adminId,
        customerVisible: false,
        eventTimestamp: current.eventTimestamp,
        eventType: current.eventType,
        evidenceNote: `${current.evidenceNote}\nVOID: ${reason}`,
        internalLocation: current.internalLocation,
        internalReference: current.internalReference,
        revision: current.revision + 1,
        shipmentId: current.shipmentId,
        sourceLabel: current.sourceLabel,
        sourceTimestampText: current.sourceTimestampText,
        sourceTimeZone: current.sourceTimeZone,
        sourceType: current.sourceType,
        supersedesId: current.id,
        verificationStatus: "VOIDED",
      },
    });
    await refreshShipmentEvidenceState(tx, current.shipmentId);
    return revision;
  });
}

export async function importOwnerLogisticsEvidence(input: {
  adminId: string;
  eta: { date: Date; note: string } | null;
  evidence: Array<OwnerEvidenceInput & { canonicalKey: string }>;
  shipmentId: string;
}) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const keys = input.evidence.map((evidence) => evidence.canonicalKey);
    const existing = new Set(
      (
        await tx.shipmentLogisticsEvidence.findMany({
          select: { canonicalKey: true },
          where: {
            canonicalKey: { in: keys },
            shipmentId: input.shipmentId,
          },
        })
      ).map((record) => record.canonicalKey),
    );
    let created = 0;
    for (const evidence of input.evidence) {
      if (existing.has(evidence.canonicalKey)) continue;
      await tx.shipmentLogisticsEvidence.create({
        data: {
          canonicalKey: evidence.canonicalKey,
          createdByAdminId: input.adminId,
          customerVisible: evidence.customerVisible,
          eventTimestamp: evidence.eventTimestamp,
          eventType: evidence.eventType,
          evidenceNote: evidence.evidenceNote,
          internalLocation: evidence.internalLocation,
          internalReference: evidence.internalReference,
          shipmentId: input.shipmentId,
          sourceLabel: evidence.sourceLabel,
          sourceTimestampText: evidence.sourceTimestampText,
          sourceTimeZone: evidence.sourceTimeZone,
          sourceType: evidence.sourceType,
          verificationStatus: evidence.verificationStatus,
        },
      });
      created += 1;
    }
    const state = created
      ? await refreshShipmentEvidenceState(tx, input.shipmentId)
      : await tx.shipment
          .findUniqueOrThrow({
            select: {
              lastConfirmedEventAt: true,
              normalizedStatus: true,
              requiresOwnerReview: true,
            },
            where: { id: input.shipmentId },
          })
          .then((shipment) => ({
            conflict: false,
            lastConfirmedEventAt: shipment.lastConfirmedEventAt,
            requiresOwnerReview: shipment.requiresOwnerReview,
            status: shipment.normalizedStatus,
          }));
    let etaUpdated = false;
    if (input.eta) {
      const currentEta = await tx.shipment.findUniqueOrThrow({
        select: {
          etaEvidenceNote: true,
          etaFrom: true,
          etaSource: true,
          etaTo: true,
          etaWindowSource: true,
        },
        where: { id: input.shipmentId },
      });
      const authoritativeEta =
        currentEta.etaSource === "PROVIDER_EVENT" ||
        currentEta.etaSource === "LOCAL_CARRIER_EVENT" ||
        currentEta.etaWindowSource === "PROVIDER" ||
        currentEta.etaWindowSource === "OFFICIAL_CARRIER";
      const alreadyImported =
        currentEta.etaFrom?.valueOf() === input.eta.date.valueOf() &&
        currentEta.etaTo?.valueOf() === input.eta.date.valueOf() &&
        currentEta.etaEvidenceNote === input.eta.note &&
        currentEta.etaSource === "OWNER_VERIFIED_LOGISTICS" &&
        currentEta.etaWindowSource === "OWNER_VERIFIED_LOGISTICS";
      if (!authoritativeEta && !alreadyImported) {
        await tx.shipment.update({
          data: {
            estimatedDeliveryAt: input.eta.date,
            etaConfidence: "MEDIUM",
            etaConfirmedAt: new Date(),
            etaEvidenceNote: input.eta.note,
            etaFrom: input.eta.date,
            etaNote: input.eta.note,
            etaSource: "OWNER_VERIFIED_LOGISTICS",
            etaTo: input.eta.date,
            etaWindowSource: "OWNER_VERIFIED_LOGISTICS",
          },
          where: { id: input.shipmentId },
        });
        etaUpdated = true;
      }
    }
    return { created, etaUpdated, state };
  });
}

export function summarizeOwnerEvidence(records: EvidenceForState[]) {
  const verified = records.filter(
    (record) => record.verificationStatus === "VERIFIED",
  );
  const physicalDates = verified.flatMap((record) =>
    record.eventTimestamp && isPhysicalOwnerEvidence(record.eventType)
      ? [record.eventTimestamp]
      : [],
  );
  return {
    lastPhysicalMovementAt:
      physicalDates.toSorted(
        (left, right) => right.valueOf() - left.valueOf(),
      )[0] ?? null,
  };
}

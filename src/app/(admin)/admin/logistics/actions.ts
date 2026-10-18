"use server";

import {
  LogisticsEvidenceEventType,
  ShipmentIdentifierRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { notifyLinkedOrders } from "@/lib/tracking/notifications";
import {
  importOwnerLogisticsEvidence,
  publicMilestoneForOwnerEvidence,
} from "@/lib/tracking/owner-evidence";
import { reconcileShipment } from "@/lib/tracking/service";
import {
  buildSuperbuyImportPreview,
  parseSuperbuyTrackingHistory,
} from "@/lib/tracking/superbuy-import";
import {
  parseTallinnDate,
  parseTallinnLocalDateTime,
} from "@/lib/tracking/time";

const simpleEventTypes = [
  LogisticsEvidenceEventType.LOGISTICS_INSTRUCTION_PROVIDED,
  LogisticsEvidenceEventType.INTERNATIONAL_LOGISTICS_ACCEPTED,
  LogisticsEvidenceEventType.AIR_TRANSPORT_HANDOFF,
  LogisticsEvidenceEventType.INTERNATIONAL_TRANSIT_STARTED,
  LogisticsEvidenceEventType.ARRIVED_IN_EUROPE,
  LogisticsEvidenceEventType.EUROPE_PROCESSING_AWAITING_CUSTOMS,
] as const;

const ownerEventLabels: Record<LogisticsEvidenceEventType, string> = {
  AIR_TRANSPORT_HANDOFF: "Передано авиаперевозчику",
  ARRIVED_IN_EUROPE: "Прибыло в Европу",
  ESTIMATED_ARRIVAL: "Расчётная дата прибытия",
  EUROPE_PROCESSING_AWAITING_CUSTOMS: "Ожидает таможенного оформления",
  FLIGHT_BOOKED: "Рейс забронирован",
  INTERNATIONAL_LOGISTICS_ACCEPTED: "Принято международной логистикой",
  INTERNATIONAL_TRANSIT_STARTED: "Международный транзит начался",
  LOGISTICS_INFORMATION_RECEIVED: "Логистическая информация получена",
  LOGISTICS_INSTRUCTION_PROVIDED: "Логистическая информация передана",
  MOVING_TO_CARRIER_WAREHOUSE: "Направляется на склад перевозчика",
};

const previewInput = z.object({
  rawText: z.string().trim().min(1).max(50_000),
  shipmentId: z.string().min(1),
});

export type SuperbuyPreviewState = {
  error: string | null;
  eta: string | null;
  etaProposed: boolean;
  events: Array<{ canonicalKey: string; label: string; timestamp: string }>;
  rawText: string;
  unrecognized: string[];
};

async function ownerAdminId() {
  const identity = await requireOwner();
  const admin = await getPrisma().adminUser.upsert({
    create: {
      email: identity.email,
      provider: identity.provider,
      providerSubject: identity.providerSubject,
    },
    update: { email: identity.email, isActive: true },
    where: {
      provider_providerSubject: {
        provider: identity.provider,
        providerSubject: identity.providerSubject,
      },
    },
  });
  return admin.id;
}

export async function previewSuperbuyUpdate(
  _previous: SuperbuyPreviewState,
  formData: FormData,
): Promise<SuperbuyPreviewState> {
  await requireOwner();
  const parsedInput = previewInput.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      error: "Вставьте историю отслеживания и попробуйте снова.",
      eta: null,
      etaProposed: false,
      events: [],
      rawText: "",
      unrecognized: [],
    };
  }
  const parsed = parseSuperbuyTrackingHistory(
    parsedInput.data.rawText,
    parsedInput.data.shipmentId,
  );
  const prisma = getPrisma();
  const [existingEvidence, shipment] = await Promise.all([
    prisma.shipmentLogisticsEvidence.findMany({
      select: { canonicalKey: true },
      where: {
        canonicalKey: {
          in: parsed.evidence.map(({ canonicalKey }) => canonicalKey),
        },
        shipmentId: parsedInput.data.shipmentId,
      },
    }),
    prisma.shipment.findUniqueOrThrow({
      select: { etaFrom: true, etaTo: true },
      where: { id: parsedInput.data.shipmentId },
    }),
  ]);
  const preview = buildSuperbuyImportPreview(
    parsed,
    existingEvidence.map(({ canonicalKey }) => canonicalKey),
    { from: shipment.etaFrom, to: shipment.etaTo },
  );
  return {
    error: null,
    eta: parsed.eta?.date.toISOString() ?? null,
    etaProposed: preview.etaProposed,
    events: preview.newEvidence.map((event) => ({
      canonicalKey: event.canonicalKey,
      label: ownerEventLabels[event.eventType],
      timestamp: event.eventTimestamp!.toISOString(),
    })),
    rawText: parsedInput.data.rawText,
    unrecognized: parsed.unrecognized,
  };
}

export async function confirmSuperbuyUpdate(formData: FormData) {
  const parsedInput = previewInput.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) throw new Error("Invalid upstream update.");
  const adminId = await ownerAdminId();
  const parsed = parseSuperbuyTrackingHistory(
    parsedInput.data.rawText,
    parsedInput.data.shipmentId,
  );
  await importOwnerLogisticsEvidence({
    adminId,
    eta: parsed.eta,
    evidence: parsed.evidence,
    shipmentId: parsedInput.data.shipmentId,
  });
  revalidatePath(`/admin/logistics/${parsedInput.data.shipmentId}`);
}

export async function addSimpleManualUpdate(formData: FormData) {
  const parsed = z
    .object({
      eta: z.string().trim(),
      eventTimestamp: z.string().trim().min(1),
      eventType: z.enum(simpleEventTypes),
      note: z.string().trim().max(1_000),
      shipmentId: z.string().min(1),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid manual logistics update.");
  const eventTimestamp = parseTallinnLocalDateTime(parsed.data.eventTimestamp);
  if (!eventTimestamp) throw new Error("Invalid Tallinn event timestamp.");
  const eta = parsed.data.eta ? parseTallinnDate(parsed.data.eta) : null;
  if (parsed.data.eta && !eta) throw new Error("Invalid ETA date.");
  const adminId = await ownerAdminId();
  const sourceTimestampText = parsed.data.eventTimestamp.replace("T", " ");
  await importOwnerLogisticsEvidence({
    adminId,
    eta: eta
      ? {
          date: eta,
          note:
            parsed.data.note ||
            "Owner-confirmed logistics estimate entered in CRM.",
        }
      : null,
    evidence: [
      {
        canonicalKey: `owner-manual:${sourceTimestampText}:${parsed.data.eventType}`,
        customerVisible:
          publicMilestoneForOwnerEvidence(parsed.data.eventType) !== null,
        eventTimestamp,
        eventType: parsed.data.eventType,
        evidenceNote:
          parsed.data.note || "Manual update confirmed by the owner.",
        internalLocation: null,
        internalReference: null,
        shipmentId: parsed.data.shipmentId,
        sourceLabel: "Owner manual update",
        sourceTimestampText,
        sourceTimeZone: "Europe/Tallinn",
        sourceType: "OWNER_VERIFIED_LOGISTICS",
        verificationStatus: "VERIFIED",
      },
    ],
    shipmentId: parsed.data.shipmentId,
  });
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
}

export async function refreshPrimaryCarrier(formData: FormData) {
  await requireOwner();
  const shipmentId = z.string().min(1).parse(formData.get("shipmentId"));
  const result = await reconcileShipment(shipmentId);
  const newlyVisible = result.primaryResult?.newlyVisible ?? [];
  if (newlyVisible.length) {
    await notifyLinkedOrders(shipmentId, [...new Set(newlyVisible)]);
  }
  revalidatePath(`/admin/logistics/${shipmentId}`);
}

export async function updateShipmentIdentifiers(formData: FormData) {
  await requireOwner();
  const parsed = z
    .object({
      localTracking: z.string().trim().max(160),
      shipmentId: z.string().min(1),
      upstreamTracking: z.string().trim().max(160),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid tracking identifiers.");
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const values = [
      {
        role: ShipmentIdentifierRole.UPSTREAM_INTERNATIONAL,
        sourceLabel: "Superbuy parcel/order number",
        value: parsed.data.upstreamTracking,
      },
      {
        role: ShipmentIdentifierRole.LOCAL_LAST_MILE,
        sourceLabel: "Secondary/local tracking number",
        value: parsed.data.localTracking,
      },
    ];
    for (const item of values) {
      const active = await tx.shipmentTrackingIdentifier.findFirst({
        select: { id: true, value: true },
        where: {
          isActive: true,
          role: item.role,
          shipmentId: parsed.data.shipmentId,
        },
      });
      if (active?.value === item.value) continue;
      await tx.shipmentTrackingIdentifier.updateMany({
        data: { isActive: false, retiredAt: new Date() },
        where: {
          isActive: true,
          role: item.role,
          shipmentId: parsed.data.shipmentId,
        },
      });
      if (!item.value) continue;
      await tx.shipmentTrackingIdentifier.upsert({
        create: {
          role: item.role,
          shipmentId: parsed.data.shipmentId,
          sourceLabel: item.sourceLabel,
          value: item.value,
        },
        update: {
          isActive: true,
          retiredAt: null,
          role: item.role,
          sourceLabel: item.sourceLabel,
        },
        where: {
          shipmentId_value: {
            shipmentId: parsed.data.shipmentId,
            value: item.value,
          },
        },
      });
    }
  });
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
}

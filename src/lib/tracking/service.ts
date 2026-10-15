import "server-only";

import { createHash, randomUUID } from "node:crypto";

import {
  Prisma,
  type ShipmentProvider,
  type ShipmentStatus,
  type TrackingEvidenceSource,
} from "@prisma/client";

import { getPrisma } from "@/lib/db";

import {
  isMeaningfulMilestone,
  normalizeProviderEvent,
  shouldApplyCandidate,
} from "./normalization";
import { getTrackingAdapter } from "./providers";
import { safeProviderError } from "./security";
import type { ProviderSnapshot } from "./types";

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function contentHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(value ?? null))
    .digest("hex");
}

function latestDate(values: Array<Date | null | undefined>) {
  return values.reduce<Date | null>((latest, value) => {
    if (!value) return latest;
    return !latest || value > latest ? value : latest;
  }, null);
}

export async function ingestProviderSnapshot(
  shipmentId: string,
  snapshot: ProviderSnapshot,
) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUniqueOrThrow({
      select: {
        kind: true,
        lastConfirmedEventAt: true,
        normalizedStatus: true,
        provider: true,
        requiresOwnerReview: true,
      },
      where: { id: shipmentId },
    });
    await tx.trackingProviderRecord.upsert({
      create: {
        carrierCode: snapshot.carrierCode,
        carrierName: snapshot.carrierName,
        contentHash: contentHash(snapshot.raw),
        latestEventAt: latestDate(
          snapshot.events.map((event) => event.occurredAt),
        ),
        payload: jsonValue(snapshot.raw),
        provider: snapshot.provider,
        providerRecordId: snapshot.providerTrackingId,
        shipmentId,
        syncStatus: snapshot.syncStatus,
      },
      update: {},
      where: {
        shipmentId_provider_contentHash: {
          contentHash: contentHash(snapshot.raw),
          provider: snapshot.provider,
          shipmentId,
        },
      },
    });

    let currentStatus = shipment.normalizedStatus;
    let currentAt = shipment.lastConfirmedEventAt;
    let requiresOwnerReview = false;
    const newlyVisible: ShipmentStatus[] = [];
    for (const event of snapshot.events) {
      const normalizedStatus = normalizeProviderEvent(event, shipment.kind);
      if (!normalizedStatus) continue;
      const resolution = shouldApplyCandidate({
        candidate: normalizedStatus,
        candidateAt: event.occurredAt,
        current: currentStatus,
        currentAt,
      });
      const changed = resolution.apply && normalizedStatus !== currentStatus;
      requiresOwnerReview ||= resolution.contradiction;
      const providerEventId = `${snapshot.provider}:${event.id}`;
      await tx.trackingEvent.upsert({
        create: {
          customerVisible: changed,
          evidenceSource:
            snapshot.provider === "LOCAL_CARRIER"
              ? "LOCAL_CARRIER_EVENT"
              : "PROVIDER_EVENT",
          normalizedStatus,
          provider: snapshot.provider,
          providerEventId,
          publicTimestamp: changed ? event.occurredAt : null,
          rawDescription: event.description,
          rawLocation: event.location,
          rawStatus: event.status ?? event.stage,
          rawTimestamp: event.occurredAt,
          shipmentId,
        },
        update: {},
        where: {
          shipmentId_evidenceSource_providerEventId: {
            evidenceSource:
              snapshot.provider === "LOCAL_CARRIER"
                ? "LOCAL_CARRIER_EVENT"
                : "PROVIDER_EVENT",
            providerEventId,
            shipmentId,
          },
        },
      });
      if (changed) newlyVisible.push(normalizedStatus);
      if (resolution.apply) {
        currentStatus = normalizedStatus;
        currentAt = event.occurredAt ?? currentAt;
      }
    }

    const providerUpdateAt = latestDate(
      snapshot.events.map((event) => event.occurredAt),
    );
    const success = snapshot.syncStatus === "SUCCESS";
    const isPrimary = snapshot.provider === shipment.provider;
    await tx.shipment.update({
      data: {
        ...(snapshot.provider === "SHIP24" && snapshot.providerTrackingId
          ? { fallbackTrackingId: snapshot.providerTrackingId }
          : snapshot.providerTrackingId
            ? { providerTrackingId: snapshot.providerTrackingId }
            : {}),
        detectedCarrierCode: isPrimary ? snapshot.carrierCode : undefined,
        detectedCarrierName: isPrimary ? snapshot.carrierName : undefined,
        fallbackDetectedCarrierCode: !isPrimary
          ? snapshot.carrierCode
          : undefined,
        fallbackDetectedCarrierName: !isPrimary
          ? snapshot.carrierName
          : undefined,
        ...(snapshot.estimatedDeliveryAt
          ? {
              estimatedDeliveryAt: snapshot.estimatedDeliveryAt,
              etaConfirmedAt: new Date(),
              etaNote: null,
              etaSource: "PROVIDER_EVENT",
            }
          : {}),
        lastConfirmedEventAt: currentAt,
        lastProviderUpdateAt: isPrimary ? providerUpdateAt : undefined,
        fallbackLastProviderUpdateAt: !isPrimary ? providerUpdateAt : undefined,
        lastSuccessfulSyncAt: isPrimary && success ? new Date() : undefined,
        lastSyncAt: isPrimary ? new Date() : undefined,
        fallbackLastSuccessfulSyncAt:
          !isPrimary && success ? new Date() : undefined,
        fallbackLastSyncAt: !isPrimary ? new Date() : undefined,
        normalizedStatus: currentStatus,
        providerLastError: isPrimary
          ? success
            ? null
            : snapshot.rawStatus
          : undefined,
        providerSyncStatus: isPrimary ? snapshot.syncStatus : undefined,
        fallbackLastError: !isPrimary
          ? success
            ? null
            : snapshot.rawStatus
          : undefined,
        fallbackSyncStatus: !isPrimary ? snapshot.syncStatus : undefined,
        rawStatus: isPrimary ? snapshot.rawStatus : undefined,
        fallbackRawStatus: !isPrimary ? snapshot.rawStatus : undefined,
        requiresOwnerReview:
          shipment.requiresOwnerReview || requiresOwnerReview,
        staleFlag: success && providerUpdateAt ? false : undefined,
        ...(currentStatus === "DELIVERED" ? { deliveredAt: currentAt } : {}),
      },
      where: { id: shipmentId },
    });

    return {
      newlyVisible,
      requiresOwnerReview,
      status: currentStatus,
      syncStatus: snapshot.syncStatus,
    };
  });
}

export async function reconcileShipment(
  shipmentId: string,
  options: { forceFallback?: boolean; realTime?: boolean } = {},
) {
  const prisma = getPrisma();
  const shipment = await prisma.shipment.findUniqueOrThrow({
    select: {
      detectedCarrierCode: true,
      fallbackProvider: true,
      id: true,
      internalTrackingNumber: true,
      lastConfirmedEventAt: true,
      provider: true,
      providerSyncStatus: true,
      staleFlag: true,
      staleAfterDays: true,
    },
    where: { id: shipmentId },
  });
  const primary = getTrackingAdapter(shipment.provider);
  let primaryResult: Awaited<ReturnType<typeof ingestProviderSnapshot>> | null =
    null;
  if (primary) {
    try {
      const input = {
        carrierCode: shipment.detectedCarrierCode,
        shipmentId,
        trackingNumber: shipment.internalTrackingNumber,
      };
      const snapshot =
        options.realTime && primary.getRealTimeTracking
          ? await primary.getRealTimeTracking(input)
          : await primary.getTracking(input);
      primaryResult = await ingestProviderSnapshot(shipmentId, snapshot);
    } catch (error) {
      await prisma.shipment.update({
        data: {
          lastSyncAt: new Date(),
          providerLastError: safeProviderError(error),
          providerSyncStatus: "FAILURE",
        },
        where: { id: shipmentId },
      });
    }
  }

  const staleCutoff = new Date(
    Date.now() - shipment.staleAfterDays * 24 * 60 * 60 * 1000,
  );
  const shouldFallback =
    options.forceFallback ||
    !primary ||
    primaryResult?.syncStatus === "FAILURE" ||
    primaryResult?.syncStatus === "NOT_FOUND" ||
    shipment.providerSyncStatus === "FAILURE" ||
    shipment.providerSyncStatus === "NOT_FOUND" ||
    shipment.staleFlag ||
    (shipment.lastConfirmedEventAt !== null &&
      shipment.lastConfirmedEventAt < staleCutoff);
  const fallbackProvider = shipment.fallbackProvider ?? "SHIP24";
  const fallback = shouldFallback ? getTrackingAdapter(fallbackProvider) : null;
  let fallbackResult: Awaited<
    ReturnType<typeof ingestProviderSnapshot>
  > | null = null;
  if (fallback && fallbackProvider !== shipment.provider) {
    try {
      fallbackResult = await ingestProviderSnapshot(
        shipmentId,
        await fallback.getTracking({
          shipmentId,
          trackingNumber: shipment.internalTrackingNumber,
        }),
      );
    } catch (error) {
      await prisma.shipment.update({
        data: {
          fallbackLastError: safeProviderError(error),
          fallbackLastSyncAt: new Date(),
          fallbackSyncStatus: "FAILURE",
          requiresOwnerReview: true,
        },
        where: { id: shipmentId },
      });
    }
  }
  return { fallbackResult, primaryResult };
}

export async function registerShipment(shipmentId: string) {
  const prisma = getPrisma();
  const shipment = await prisma.shipment.findUniqueOrThrow({
    select: {
      detectedCarrierCode: true,
      internalTrackingNumber: true,
      provider: true,
    },
    where: { id: shipmentId },
  });
  const adapter = getTrackingAdapter(shipment.provider);
  if (!adapter) {
    await prisma.shipment.update({
      data: {
        providerLastError: "Provider credentials are not configured.",
        providerSyncStatus: "UNAVAILABLE",
      },
      where: { id: shipmentId },
    });
    return { configured: false as const };
  }
  const snapshot = await adapter.register({
    carrierCode: shipment.detectedCarrierCode,
    shipmentId,
    trackingNumber: shipment.internalTrackingNumber,
  });
  await ingestProviderSnapshot(shipmentId, snapshot);
  const current = await adapter.getTracking({
    carrierCode: snapshot.carrierCode ?? shipment.detectedCarrierCode,
    shipmentId,
    trackingNumber: shipment.internalTrackingNumber,
  });
  await ingestProviderSnapshot(shipmentId, current);
  if (current.syncStatus === "FAILURE" || current.syncStatus === "NOT_FOUND") {
    await reconcileShipment(shipmentId, { forceFallback: true });
  }
  return { configured: true as const, syncStatus: current.syncStatus };
}

export async function recordOperationalMilestone(input: {
  adminId: string;
  evidenceSource: Extract<
    TrackingEvidenceSource,
    "OWNER_CONFIRMED" | "WAREHOUSE_CONFIRMED" | "MANUAL_OVERRIDE"
  >;
  occurredAt: Date | null;
  reason: string;
  shipmentId: string;
  status: ShipmentStatus;
}) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUniqueOrThrow({
      select: { lastConfirmedEventAt: true, normalizedStatus: true },
      where: { id: input.shipmentId },
    });
    const resolution = shouldApplyCandidate({
      candidate: input.status,
      candidateAt: input.occurredAt,
      current: shipment.normalizedStatus,
      currentAt: shipment.lastConfirmedEventAt,
    });
    const manualOverride = input.evidenceSource === "MANUAL_OVERRIDE";
    if (!resolution.apply && !manualOverride) {
      throw new Error(
        "Operational milestone would move the shipment backwards.",
      );
    }
    const changed = input.status !== shipment.normalizedStatus;
    await tx.trackingEvent.create({
      data: {
        createdByAdminId: input.adminId,
        customerVisible: changed,
        evidenceSource: input.evidenceSource,
        normalizedStatus: input.status,
        providerEventId: `operational:${randomUUID()}`,
        publicTimestamp: input.occurredAt,
        rawDescription: input.reason,
        rawTimestamp: input.occurredAt,
        shipmentId: input.shipmentId,
      },
    });
    if (manualOverride) {
      await tx.shipmentStatusOverride.create({
        data: {
          changedByAdminId: input.adminId,
          evidenceSource: input.evidenceSource,
          fromStatus: shipment.normalizedStatus,
          reason: input.reason,
          shipmentId: input.shipmentId,
          toStatus: input.status,
        },
      });
    }
    await tx.shipment.update({
      data: {
        lastConfirmedEventAt: input.occurredAt ?? shipment.lastConfirmedEventAt,
        normalizedStatus: input.status,
        requiresOwnerReview: manualOverride ? false : undefined,
        ...(input.status === "DELIVERED"
          ? { deliveredAt: input.occurredAt ?? new Date() }
          : {}),
      },
      where: { id: input.shipmentId },
    });
    return { changed, notify: changed && isMeaningfulMilestone(input.status) };
  });
}

export async function markStaleShipments() {
  const prisma = getPrisma();
  const shipments = await prisma.shipment.findMany({
    select: {
      createdAt: true,
      id: true,
      lastConfirmedEventAt: true,
      staleAfterDays: true,
    },
    where: { normalizedStatus: { notIn: ["DELIVERED"] } },
  });
  const now = Date.now();
  await Promise.all(
    shipments.map((shipment) => {
      const lastMovementOrRegistration =
        shipment.lastConfirmedEventAt ?? shipment.createdAt;
      const stale =
        now - lastMovementOrRegistration.valueOf() >
        shipment.staleAfterDays * 24 * 60 * 60 * 1000;
      return prisma.shipment.update({
        data: { staleFlag: stale },
        where: { id: shipment.id },
      });
    }),
  );
  return shipments.length;
}

export async function ingestWebhookSnapshot(input: {
  provider: ShipmentProvider;
  snapshot: ProviderSnapshot;
  trackingNumber: string;
}) {
  const shipment = await getPrisma().shipment.findFirst({
    select: { id: true },
    where: {
      internalTrackingNumber: input.trackingNumber,
      OR: [{ provider: input.provider }, { fallbackProvider: input.provider }],
    },
  });
  if (!shipment) return null;
  return {
    shipmentId: shipment.id,
    ...(await ingestProviderSnapshot(shipment.id, input.snapshot)),
  };
}

export async function reconcileActiveShipments() {
  await markStaleShipments();
  const shipments = await getPrisma().shipment.findMany({
    orderBy: [{ staleFlag: "desc" }, { lastSyncAt: "asc" }],
    select: { id: true },
    take: 20,
    where: { normalizedStatus: { not: "DELIVERED" } },
  });
  const updates: Array<{
    newlyVisible: ShipmentStatus[];
    shipmentId: string;
  }> = [];
  for (const shipment of shipments) {
    const result = await reconcileShipment(shipment.id);
    const newlyVisible = [
      ...(result.primaryResult?.newlyVisible ?? []),
      ...(result.fallbackResult?.newlyVisible ?? []),
    ];
    updates.push({
      newlyVisible: [...new Set(newlyVisible)],
      shipmentId: shipment.id,
    });
  }
  return { reconciled: updates.length, updates };
}

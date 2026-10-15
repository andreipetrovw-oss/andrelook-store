import "server-only";

import type { ShipmentStatus } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  ARRIVED_AT_ANDRELOOK: "Прибыло в Andrelook",
  DELAYED_OR_EXCEPTION: "Подтверждённое исключение / задержка",
  DELIVERED: "Доставлено",
  EUROPEAN_LOGISTICS: "Европейская логистика",
  HANDED_TO_LOGISTICS: "Передано логистическому партнёру",
  INTERNATIONAL_TRANSIT: "Международный транзит",
  LOCAL_CARRIER: "Передано местному перевозчику",
  LOCAL_DELIVERY: "Местная доставка",
  ORDER_CONFIRMED: "Заказ подтверждён",
  PREPARING_ORDER: "Подготовка заказа",
  QUALITY_CHECK_COMPLETE: "Проверка качества завершена",
  READY_FOR_HANDOVER: "Готово к личной передаче",
};

export async function getAdminShipments() {
  await requireOwner();
  return getPrisma().shipment.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      _count: { select: { orderLinks: true } },
      detectedCarrierName: true,
      id: true,
      internalTrackingNumber: true,
      kind: true,
      lastConfirmedEventAt: true,
      lastSuccessfulSyncAt: true,
      normalizedStatus: true,
      provider: true,
      providerSyncStatus: true,
      requiresOwnerReview: true,
      staleFlag: true,
    },
  });
}

export async function getAdminShipment(id: string) {
  await requireOwner();
  return getPrisma().shipment.findUnique({
    include: {
      events: { orderBy: [{ rawTimestamp: "desc" }, { createdAt: "desc" }] },
      orderLinks: {
        include: {
          order: {
            select: {
              customer: { select: { name: true } },
              displayNumber: true,
              id: true,
            },
          },
        },
        orderBy: { sequence: "asc" },
      },
      overrides: {
        include: { changedByAdmin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
      providerRecords: {
        orderBy: { receivedAt: "desc" },
        take: 10,
      },
    },
    where: { id },
  });
}

export async function getOrdersForShipmentLinking() {
  await requireOwner();
  return getPrisma().order.findMany({
    orderBy: { orderDate: "desc" },
    select: {
      customer: { select: { name: true } },
      displayNumber: true,
      id: true,
    },
    take: 200,
  });
}

export async function getManualOrderProducts() {
  await requireOwner();
  return getPrisma().product.findMany({
    orderBy: { internalCode: "asc" },
    select: {
      id: true,
      internalCode: true,
      retailPriceMinor: true,
      translations: {
        select: { name: true },
        take: 1,
        where: { locale: "RU" },
      },
    },
  });
}

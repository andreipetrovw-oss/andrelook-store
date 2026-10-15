import "server-only";

import type { DeliveryMode, Locale, ShipmentStatus } from "@prisma/client";

import { getPrisma } from "@/lib/db";

import { createTrackingToken, hashLookupBucket } from "./security";
import type { PublicTrackingLocale, PublicTrackingOrder } from "./types";

const statusLabels: Record<
  PublicTrackingLocale,
  Record<ShipmentStatus, string>
> = {
  EN: {
    ARRIVED_AT_ANDRELOOK: "Arrived at Andrelook",
    DELAYED_OR_EXCEPTION: "Logistics update requires attention",
    DELIVERED: "Delivered",
    EUROPEAN_LOGISTICS: "In the European logistics network",
    HANDED_TO_LOGISTICS: "Handed to logistics partner",
    INTERNATIONAL_TRANSIT: "In the international logistics network",
    LOCAL_CARRIER: "Handed to the local carrier",
    LOCAL_DELIVERY: "Local delivery in progress",
    ORDER_CONFIRMED: "Order confirmed",
    PREPARING_ORDER: "Preparing your order",
    QUALITY_CHECK_COMPLETE: "Quality check complete",
    READY_FOR_HANDOVER: "Ready for personal handover",
  },
  ET: {
    ARRIVED_AT_ANDRELOOK: "Saabus Andrelooki",
    DELAYED_OR_EXCEPTION: "Logistikauuendus vajab tähelepanu",
    DELIVERED: "Kohale toimetatud",
    EUROPEAN_LOGISTICS: "Euroopa logistikavõrgus",
    HANDED_TO_LOGISTICS: "Logistikapartnerile üle antud",
    INTERNATIONAL_TRANSIT: "Rahvusvahelises logistikavõrgus",
    LOCAL_CARRIER: "Kohalikule vedajale üle antud",
    LOCAL_DELIVERY: "Kohalik tarne on teel",
    ORDER_CONFIRMED: "Tellimus kinnitatud",
    PREPARING_ORDER: "Valmistame tellimust ette",
    QUALITY_CHECK_COMPLETE: "Kvaliteedikontroll lõpetatud",
    READY_FOR_HANDOVER: "Valmis isiklikuks üleandmiseks",
  },
  RU: {
    ARRIVED_AT_ANDRELOOK: "Заказ прибыл в Andrelook",
    DELAYED_OR_EXCEPTION: "Обновление логистики требует внимания",
    DELIVERED: "Доставлено",
    EUROPEAN_LOGISTICS: "В европейской логистической сети",
    HANDED_TO_LOGISTICS: "Передано логистическому партнёру",
    INTERNATIONAL_TRANSIT: "В международной логистической сети",
    LOCAL_CARRIER: "Передано местному перевозчику",
    LOCAL_DELIVERY: "Местная доставка в пути",
    ORDER_CONFIRMED: "Заказ подтверждён",
    PREPARING_ORDER: "Готовим ваш заказ",
    QUALITY_CHECK_COMPLETE: "Проверка качества завершена",
    READY_FOR_HANDOVER: "Готово к личной передаче",
  },
};

const deliveryLabels: Record<
  PublicTrackingLocale,
  Record<DeliveryMode, string>
> = {
  EN: {
    ESTONIA_DELIVERY: "Local Estonia delivery",
    INTERNATIONAL_DELIVERY: "Carrier delivery",
    PERSONAL_HANDOVER: "Personal handover",
  },
  ET: {
    ESTONIA_DELIVERY: "Kohalik tarne Eestis",
    INTERNATIONAL_DELIVERY: "Tarne vedajaga",
    PERSONAL_HANDOVER: "Isiklik üleandmine",
  },
  RU: {
    ESTONIA_DELIVERY: "Доставка по Эстонии",
    INTERNATIONAL_DELIVERY: "Доставка перевозчиком",
    PERSONAL_HANDOVER: "Личная передача",
  },
};

export function publicStatusLabel(
  locale: PublicTrackingLocale,
  status: ShipmentStatus,
) {
  return statusLabels[locale][status];
}

export function inferDeliveryMode(input: {
  countryCode: string | null;
  deliveryMode: DeliveryMode | null;
  fulfilmentMethod: "PERSONAL_HANDOVER" | "DELIVERY" | null;
}): DeliveryMode {
  if (input.deliveryMode) return input.deliveryMode;
  if (input.fulfilmentMethod === "PERSONAL_HANDOVER") {
    return "PERSONAL_HANDOVER";
  }
  return input.countryCode === "EE"
    ? "ESTONIA_DELIVERY"
    : "INTERNATIONAL_DELIVERY";
}

export async function getPublicTrackingOrder(
  token: string,
): Promise<PublicTrackingOrder | null> {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return null;
  const order = await getPrisma().order.findUnique({
    select: {
      city: true,
      countryCode: true,
      deliveryMode: true,
      displayNumber: true,
      fulfilmentMethod: true,
      items: {
        select: {
          colorSnapshot: true,
          productNameSnapshot: true,
          quantity: true,
          sizeSnapshot: true,
        },
      },
      orderDate: true,
      requestedLocale: true,
      shipmentLinks: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          shipment: {
            select: {
              estimatedDeliveryAt: true,
              exposePublicTracking: true,
              events: {
                orderBy: [{ publicTimestamp: "asc" }, { createdAt: "asc" }],
                select: {
                  createdAt: true,
                  normalizedStatus: true,
                  publicTimestamp: true,
                },
                where: { customerVisible: true },
              },
              lastConfirmedEventAt: true,
              normalizedStatus: true,
              publicCarrierName: true,
              publicTrackingNumber: true,
            },
          },
        },
        where: { customerVisible: true },
      },
    },
    where: { publicTrackingToken: token },
  });
  if (!order) return null;
  const locale = order.requestedLocale as PublicTrackingLocale;
  const activeShipment = order.shipmentLinks.at(-1)?.shipment ?? null;
  const timeline = [
    {
      label: statusLabels[locale].ORDER_CONFIRMED,
      occurredAt: order.orderDate.toISOString(),
      status: "ORDER_CONFIRMED" as const,
    },
    ...order.shipmentLinks.flatMap((link) =>
      link.shipment.events.map((event) => ({
        label: statusLabels[locale][event.normalizedStatus],
        occurredAt: (event.publicTimestamp ?? event.createdAt).toISOString(),
        status: event.normalizedStatus,
      })),
    ),
  ];
  const currentStatus = activeShipment?.normalizedStatus ?? "ORDER_CONFIRMED";
  const deliveryMode = inferDeliveryMode(order);
  return {
    carrierName: activeShipment?.exposePublicTracking
      ? activeShipment.publicCarrierName
      : null,
    deliveryMethod: deliveryLabels[locale][deliveryMode],
    estimatedDeliveryAt:
      activeShipment?.estimatedDeliveryAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      colour: item.colorSnapshot,
      name: item.productNameSnapshot,
      quantity: item.quantity,
      size: item.sizeSnapshot,
    })),
    lastUpdatedAt:
      activeShipment?.lastConfirmedEventAt?.toISOString() ??
      order.orderDate.toISOString(),
    locale,
    reference: order.displayNumber,
    status: currentStatus,
    statusLabel: statusLabels[locale][currentStatus],
    timeline,
    trackingNumber: activeShipment?.exposePublicTracking
      ? activeShipment.publicTrackingNumber
      : null,
  };
}

export async function consumeLookupAttempt(identifier: string) {
  const prisma = getPrisma();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.valueOf() / 900_000) * 900_000);
  const keyHash = hashLookupBucket(
    `${identifier}|${windowStart.toISOString()}`,
  );
  const bucket = await prisma.trackingLookupBucket.upsert({
    create: { attempts: 1, keyHash, windowStart },
    update: { attempts: { increment: 1 } },
    where: { keyHash },
  });
  return bucket.attempts <= 5;
}

export async function authenticateTrackingLookup(input: {
  email: string;
  reference: string;
}) {
  const prisma = getPrisma();
  const order = await prisma.order.findFirst({
    select: { id: true, publicTrackingToken: true },
    where: {
      displayNumber: input.reference.trim().toUpperCase(),
      OR: [
        {
          customer: {
            email: { equals: input.email.trim(), mode: "insensitive" },
          },
        },
        {
          customer: {
            preferredContactMethod: "EMAIL",
            preferredContactValue: {
              equals: input.email.trim(),
              mode: "insensitive",
            },
          },
        },
      ],
    },
  });
  if (!order) return null;
  if (order.publicTrackingToken) return order.publicTrackingToken;
  const token = createTrackingToken();
  const updated = await prisma.order.updateMany({
    data: { publicTrackingToken: token },
    where: { id: order.id, publicTrackingToken: null },
  });
  if (updated.count === 1) return token;
  return (
    await prisma.order.findUnique({
      select: { publicTrackingToken: true },
      where: { id: order.id },
    })
  )?.publicTrackingToken;
}

export function publicLocale(value: Locale): PublicTrackingLocale {
  return value;
}

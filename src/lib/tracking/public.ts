import "server-only";

import type {
  DeliveryMode,
  Locale,
  OrderTrackingMilestoneKind,
  ShipmentStatus,
} from "@prisma/client";

import { getPrisma } from "@/lib/db";

import {
  createTrackingToken,
  hashLookupBucket,
  hashTrackingAccessCode,
} from "./security";
import {
  activeOwnerEvidence,
  publicMilestoneForOwnerEvidence,
} from "./owner-evidence";
import type {
  PublicTrackingCurrentStatus,
  PublicTrackingLocale,
  PublicTrackingMilestoneStatus,
  PublicTrackingOrder,
} from "./types";

const statusLabels: Record<
  PublicTrackingLocale,
  Record<PublicTrackingMilestoneStatus, string>
> = {
  EN: {
    AIR_TRANSPORT_HANDOFF: "Shipment handed over for air transport",
    ARRIVED_IN_EUROPE: "Shipment arrived in Europe",
    ARRIVED_IN_ESTONIA: "Arrived in Estonia",
    DELIVERED: "Delivered",
    EUROPE_PROCESSING_AWAITING_CUSTOMS:
      "European logistics processing completed - awaiting customs clearance",
    IN_TRANSIT: "In transit",
    INTERNATIONAL_LOGISTICS_ACCEPTED:
      "Shipment accepted into international logistics",
    INTERNATIONAL_TRANSIT_STARTED: "International transit started",
    LOCAL_DELIVERY: "Local delivery",
    LOGISTICS_REGISTERED: "Logistics information received",
    ORDER_CONFIRMED: "Order confirmed",
    PACKED_AWAITING_DISPATCH: "Packed — awaiting dispatch",
    PREPARING: "Preparing your order",
    READY_FOR_HANDOVER: "Ready for handover",
    TRACKING_ADDED: "Order added to Andrelook tracking",
  },
  ET: {
    AIR_TRANSPORT_HANDOFF: "Saadetis üle antud lennutranspordile",
    ARRIVED_IN_EUROPE: "Saadetis saabus Euroopasse",
    ARRIVED_IN_ESTONIA: "Saabus Eestisse",
    DELIVERED: "Kohale toimetatud",
    EUROPE_PROCESSING_AWAITING_CUSTOMS:
      "Euroopa logistiline töötlemine lõpetatud - ootel tollivormistus",
    IN_TRANSIT: "Teel",
    INTERNATIONAL_LOGISTICS_ACCEPTED:
      "Saadetis vastu võetud rahvusvahelisse logistikasse",
    INTERNATIONAL_TRANSIT_STARTED: "Rahvusvaheline transport alanud",
    LOCAL_DELIVERY: "Kohalik tarne",
    LOGISTICS_REGISTERED: "Logistikaandmed edastatud",
    ORDER_CONFIRMED: "Tellimus kinnitatud",
    PACKED_AWAITING_DISPATCH: "Pakitud — ootab väljasaatmist",
    PREPARING: "Valmistame tellimust ette",
    READY_FOR_HANDOVER: "Valmis üleandmiseks",
    TRACKING_ADDED: "Tellimus lisati Andrelooki jälgimissüsteemi",
  },
  RU: {
    AIR_TRANSPORT_HANDOFF: "Отправление передано авиаперевозчику",
    ARRIVED_IN_EUROPE: "Отправление прибыло в Европу",
    ARRIVED_IN_ESTONIA: "Заказ прибыл в Эстонию",
    DELIVERED: "Доставлено",
    EUROPE_PROCESSING_AWAITING_CUSTOMS:
      "Обработка в европейском логистическом центре завершена - ожидается таможенное оформление",
    IN_TRANSIT: "В пути",
    INTERNATIONAL_LOGISTICS_ACCEPTED:
      "Отправление принято международной логистикой",
    INTERNATIONAL_TRANSIT_STARTED: "Международная перевозка началась",
    LOCAL_DELIVERY: "Доставка по Эстонии",
    LOGISTICS_REGISTERED: "Логистическая информация передана",
    ORDER_CONFIRMED: "Заказ подтверждён",
    PACKED_AWAITING_DISPATCH: "Упакован — ожидает отправки",
    PREPARING: "Готовим ваш заказ",
    READY_FOR_HANDOVER: "Готово к передаче",
    TRACKING_ADDED: "Заказ добавлен в систему отслеживания Andrelook",
  },
};

const deliveryLabels: Record<
  PublicTrackingLocale,
  Record<DeliveryMode, string>
> = {
  EN: {
    ESTONIA_DELIVERY: "Delivery within Estonia",
    INTERNATIONAL_DELIVERY: "International delivery",
    PERSONAL_HANDOVER: "Personal handover in Tallinn",
  },
  ET: {
    ESTONIA_DELIVERY: "Kohalik tarne Eestis",
    INTERNATIONAL_DELIVERY: "Rahvusvaheline tarne",
    PERSONAL_HANDOVER: "Isiklik üleandmine Tallinnas",
  },
  RU: {
    ESTONIA_DELIVERY: "Доставка по Эстонии",
    INTERNATIONAL_DELIVERY: "Международная доставка",
    PERSONAL_HANDOVER: "Личная передача в Таллине",
  },
};

const milestoneStatus: Partial<
  Record<OrderTrackingMilestoneKind, PublicTrackingCurrentStatus>
> = {
  INTERNATIONAL_DISPATCH_CONFIRMED: "IN_TRANSIT",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  PACKING_CONFIRMED: "PACKED_AWAITING_DISPATCH",
  PREPARATION_STARTED: "PREPARING",
  QUALITY_CHECK_APPROVED: "PREPARING",
  QUALITY_CHECK_RECEIVED: "PREPARING",
};

const publicTimelineRank: PublicTrackingMilestoneStatus[] = [
  "TRACKING_ADDED",
  "ORDER_CONFIRMED",
  "PREPARING",
  "PACKED_AWAITING_DISPATCH",
  "LOGISTICS_REGISTERED",
  "INTERNATIONAL_LOGISTICS_ACCEPTED",
  "AIR_TRANSPORT_HANDOFF",
  "INTERNATIONAL_TRANSIT_STARTED",
  "ARRIVED_IN_EUROPE",
  "EUROPE_PROCESSING_AWAITING_CUSTOMS",
  "IN_TRANSIT",
  "ARRIVED_IN_ESTONIA",
  "READY_FOR_HANDOVER",
  "LOCAL_DELIVERY",
  "DELIVERED",
];

const publicCurrentStatusRank: PublicTrackingCurrentStatus[] = [
  "TRACKING_ADDED",
  "ORDER_CONFIRMED",
  "PREPARING",
  "PACKED_AWAITING_DISPATCH",
  "LOGISTICS_REGISTERED",
  "IN_TRANSIT",
  "ARRIVED_IN_ESTONIA",
  "READY_FOR_HANDOVER",
  "LOCAL_DELIVERY",
  "DELIVERED",
];

function shipmentPublicStatus(
  status: ShipmentStatus,
): PublicTrackingCurrentStatus | null {
  if (status === "DELAYED_OR_EXCEPTION") return null;
  if (status === "ORDER_CONFIRMED") return "ORDER_CONFIRMED";
  if (status === "PREPARING_ORDER" || status === "QUALITY_CHECK_COMPLETE") {
    return "PREPARING";
  }
  if (
    status === "HANDED_TO_LOGISTICS" ||
    status === "INTERNATIONAL_TRANSIT" ||
    status === "EUROPEAN_LOGISTICS"
  ) {
    return "IN_TRANSIT";
  }
  if (status === "ARRIVED_AT_ANDRELOOK") return "ARRIVED_IN_ESTONIA";
  if (status === "READY_FOR_HANDOVER") return "READY_FOR_HANDOVER";
  if (status === "LOCAL_CARRIER" || status === "LOCAL_DELIVERY") {
    return "LOCAL_DELIVERY";
  }
  return "DELIVERED";
}

export function publicStatusForShipment(status: ShipmentStatus) {
  return shipmentPublicStatus(status);
}

function isLogisticsRegistration(rawStatus: string | null) {
  return rawStatus
    ?.toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "")
    .includes("inforeceived");
}

function localizedColour(locale: PublicTrackingLocale, value: string | null) {
  if (!value) return null;
  const key = value.trim().toLowerCase().replaceAll("ё", "е");
  if (!["black", "must", "черный"].includes(key)) return value;
  return { EN: "black", ET: "must", RU: "чёрный" }[locale];
}

export function publicStatusLabel(
  locale: PublicTrackingLocale,
  status: PublicTrackingMilestoneStatus,
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

function newestStatus(statuses: PublicTrackingCurrentStatus[]) {
  return statuses.reduce<PublicTrackingCurrentStatus>(
    (current, candidate) =>
      publicCurrentStatusRank.indexOf(candidate) >
      publicCurrentStatusRank.indexOf(current)
        ? candidate
        : current,
    "TRACKING_ADDED",
  );
}

function currentStatusForTimeline(
  status: PublicTrackingMilestoneStatus,
): PublicTrackingCurrentStatus | null {
  if (status === "LOGISTICS_REGISTERED") return null;
  if (
    status === "INTERNATIONAL_LOGISTICS_ACCEPTED" ||
    status === "AIR_TRANSPORT_HANDOFF" ||
    status === "INTERNATIONAL_TRANSIT_STARTED" ||
    status === "ARRIVED_IN_EUROPE" ||
    status === "EUROPE_PROCESSING_AWAITING_CUSTOMS"
  ) {
    return "IN_TRANSIT";
  }
  return status;
}

export async function getPublicTrackingOrder(
  token: string,
  requestedLocale?: PublicTrackingLocale,
): Promise<PublicTrackingOrder | null> {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return null;
  const order = await getPrisma().order.findUnique({
    select: {
      city: true,
      countryCode: true,
      createdAt: true,
      deliveryMode: true,
      displayNumber: true,
      fulfilmentMethod: true,
      items: {
        select: {
          colorSnapshot: true,
          productNameSnapshot: true,
          quantity: true,
          sizeSnapshot: true,
          product: {
            select: {
              translations: { select: { locale: true, name: true } },
            },
          },
        },
      },
      requestedLocale: true,
      shipmentLinks: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          shipment: {
            select: {
              estimatedDeliveryAt: true,
              etaFrom: true,
              etaTo: true,
              events: {
                orderBy: [{ publicTimestamp: "asc" }, { createdAt: "asc" }],
                select: {
                  evidenceSource: true,
                  normalizedStatus: true,
                  provider: true,
                  publicTimestamp: true,
                  rawStatus: true,
                },
                where: { customerVisible: true },
              },
              exposePublicTracking: true,
              normalizedStatus: true,
              logisticsEvidence: {
                orderBy: [{ eventTimestamp: "asc" }, { createdAt: "asc" }],
                select: {
                  customerVisible: true,
                  eventTimestamp: true,
                  eventType: true,
                  id: true,
                  supersedesId: true,
                  verificationStatus: true,
                },
              },
              provider: true,
              providerRecords: {
                orderBy: [{ latestEventAt: "desc" }, { receivedAt: "desc" }],
                select: {
                  latestEventAt: true,
                  provider: true,
                  syncStatus: true,
                },
                where: {
                  latestEventAt: { not: null },
                  syncStatus: "SUCCESS",
                },
              },
              providerSyncStatus: true,
              publicCarrierName: true,
              publicTrackingNumber: true,
              rawStatus: true,
            },
          },
        },
        where: { customerVisible: true },
      },
      trackingMilestones: {
        orderBy: { occurredAt: "asc" },
        select: { kind: true, occurredAt: true },
        where: { customerVisible: true },
      },
    },
    where: { publicTrackingToken: token },
  });
  if (!order) return null;
  const locale =
    requestedLocale ?? (order.requestedLocale as PublicTrackingLocale);
  const activeShipment = order.shipmentLinks.at(-1)?.shipment ?? null;
  const providerRegistration =
    activeShipment?.providerSyncStatus === "SUCCESS" &&
    isLogisticsRegistration(activeShipment.rawStatus)
      ? {
          occurredAt:
            activeShipment.providerRecords
              .find((record) => record.provider === activeShipment.provider)
              ?.latestEventAt?.toISOString() ?? null,
          status: "LOGISTICS_REGISTERED" as const,
        }
      : null;
  const confirmed = order.trackingMilestones.some(
    (milestone) => milestone.kind === "ORDER_CONFIRMED",
  );
  const events = [
    ...(confirmed
      ? []
      : [
          {
            occurredAt: order.createdAt.toISOString(),
            priority: 4,
            status: "TRACKING_ADDED" as const,
          },
        ]),
    ...order.trackingMilestones.flatMap((milestone) => {
      const status = milestoneStatus[milestone.kind];
      return status
        ? [
            {
              occurredAt: milestone.occurredAt.toISOString(),
              priority: 2,
              status,
            },
          ]
        : [];
    }),
    ...order.shipmentLinks.flatMap((link) =>
      link.shipment.events.flatMap((event) => {
        const status = isLogisticsRegistration(event.rawStatus)
          ? "LOGISTICS_REGISTERED"
          : shipmentPublicStatus(event.normalizedStatus);
        return status
          ? [
              {
                occurredAt: event.publicTimestamp?.toISOString() ?? null,
                priority: event.provider ? 1 : 2,
                status,
              },
            ]
          : [];
      }),
    ),
    ...order.shipmentLinks.flatMap((link) =>
      activeOwnerEvidence(link.shipment.logisticsEvidence ?? []).flatMap(
        (evidence) => {
          if (
            evidence.verificationStatus !== "VERIFIED" ||
            !evidence.customerVisible
          ) {
            return [];
          }
          const status = publicMilestoneForOwnerEvidence(evidence.eventType);
          return status
            ? [
                {
                  occurredAt: evidence.eventTimestamp?.toISOString() ?? null,
                  priority: 3,
                  status,
                },
              ]
            : [];
        },
      ),
    ),
    ...(providerRegistration ? [{ ...providerRegistration, priority: 1 }] : []),
  ];
  const deduplicated = new Map<
    PublicTrackingMilestoneStatus,
    {
      occurredAt: string | null;
      priority: number;
      status: PublicTrackingMilestoneStatus;
    }
  >();
  for (const event of events) {
    const existing = deduplicated.get(event.status);
    if (
      !existing ||
      event.priority < existing.priority ||
      (event.priority === existing.priority &&
        event.occurredAt &&
        (!existing.occurredAt ||
          (event.status === "LOGISTICS_REGISTERED"
            ? event.occurredAt < existing.occurredAt
            : event.occurredAt > existing.occurredAt)))
    ) {
      deduplicated.set(event.status, event);
    }
  }
  if (deduplicated.size > 1) {
    deduplicated.delete("TRACKING_ADDED");
  }
  const timeline = [...deduplicated.values()]
    .sort((a, b) =>
      a.occurredAt && b.occurredAt
        ? a.occurredAt.localeCompare(b.occurredAt)
        : publicTimelineRank.indexOf(a.status) -
          publicTimelineRank.indexOf(b.status),
    )
    .map(({ occurredAt, status }) => ({
      label: statusLabels[locale][status],
      occurredAt,
      status,
    }));
  const shipmentStatus = activeShipment
    ? shipmentPublicStatus(activeShipment.normalizedStatus)
    : null;
  const currentStatus = newestStatus([
    ...timeline.flatMap((event) => {
      const status = currentStatusForTimeline(event.status);
      return status ? [status] : [];
    }),
    ...(shipmentStatus && (confirmed || shipmentStatus !== "ORDER_CONFIRMED")
      ? [shipmentStatus]
      : []),
  ]);
  const meaningfulDates = timeline.flatMap((event) =>
    event.status !== "TRACKING_ADDED" && event.occurredAt
      ? [event.occurredAt]
      : [],
  );
  const deliveryMode = inferDeliveryMode(order);
  const legacyEta = activeShipment?.estimatedDeliveryAt ?? null;
  return {
    carrierName: activeShipment?.exposePublicTracking
      ? activeShipment.publicCarrierName
      : null,
    deliveryMethod: deliveryLabels[locale][deliveryMode],
    estimatedDeliveryFrom:
      (activeShipment?.etaFrom ?? legacyEta)?.toISOString() ?? null,
    estimatedDeliveryTo:
      (activeShipment?.etaTo ?? legacyEta)?.toISOString() ?? null,
    items: order.items.map((item) => ({
      colour: localizedColour(locale, item.colorSnapshot),
      name:
        item.product?.translations.find(
          (translation) => translation.locale === locale,
        )?.name ?? item.productNameSnapshot,
      quantity: item.quantity,
      size: item.sizeSnapshot,
    })),
    lastUpdatedAt: meaningfulDates.toSorted().at(-1) ?? null,
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

async function incrementLookupBucket(key: string, limit: number) {
  const prisma = getPrisma();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.valueOf() / 900_000) * 900_000);
  const keyHash = hashLookupBucket(`${key}|${windowStart.toISOString()}`);
  const bucket = await prisma.trackingLookupBucket.upsert({
    create: { attempts: 1, keyHash, windowStart },
    update: { attempts: { increment: 1 } },
    where: { keyHash },
  });
  return bucket.attempts <= limit;
}

export async function consumeLookupAttempt(
  identifier: string,
  reference: string,
) {
  const [addressAllowed, orderAllowed] = await Promise.all([
    incrementLookupBucket(`address:${identifier}`, 15),
    incrementLookupBucket(
      `address-order:${identifier}:${reference.trim().toUpperCase()}`,
      5,
    ),
  ]);
  return addressAllowed && orderAllowed;
}

export async function authenticateTrackingLookup(input: {
  accessCode: string;
  reference: string;
}) {
  const prisma = getPrisma();
  const codeHash =
    hashTrackingAccessCode(input.accessCode) ??
    hashLookupBucket(`invalid:${input.accessCode}`);
  const order = await prisma.order.findFirst({
    select: { id: true, publicTrackingToken: true },
    where: {
      displayNumber: input.reference.trim().toUpperCase(),
      trackingAccessCodeHash: codeHash,
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

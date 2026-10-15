"use server";

import {
  AcquisitionChannel,
  AvailabilityType,
  ContactMethod,
  DeliveryMode,
  Locale,
  OrderStatus,
  PaymentKind,
  PublicationStatus,
  ShipmentKind,
  ShipmentProvider,
  ShipmentRelationship,
  ShipmentStatus,
  TrackingEvidenceSource,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { sendNewOrderNotification } from "@/lib/notifications/order-notification";
import { createManualOrder as createManualOrderRecord } from "@/lib/orders/manual";
import { notifyLinkedOrders } from "@/lib/tracking/notifications";
import {
  createTrackingToken,
  safeProviderError,
} from "@/lib/tracking/security";
import {
  reconcileShipment,
  recordOperationalMilestone,
  registerShipment,
} from "@/lib/tracking/service";

const statusSchema = z.object({
  note: z.string().trim().max(500).optional(),
  orderId: z.string().min(1),
  status: z.enum(OrderStatus),
});

const paymentSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  kind: z.enum(PaymentKind),
  orderId: z.string().min(1),
  processorFee: z
    .union([z.literal(""), z.coerce.number().nonnegative().max(1_000_000)])
    .optional(),
  reference: z.string().trim().max(200).optional(),
});

const productCommercialSchema = z.object({
  availabilityType: z.union([z.enum(AvailabilityType), z.literal("")]),
  currency: z.string().trim().max(3),
  preorderEstimateText: z.string().trim().max(300),
  productId: z.string().min(1),
  publicationStatus: z.enum(PublicationStatus),
  retailPrice: z.string().trim().max(20),
});

const spendSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
  campaignName: z.string().trim().max(200).optional(),
  date: z.iso.date(),
  productId: z.string().trim().optional(),
  source: z.enum(["META_ADS", "GOOGLE_ADS"]),
});

const campaignChangeSchema = z.object({
  campaignName: z.string().trim().min(1).max(200),
  change: z.string().trim().min(1).max(500),
  changedAt: z.iso.date(),
  reason: z.string().trim().max(500).optional(),
});

const statusBusinessEvent = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  CANCELLED: "CANCELLED",
  CONFIRMED: "LEAD_CONFIRMED",
  CONTACTED: "LEAD_CONTACTED",
  DELIVERED: "DELIVERED",
  IN_TRANSIT: "IN_TRANSIT",
  ORDERED: "ORDERED",
  PAID: "PAID",
  READY: "READY",
} as const;

async function adminId() {
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

const manualOrderSchema = z.object({
  acquisitionChannel: z.enum(AcquisitionChannel),
  addressLine1: z.string().trim().max(300).optional(),
  addressLine2: z.string().trim().max(300).optional(),
  city: z.string().trim().max(120),
  contactMethod: z.enum(ContactMethod),
  contactValue: z.string().trim().min(2).max(320),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  customerEmail: z.union([z.literal(""), z.email().max(320)]),
  customerName: z.string().trim().min(2).max(200),
  customerPhone: z.string().trim().max(60).optional(),
  deliveryMode: z.enum(DeliveryMode),
  locale: z.enum(Locale),
  notes: z.string().trim().max(2000).optional(),
  paymentAmount: z.string().trim().max(20),
  paymentKind: z.union([z.enum(PaymentKind), z.literal("")]),
  postalCode: z.string().trim().max(30).optional(),
  status: z.enum(OrderStatus),
});

const createShipmentSchema = z.object({
  fallbackProvider: z.union([z.enum(ShipmentProvider), z.literal("")]),
  internalTrackingNumber: z
    .string()
    .trim()
    .min(5)
    .max(100)
    .transform((value) => value.toUpperCase()),
  kind: z.enum(ShipmentKind),
  provider: z.enum(ShipmentProvider),
  staleAfterDays: z.coerce.number().int().min(1).max(60),
});

const linkShipmentSchema = z.object({
  orderId: z.string().min(1),
  relationship: z.enum(ShipmentRelationship),
  sequence: z.coerce.number().int().min(0).max(100),
  shipmentId: z.string().min(1),
});

const milestoneSchema = z.object({
  evidenceSource: z.enum(TrackingEvidenceSource),
  occurredAt: z.string().trim(),
  reason: z.string().trim().min(3).max(500),
  shipmentId: z.string().min(1),
  status: z.enum(ShipmentStatus),
});

export async function createManualOrder(formData: FormData) {
  await requireOwner();
  const parsed = manualOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid manual order.");
  const productIds = formData
    .getAll("productId")
    .map(String)
    .map((value) => value.trim());
  const colours = formData.getAll("colour").map(String);
  const sizes = formData.getAll("size").map(String);
  const quantities = formData.getAll("quantity").map(String);
  const prices = formData.getAll("unitPrice").map(String);
  const items = productIds.flatMap((productId, index) => {
    if (!productId) return [];
    const quantity = Number.parseInt(quantities[index] ?? "", 10);
    const price = Number.parseFloat((prices[index] ?? "").replace(",", "."));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Invalid manual order quantity.");
    }
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
      throw new Error("Invalid manual order price.");
    }
    return [
      {
        colour: colours[index]?.trim() || null,
        productId,
        quantity,
        size: sizes[index]?.trim() || null,
        unitPriceMinor: Math.round(price * 100),
      },
    ];
  });
  if (!items.length) throw new Error("A manual order needs at least one item.");
  const paymentAmount = parsed.data.paymentAmount
    ? Number.parseFloat(parsed.data.paymentAmount.replace(",", "."))
    : null;
  if (
    paymentAmount !== null &&
    (!Number.isFinite(paymentAmount) || paymentAmount <= 0)
  ) {
    throw new Error("Invalid manual order payment amount.");
  }
  if ((paymentAmount === null) !== (parsed.data.paymentKind === "")) {
    throw new Error("Payment amount and kind must be supplied together.");
  }
  const order = await createManualOrderRecord({
    acquisitionChannel: parsed.data.acquisitionChannel,
    addressLine1: parsed.data.addressLine1 || null,
    addressLine2: parsed.data.addressLine2 || null,
    city:
      parsed.data.city ||
      (parsed.data.deliveryMode === "PERSONAL_HANDOVER" ? "Tallinn" : ""),
    contactMethod: parsed.data.contactMethod,
    contactValue: parsed.data.contactValue,
    countryCode: parsed.data.countryCode,
    currency: parsed.data.currency,
    customerEmail: parsed.data.customerEmail || null,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone || null,
    deliveryMode: parsed.data.deliveryMode,
    items,
    locale: parsed.data.locale,
    notes: parsed.data.notes || null,
    paymentAmountMinor:
      paymentAmount === null ? null : Math.round(paymentAmount * 100),
    paymentKind: parsed.data.paymentKind || null,
    postalCode: parsed.data.postalCode || null,
    status: parsed.data.status,
  });
  try {
    await sendNewOrderNotification(order.id);
  } catch {
    console.error("Manual order notification failed after persistence.");
  }
  redirect(`/admin/orders/${order.id}`);
}

export async function createShipment(formData: FormData) {
  await requireOwner();
  const parsed = createShipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shipment.");
  if (
    parsed.data.fallbackProvider &&
    parsed.data.fallbackProvider === parsed.data.provider
  ) {
    throw new Error("Primary and fallback providers must be different.");
  }
  const prisma = getPrisma();
  const existing = await prisma.shipment.findUnique({
    select: { id: true },
    where: { internalTrackingNumber: parsed.data.internalTrackingNumber },
  });
  if (existing) redirect(`/admin/logistics/${existing.id}`);
  const shipment = await prisma.shipment.create({
    data: {
      fallbackProvider: parsed.data.fallbackProvider || null,
      internalTrackingNumber: parsed.data.internalTrackingNumber,
      kind: parsed.data.kind,
      provider: parsed.data.provider,
      staleAfterDays: parsed.data.staleAfterDays,
    },
  });
  try {
    await registerShipment(shipment.id);
  } catch (error) {
    await prisma.shipment.update({
      data: {
        providerLastError: safeProviderError(error),
        providerSyncStatus: "FAILURE",
      },
      where: { id: shipment.id },
    });
  }
  redirect(`/admin/logistics/${shipment.id}`);
}

export async function linkOrderToShipment(formData: FormData) {
  await requireOwner();
  const parsed = linkShipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shipment link.");
  await getPrisma().orderShipment.upsert({
    create: parsed.data,
    update: {
      relationship: parsed.data.relationship,
      sequence: parsed.data.sequence,
    },
    where: {
      orderId_shipmentId: {
        orderId: parsed.data.orderId,
        shipmentId: parsed.data.shipmentId,
      },
    },
  });
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
}

export async function recordShipmentMilestone(formData: FormData) {
  const parsed = milestoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shipment milestone.");
  if (
    !["OWNER_CONFIRMED", "WAREHOUSE_CONFIRMED", "MANUAL_OVERRIDE"].includes(
      parsed.data.evidenceSource,
    )
  ) {
    throw new Error("Invalid operational evidence source.");
  }
  const changedByAdminId = await adminId();
  const occurredAt = parsed.data.occurredAt
    ? new Date(parsed.data.occurredAt)
    : null;
  if (occurredAt && Number.isNaN(occurredAt.valueOf())) {
    throw new Error("Invalid milestone timestamp.");
  }
  const result = await recordOperationalMilestone({
    adminId: changedByAdminId,
    evidenceSource: parsed.data.evidenceSource as
      "OWNER_CONFIRMED" | "WAREHOUSE_CONFIRMED" | "MANUAL_OVERRIDE",
    occurredAt,
    reason: parsed.data.reason,
    shipmentId: parsed.data.shipmentId,
    status: parsed.data.status,
  });
  if (result.notify) {
    await notifyLinkedOrders(parsed.data.shipmentId, [parsed.data.status]);
  }
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
}

export async function reconcileShipmentAction(formData: FormData) {
  await requireOwner();
  const shipmentId = z.string().min(1).parse(formData.get("shipmentId"));
  const result = await reconcileShipment(shipmentId, {
    forceFallback: formData.get("forceFallback") === "true",
    realTime: formData.get("realTime") === "true",
  });
  const newlyVisible = [
    ...(result.primaryResult?.newlyVisible ?? []),
    ...(result.fallbackResult?.newlyVisible ?? []),
  ];
  if (newlyVisible.length) {
    await notifyLinkedOrders(shipmentId, [...new Set(newlyVisible)]);
  }
  revalidatePath(`/admin/logistics/${shipmentId}`);
}

export async function rotateOrderTrackingLink(formData: FormData) {
  await requireOwner();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  await getPrisma().order.update({
    data: { publicTrackingToken: createTrackingToken() },
    where: { id: orderId },
  });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateShipmentPublicTracking(formData: FormData) {
  await requireOwner();
  const parsed = z
    .object({
      publicCarrierName: z.string().trim().max(120),
      publicTrackingNumber: z.string().trim().max(120),
      shipmentId: z.string().min(1),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    throw new Error("Invalid public local tracking settings.");
  const expose = formData.get("exposePublicTracking") === "true";
  const shipment = await getPrisma().shipment.findUniqueOrThrow({
    select: { kind: true },
    where: { id: parsed.data.shipmentId },
  });
  if (shipment.kind !== "LOCAL_OUTBOUND") {
    throw new Error("Only a local outbound leg can expose carrier details.");
  }
  if (
    expose &&
    (!parsed.data.publicCarrierName || !parsed.data.publicTrackingNumber)
  ) {
    throw new Error("Public carrier name and tracking number are required.");
  }
  await getPrisma().shipment.update({
    data: {
      exposePublicTracking: expose,
      publicCarrierName: parsed.data.publicCarrierName || null,
      publicTrackingNumber: parsed.data.publicTrackingNumber || null,
    },
    where: { id: parsed.data.shipmentId },
  });
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
}

export async function updateShipmentEta(formData: FormData) {
  await requireOwner();
  const parsed = z
    .object({
      estimatedDeliveryAt: z.string().trim(),
      etaNote: z.string().trim().max(500),
      shipmentId: z.string().min(1),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid ETA evidence.");
  const estimatedDeliveryAt = parsed.data.estimatedDeliveryAt
    ? new Date(parsed.data.estimatedDeliveryAt)
    : null;
  if (estimatedDeliveryAt && Number.isNaN(estimatedDeliveryAt.valueOf())) {
    throw new Error("Invalid ETA.");
  }
  if (estimatedDeliveryAt && !parsed.data.etaNote) {
    throw new Error("Owner-confirmed ETA requires an evidence note.");
  }
  await getPrisma().shipment.update({
    data: estimatedDeliveryAt
      ? {
          estimatedDeliveryAt,
          etaConfirmedAt: new Date(),
          etaNote: parsed.data.etaNote,
          etaSource: "OWNER_CONFIRMED",
        }
      : {
          estimatedDeliveryAt: null,
          etaConfirmedAt: null,
          etaNote: null,
          etaSource: null,
        },
    where: { id: parsed.data.shipmentId },
  });
  revalidatePath(`/admin/logistics/${parsed.data.shipmentId}`);
}

export async function updateOrderStatus(formData: FormData) {
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid status update.");
  const changedByAdminId = await adminId();
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      select: {
        confirmedTotalMinor: true,
        currency: true,
        items: { select: { quantity: true, unitPriceMinor: true } },
        status: true,
      },
      where: { id: parsed.data.orderId },
    });
    if (order.status === parsed.data.status) return;
    await tx.order.update({
      data: {
        status: parsed.data.status,
        statusHistory: {
          create: {
            changedByAdminId,
            fromStatus: order.status,
            note: parsed.data.note || null,
            toStatus: parsed.data.status,
          },
        },
      },
      where: { id: parsed.data.orderId },
    });
    if (parsed.data.status === "PAID") {
      const itemTotal = order.items.every(
        (item) => item.unitPriceMinor !== null,
      )
        ? order.items.reduce(
            (sum, item) => sum + item.unitPriceMinor! * item.quantity,
            0,
          )
        : null;
      await tx.orderBusinessEvent.upsert({
        create: {
          amountMinor: order.confirmedTotalMinor ?? itemTotal,
          currency: order.currency,
          eventKey: `paid:${parsed.data.orderId}`,
          eventType: "PAID",
          orderId: parsed.data.orderId,
        },
        update: {},
        where: { eventKey: `paid:${parsed.data.orderId}` },
      });
    } else if (parsed.data.status !== "NEW") {
      await tx.orderBusinessEvent.create({
        data: {
          eventKey: `status:${parsed.data.orderId}:${parsed.data.status}:${crypto.randomUUID()}`,
          eventType: statusBusinessEvent[parsed.data.status],
          orderId: parsed.data.orderId,
        },
      });
    }
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function recordPayment(formData: FormData) {
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid payment.");
  const recordedByAdminId = await adminId();
  await getPrisma().payment.create({
    data: {
      amountMinor: Math.round(parsed.data.amount * 100),
      currency: parsed.data.currency,
      kind: parsed.data.kind,
      orderId: parsed.data.orderId,
      processorFeeMinor:
        typeof parsed.data.processorFee === "number"
          ? Math.round(parsed.data.processorFee * 100)
          : null,
      receivedAt: new Date(),
      recordedByAdminId,
      reference: parsed.data.reference || null,
    },
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
}

export async function recordAdvertisingSpend(formData: FormData) {
  const parsed = spendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid advertising spend entry.");
  const recordedByAdminId = await adminId();
  const prisma = getPrisma();
  if (parsed.data.productId) {
    const productExists = await prisma.product.count({
      where: {
        economicsVersions: { some: {} },
        id: parsed.data.productId,
      },
    });
    if (productExists !== 1) {
      throw new Error("Invalid product for advertising spend.");
    }
  }
  const campaign = parsed.data.campaignName
    ? await prisma.campaign.upsert({
        create: {
          campaignName: parsed.data.campaignName,
          source: parsed.data.source,
        },
        update: {},
        where: {
          source_campaignName: {
            campaignName: parsed.data.campaignName,
            source: parsed.data.source,
          },
        },
      })
    : null;
  await prisma.adSpend.create({
    data: {
      campaignId: campaign?.id,
      campaignName: parsed.data.campaignName || null,
      currency: "EUR",
      date: new Date(`${parsed.data.date}T00:00:00.000Z`),
      importSource: "MANUAL",
      productId: parsed.data.productId || null,
      recordedByAdminId,
      source: parsed.data.source,
      spendMinor: Math.round(parsed.data.amount * 100),
    },
  });
  revalidatePath("/admin/advertising");
}

export async function recordCampaignChange(formData: FormData) {
  const parsed = campaignChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid campaign change entry.");
  const recordedByAdminId = await adminId();
  const prisma = getPrisma();
  const campaign = await prisma.campaign.findFirst({
    select: { id: true },
    where: {
      OR: [
        { campaignName: parsed.data.campaignName },
        { utmCampaign: parsed.data.campaignName },
      ],
    },
  });
  await prisma.campaignChangeLog.create({
    data: {
      campaignId: campaign?.id,
      campaignName: parsed.data.campaignName,
      change: parsed.data.change,
      changedAt: new Date(`${parsed.data.changedAt}T00:00:00.000Z`),
      reason: parsed.data.reason || null,
      recordedByAdminId,
    },
  });
  revalidatePath("/admin/advertising");
}

export async function retryOrderNotification(formData: FormData) {
  await requireOwner();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  await sendNewOrderNotification(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateProductCommercialState(formData: FormData) {
  await requireOwner();
  const parsed = productCommercialSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) throw new Error("Invalid product commercial update.");
  const retailPrice = parsed.data.retailPrice
    ? Number.parseFloat(parsed.data.retailPrice.replace(",", "."))
    : null;
  if (
    retailPrice !== null &&
    (!Number.isFinite(retailPrice) || retailPrice < 0)
  ) {
    throw new Error("Retail price must be a positive number or empty.");
  }
  const currency = parsed.data.currency
    ? parsed.data.currency.toUpperCase()
    : null;
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Currency must be a three-letter ISO code.");
  }

  const prisma = getPrisma();
  const product = await prisma.product.findUniqueOrThrow({
    select: {
      _count: {
        select: {
          images: {
            where: {
              approvedAt: { not: null },
              reviewStatus: "APPROVED",
              role: "PRIMARY",
            },
          },
          translations: true,
        },
      },
      category: { select: { translations: true } },
      publicationStatus: true,
      slug: true,
    },
    where: { id: parsed.data.productId },
  });

  if (parsed.data.publicationStatus === "PUBLISHED") {
    const blockers = [
      !product.slug ? "storefront slug" : null,
      product._count.translations !== 3 ? "three product translations" : null,
      product.category?.translations.length !== 3
        ? "three category translations"
        : null,
      product._count.images === 0 ? "an approved primary image" : null,
      !parsed.data.availabilityType ? "availability" : null,
      retailPrice === null ? "retail price" : null,
      !currency ? "currency" : null,
    ].filter(Boolean);
    if (blockers.length) {
      throw new Error(`Publishing blocked: missing ${blockers.join(", ")}.`);
    }
  }

  await prisma.product.update({
    data: {
      availabilityType: parsed.data.availabilityType || null,
      currency,
      preorderEstimateText: parsed.data.preorderEstimateText || null,
      publicationStatus: parsed.data.publicationStatus,
      publishedAt:
        parsed.data.publicationStatus === "PUBLISHED"
          ? product.publicationStatus === "PUBLISHED"
            ? undefined
            : new Date()
          : null,
      retailPriceMinor:
        retailPrice === null ? null : Math.round(retailPrice * 100),
    },
    where: { id: parsed.data.productId },
  });

  revalidatePath(`/admin/catalog/${parsed.data.productId}`);
  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
}

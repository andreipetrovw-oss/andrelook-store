import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AcquisitionChannel,
  ContactMethod,
  DeliveryMode,
  Locale,
  OrderStatus,
  PaymentKind,
} from "@prisma/client";

import { getPrisma } from "@/lib/db";
import { createTrackingCredentials } from "@/lib/tracking/security";

import { createDisplayNumber } from "./service";

export type ManualOrderItemInput = {
  colour: string | null;
  productId: string;
  quantity: number;
  size: string | null;
  unitPriceMinor: number;
};

export type ManualOrderInput = {
  acquisitionChannel: AcquisitionChannel;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string;
  contactMethod: ContactMethod;
  contactValue: string;
  countryCode: string;
  currency: string;
  customerEmail: string | null;
  customerName: string;
  customerPhone: string | null;
  deliveryMode: DeliveryMode;
  items: ManualOrderItemInput[];
  locale: Locale;
  notes: string | null;
  paymentAmountMinor: number | null;
  paymentKind: PaymentKind | null;
  postalCode: string | null;
  status: OrderStatus;
};

export async function createManualOrder(input: ManualOrderInput) {
  const prisma = getPrisma();
  const requestedAt = new Date();
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    select: {
      availabilityType: true,
      economicsVersions: {
        orderBy: [{ effectiveFrom: "desc" }, { version: "desc" }],
        select: {
          landedCostEstimateMinor: true,
          logisticsEstimateMinor: true,
          paymentRateBps: true,
          purchaseEstimateMinor: true,
          sourceType: true,
          version: true,
        },
        take: 1,
        where: { effectiveFrom: { lte: requestedAt } },
      },
      id: true,
      internalCode: true,
      privateData: { select: { landedCostMinor: true } },
      slug: true,
      translations: {
        select: { name: true },
        take: 1,
        where: { locale: input.locale },
      },
    },
    where: { id: { in: productIds } },
  });
  if (products.length !== productIds.length) {
    throw new Error("One or more manual-order products no longer exist.");
  }
  const productById = new Map(products.map((product) => [product.id, product]));
  const confirmedTotalMinor = input.items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0,
  );
  const trackingCredentials = createTrackingCredentials();
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        email: input.customerEmail,
        name: input.customerName,
        phone: input.customerPhone,
        preferredContactMethod: input.contactMethod,
        preferredContactValue: input.contactValue,
        preferredLocale: input.locale,
      },
    });
    const order = await tx.order.create({
      data: {
        acquisitionChannel: input.acquisitionChannel,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        confirmedTotalMinor,
        consentAt: requestedAt,
        consentVersion: "owner-entered-direct-sale-v1",
        countryCode: input.countryCode,
        currency: input.currency,
        customerId: customer.id,
        deliveryMode: input.deliveryMode,
        displayNumber: createDisplayNumber(),
        fulfilmentMethod:
          input.deliveryMode === "PERSONAL_HANDOVER"
            ? "PERSONAL_HANDOVER"
            : "DELIVERY",
        internalNotes: input.notes,
        publicTrackingToken: trackingCredentials.publicTrackingToken,
        trackingAccessCodeEncrypted:
          trackingCredentials.trackingAccessCodeEncrypted,
        trackingAccessCodeHash: trackingCredentials.trackingAccessCodeHash,
        trackingCredentialsRotatedAt:
          trackingCredentials.trackingCredentialsRotatedAt,
        requestKey: `manual:${randomUUID()}`,
        requestedLocale: input.locale,
        status: input.status,
        items: {
          create: input.items.map((item) => {
            const product = productById.get(item.productId)!;
            const economics = product.economicsVersions[0] ?? null;
            return {
              availabilityTypeSnapshot: product.availabilityType,
              colorSnapshot: item.colour,
              economicsSourceTypeSnapshot: economics?.sourceType,
              economicsVersionSnapshot: economics?.version,
              paymentRateBpsSnapshot: economics?.paymentRateBps,
              productId: product.id,
              productInternalCodeSnapshot: product.internalCode,
              productNameSnapshot:
                product.translations[0]?.name ?? product.internalCode,
              productSlugSnapshot: product.slug,
              quantity: item.quantity,
              sizeSnapshot: item.size,
              unitLandedCostMinorSnapshot:
                economics?.landedCostEstimateMinor ??
                product.privateData?.landedCostMinor,
              unitLogisticsCostMinorSnapshot: economics?.logisticsEstimateMinor,
              unitPriceMinor: item.unitPriceMinor,
              unitPurchaseCostMinorSnapshot: economics?.purchaseEstimateMinor,
            };
          }),
        },
        businessEvents: {
          create: {
            amountMinor: confirmedTotalMinor,
            currency: input.currency,
            eventKey: `lead:manual:${randomUUID()}`,
            eventType: "LEAD_CREATED",
          },
        },
        statusHistory: { create: { toStatus: input.status } },
      },
      select: { displayNumber: true, id: true },
    });
    if (input.paymentAmountMinor && input.paymentKind) {
      await tx.payment.create({
        data: {
          amountMinor: input.paymentAmountMinor,
          currency: input.currency,
          kind: input.paymentKind,
          orderId: order.id,
          receivedAt: new Date(),
          reference: "Owner-entered manual order payment",
        },
      });
    }
    if (input.status === "PAID") {
      await tx.orderBusinessEvent.create({
        data: {
          amountMinor: confirmedTotalMinor,
          currency: input.currency,
          eventKey: `paid:${order.id}`,
          eventType: "PAID",
          orderId: order.id,
        },
      });
    }
    return order;
  });
}

import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";

import { databaseLocale } from "@/config/locales";
import {
  orderAttributionForStorage,
  parseOrderAttribution,
  safeContextualAttribution,
} from "@/lib/attribution/server";
import type { AttributionTouchData } from "@/lib/attribution/types";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

import { SIZE_HELP_VALUE } from "./request-constants";
import type { RequestOrderInput } from "./request-schema";
import { assessRequestEligibility } from "./eligibility";

export class RequestRejectedError extends Error {
  constructor(
    public readonly reason: "not-found" | "unavailable" | "selection",
  ) {
    super("This product request cannot be accepted.");
    this.name = "RequestRejectedError";
  }
}

function chartSizes(chartData: Prisma.JsonValue | null | undefined): string[] {
  if (!chartData || Array.isArray(chartData) || typeof chartData !== "object") {
    return [];
  }
  const sizes = (chartData as { sizes?: unknown }).sizes;
  return Array.isArray(sizes)
    ? sizes.filter((value): value is string => typeof value === "string")
    : [];
}

function displayNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `AL-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export type RequestContext = {
  initialReferrer: string | null;
  landingPath: string | null;
  siteHost?: string | null;
};

function acquisitionChannel(source: AttributionTouchData["source"]) {
  if (source === "META_ADS" || source === "GOOGLE_ADS") {
    return "ADVERTISING" as const;
  }
  if (source === "INSTAGRAM_ORGANIC") return "INSTAGRAM" as const;
  if (source === "MARKETPLACE") return "MARKETPLACE" as const;
  if (source === "DIRECT") return "DIRECT" as const;
  if (source === "OTHER" || source === "UNKNOWN") return "OTHER" as const;
  return "REFERRAL" as const;
}

function touchForCreate(
  touch: AttributionTouchData,
  touchType: "FIRST" | "LAST",
) {
  return {
    ...touch,
    locale: databaseLocale[touch.locale],
    occurredAt: new Date(touch.occurredAt),
    touchType,
  };
}

export async function createOrderRequest(
  input: RequestOrderInput,
  context: RequestContext,
): Promise<{ duplicate: boolean; orderId: string; reference: string }> {
  const prisma = getPrisma();
  const reviewMode = getServerConfig().storefrontReviewMode;
  const product = await prisma.product.findFirst({
    select: {
      availabilityType: true,
      colors: {
        select: { code: true },
        where: { reviewStatus: "APPROVED" },
      },
      currency: true,
      id: true,
      internalCode: true,
      privateData: { select: { landedCostMinor: true } },
      publicationStatus: true,
      retailPriceMinor: true,
      sizeChart: {
        select: { chartData: true, isPublished: true, reviewStatus: true },
      },
      slug: true,
      translations: {
        select: { locale: true, name: true },
        where: { locale: databaseLocale[input.locale] },
      },
      updatedAt: true,
    },
    where: {
      id: input.productId,
      publicationStatus: reviewMode
        ? { in: ["READY", "PUBLISHED"] }
        : "PUBLISHED",
    },
  });

  const translation = product?.translations[0];
  if (!product || !translation) throw new RequestRejectedError("not-found");

  const availableSizes =
    product.sizeChart?.reviewStatus === "APPROVED" &&
    (product.sizeChart.isPublished || reviewMode)
      ? chartSizes(product.sizeChart.chartData)
      : [];
  const rejection = assessRequestEligibility(
    {
      availability: product.availabilityType,
      colours: product.colors.map((colour) => colour.code),
      currency: product.currency,
      publicationStatus: product.publicationStatus,
      retailPriceMinor: product.retailPriceMinor,
      sizes: availableSizes,
      version: product.updatedAt.toISOString(),
    },
    {
      ...input,
      sizeHelpRequested: input.size === SIZE_HELP_VALUE,
    },
    reviewMode,
  );
  if (rejection) throw new RequestRejectedError(rejection);

  const socialHandle = input.socialHandle ?? null;
  const contactValue = {
    EMAIL: input.email,
    INSTAGRAM: socialHandle,
    PHONE: input.phone,
    TELEGRAM: socialHandle,
  }[input.contactMethod];
  if (!contactValue) throw new RequestRejectedError("selection");
  const contactFields = {
    email: input.email ?? null,
    firstName: input.firstName,
    instagramHandle: input.contactMethod === "INSTAGRAM" ? socialHandle : null,
    lastName: input.lastName ?? null,
    phone: input.phone ?? null,
    telegramHandle: input.contactMethod === "TELEGRAM" ? socialHandle : null,
  };
  const attribution = orderAttributionForStorage(
    parseOrderAttribution(input.orderAttribution),
    safeContextualAttribution({
      landingPath: context.landingPath,
      locale: input.locale,
      referrer: context.initialReferrer,
      siteHost: context.siteHost ?? null,
    }),
  );
  const lastTouch = attribution.lastTouch ?? attribution.firstTouch;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          ...contactFields,
          name: [input.firstName, input.lastName].filter(Boolean).join(" "),
          preferredContactMethod: input.contactMethod,
          preferredContactValue: contactValue,
          preferredLocale: databaseLocale[input.preferredLocale],
        },
      });
      const created = await tx.order.create({
        data: {
          acquisitionChannel: acquisitionChannel(lastTouch.source),
          addressLine1:
            input.fulfilmentMethod === "DELIVERY"
              ? (input.addressLine1 ?? null)
              : null,
          addressLine2:
            input.fulfilmentMethod === "DELIVERY"
              ? (input.addressLine2 ?? null)
              : null,
          city:
            input.fulfilmentMethod === "PERSONAL_HANDOVER"
              ? "Tallinn"
              : input.city,
          consentAt: new Date(),
          consentVersion: "commercial-preorder-v1",
          countryCode:
            input.fulfilmentMethod === "PERSONAL_HANDOVER"
              ? "EE"
              : input.countryCode,
          currency: product.currency,
          customerId: customer.id,
          displayNumber: displayNumber(),
          fulfilmentMethod: input.fulfilmentMethod,
          initialReferrer: attribution.firstTouch.referrer,
          internalNotes: input.comment ?? null,
          landingPath: attribution.firstTouch.landingPage,
          paymentPreference: input.paymentPreference,
          postalCode:
            input.fulfilmentMethod === "DELIVERY"
              ? (input.postalCode ?? null)
              : null,
          requestKey: input.requestKey,
          requestedLocale: databaseLocale[input.preferredLocale],
          items: {
            create: {
              availabilityTypeSnapshot: product.availabilityType,
              colorSnapshot: input.colour || null,
              measurementsNote: input.measurements ?? null,
              productId: product.id,
              productInternalCodeSnapshot: product.internalCode,
              productNameSnapshot: translation.name,
              productSlugSnapshot: product.slug,
              quantity: input.quantity,
              sizeHelpRequested: input.size === SIZE_HELP_VALUE,
              sizeSnapshot: input.size === SIZE_HELP_VALUE ? null : input.size,
              unitLandedCostMinorSnapshot: product.privateData?.landedCostMinor,
              unitPriceMinor: product.retailPriceMinor,
            },
          },
          attribution: {
            create: {
              analyticsConsent: attribution.analyticsConsent,
              attributionWindowDays: 30,
              consentVersion: attribution.consentVersion,
              marketingConsent: attribution.marketingConsent,
              touches: {
                create: [
                  touchForCreate(attribution.firstTouch, "FIRST"),
                  ...(attribution.lastTouch
                    ? [touchForCreate(attribution.lastTouch, "LAST")]
                    : []),
                ],
              },
            },
          },
          businessEvents: {
            create: {
              currency: product.currency,
              eventKey: `lead:${input.requestKey}`,
              eventType: "LEAD_CREATED",
            },
          },
          statusHistory: { create: { toStatus: "NEW" } },
          utmCampaign: lastTouch.utmCampaign,
          utmContent: lastTouch.utmContent,
          utmMedium: lastTouch.utmMedium,
          utmSource: lastTouch.utmSource,
          utmTerm: lastTouch.utmTerm,
        },
        select: { displayNumber: true, id: true },
      });
      return created;
    });
    return {
      duplicate: false,
      orderId: order.id,
      reference: order.displayNumber,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.order.findUnique({
        select: { displayNumber: true, id: true },
        where: { requestKey: input.requestKey },
      });
      if (existing)
        return {
          duplicate: true,
          orderId: existing.id,
          reference: existing.displayNumber,
        };
    }
    throw error;
  }
}

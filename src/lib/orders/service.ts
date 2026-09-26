import "server-only";

import { randomBytes } from "node:crypto";

import { Prisma } from "@prisma/client";

import { databaseLocale } from "@/config/locales";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

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
};

export async function createOrderRequest(
  input: RequestOrderInput,
  context: RequestContext,
): Promise<{ duplicate: boolean; reference: string }> {
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
    input,
    reviewMode,
  );
  if (rejection) throw new RequestRejectedError(rejection);

  const contactFields = {
    email: input.contactMethod === "EMAIL" ? input.contactValue : null,
    instagramHandle:
      input.contactMethod === "INSTAGRAM" ? input.contactValue : null,
    phone: null,
    telegramHandle:
      input.contactMethod === "TELEGRAM" ? input.contactValue : null,
  };

  try {
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          ...contactFields,
          name: input.name,
          preferredContactMethod: input.contactMethod,
          preferredContactValue: input.contactValue,
          preferredLocale: databaseLocale[input.locale],
        },
      });
      const created = await tx.order.create({
        data: {
          consentAt: new Date(),
          consentVersion: "assisted-request-v1",
          currency: product.currency,
          customerId: customer.id,
          displayNumber: displayNumber(),
          initialReferrer: context.initialReferrer,
          landingPath: context.landingPath,
          requestKey: input.requestKey,
          requestedLocale: databaseLocale[input.locale],
          items: {
            create: {
              availabilityTypeSnapshot: product.availabilityType,
              colorSnapshot: input.colour || null,
              productId: product.id,
              productInternalCodeSnapshot: product.internalCode,
              productNameSnapshot: translation.name,
              productSlugSnapshot: product.slug,
              quantity: 1,
              sizeSnapshot: input.size || null,
              unitLandedCostMinorSnapshot: product.privateData?.landedCostMinor,
              unitPriceMinor: product.retailPriceMinor,
            },
          },
          statusHistory: { create: { toStatus: "NEW" } },
        },
        select: { displayNumber: true },
      });
      return created;
    });
    return { duplicate: false, reference: order.displayNumber };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.order.findUnique({
        select: { displayNumber: true },
        where: { requestKey: input.requestKey },
      });
      if (existing)
        return { duplicate: true, reference: existing.displayNumber };
    }
    throw error;
  }
}

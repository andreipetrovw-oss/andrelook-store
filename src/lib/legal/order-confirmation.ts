import "server-only";

import { Resend } from "resend";

import type { LegalAcceptanceSource } from "@prisma/client";

import type { Locale } from "@/config/locales";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

import { sizeGuideEvidence } from "./acceptance";
import { LEGAL_POLICY_VERSION, RETURNS_VERSION, TERMS_VERSION } from "./policy";

function html(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "'": "&#39;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
    };
    return entities[character] ?? character;
  });
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/re_[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 300);
}

const emailCopy = {
  EN: {
    deliveryEstimate: "Estimated delivery",
    intro:
      "This confirms the pre-order details and the terms agreed with Andrelook. Keep this email for your records.",
    order: "Order",
    policy: "Policy version",
    subject: "Andrelook pre-order confirmation",
  },
  ET: {
    deliveryEstimate: "Eeldatav tarneaeg",
    intro:
      "See kiri kinnitab Andrelookiga kokku lepitud eeltellimuse andmeid ja tingimusi. Hoia kiri enda jaoks alles.",
    order: "Tellimus",
    policy: "Tingimuste versioon",
    subject: "Andrelooki eeltellimuse kinnitus",
  },
  RU: {
    deliveryEstimate: "Ориентировочный срок доставки",
    intro:
      "Это письмо подтверждает согласованные с Andrelook данные и условия предзаказа. Сохраните письмо.",
    order: "Заказ",
    policy: "Версия условий",
    subject: "Подтверждение предзаказа Andrelook",
  },
} as const;

export async function documentPreorderConfirmation(input: {
  acceptedAt: Date;
  adminId: string;
  evidenceNote: string;
  orderId: string;
  sendEmail: boolean;
  source: Extract<
    LegalAcceptanceSource,
    "CUSTOMER_MESSAGE" | "OWNER_DOCUMENTED"
  >;
}) {
  const prisma = getPrisma();
  const order = await prisma.order.findUniqueOrThrow({
    include: {
      customer: { select: { email: true, name: true } },
      items: {
        include: {
          product: {
            select: {
              sizeChart: {
                select: {
                  chartData: true,
                  isPublished: true,
                  reviewStatus: true,
                  units: true,
                },
              },
            },
          },
        },
      },
    },
    where: { id: input.orderId },
  });
  if (!order.items.length) throw new Error("Order has no items to confirm.");
  if (input.sendEmail && !order.customer.email) {
    throw new Error("Customer email is required for email confirmation.");
  }

  const acceptanceIds = await prisma.$transaction(async (tx) => {
    const ids: string[] = [];
    for (const item of order.items) {
      const chart =
        item.product?.sizeChart?.reviewStatus === "APPROVED" &&
        item.product.sizeChart.isPublished
          ? item.product.sizeChart
          : null;
      const guide = sizeGuideEvidence(chart?.chartData, chart?.units);
      const acceptance = await tx.orderLegalAcceptance.create({
        data: {
          acceptedAt: input.acceptedAt,
          availabilitySnapshot: item.availabilityTypeSnapshot,
          colorSnapshot: item.colorSnapshot,
          confirmationRecipient: input.sendEmail ? order.customer.email : null,
          confirmationStatus: input.sendEmail ? "PENDING" : "SKIPPED",
          createdByAdminId: input.adminId,
          currencySnapshot: order.currency,
          deliveryEstimateSnapshot:
            order.etaText ?? order.etaDate?.toISOString() ?? null,
          evidenceNote: input.evidenceNote,
          kind: "PREORDER_CONFIRMED",
          orderId: order.id,
          policyVersion: LEGAL_POLICY_VERSION,
          productInternalCodeSnapshot: item.productInternalCodeSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          quantitySnapshot: item.quantity,
          returnsVersion: RETURNS_VERSION,
          sizeGuideAvailable: guide.sizeGuideAvailable,
          sizeGuideSnapshot: guide.sizeGuideSnapshot,
          sizeGuideVersion: guide.sizeGuideVersion,
          sizeHelpRequested: item.sizeHelpRequested,
          sizeSnapshot: item.sizeSnapshot,
          source: input.source,
          termsVersion: TERMS_VERSION,
          unitPriceMinorSnapshot: item.unitPriceMinor,
        },
        select: { id: true },
      });
      ids.push(acceptance.id);
    }
    return ids;
  });

  if (!input.sendEmail || !order.customer.email) return acceptanceIds;

  const config = getServerConfig();
  if (!config.resendApiKey || !config.orderNotificationFrom) {
    await prisma.orderLegalAcceptance.updateMany({
      data: {
        confirmationLastError:
          "Electronic confirmation provider is not configured.",
        confirmationStatus: "FAILED",
      },
      where: { id: { in: acceptanceIds } },
    });
    return acceptanceIds;
  }

  const copy = emailCopy[order.requestedLocale];
  const locale = order.requestedLocale.toLowerCase() as Locale;
  const items = order.items.map((item) => {
    const price =
      item.unitPriceMinor === null || !order.currency
        ? "—"
        : `${(item.unitPriceMinor / 100).toFixed(2)} ${order.currency}`;
    return `${item.productNameSnapshot} · ${item.colorSnapshot ?? "—"} · ${item.sizeSnapshot ?? "—"} · ${item.quantity} × ${price}`;
  });
  const links = [
    new URL(`/${locale}/terms`, config.siteUrl).toString(),
    new URL(`/${locale}/returns-exchanges`, config.siteUrl).toString(),
    new URL(`/${locale}/withdrawal`, config.siteUrl).toString(),
  ];
  const text = [
    copy.subject,
    "",
    copy.intro,
    "",
    `${copy.order}: ${order.displayNumber}`,
    ...items,
    `${copy.deliveryEstimate}: ${order.etaText ?? order.etaDate?.toISOString() ?? "—"}`,
    `${copy.policy}: ${LEGAL_POLICY_VERSION}`,
    "",
    ...links,
  ].join("\n");
  const markup = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717"><h1 style="font-size:22px">${html(copy.subject)}</h1><p>${html(copy.intro)}</p><p><strong>${html(copy.order)}: ${html(order.displayNumber)}</strong></p><ul>${items.map((item) => `<li>${html(item)}</li>`).join("")}</ul><p>${html(copy.deliveryEstimate)}: ${html(order.etaText ?? order.etaDate?.toISOString() ?? "—")}</p><p>${html(copy.policy)}: ${html(LEGAL_POLICY_VERSION)}</p><p>${links.map((link) => `<a href="${html(link)}">${html(link)}</a>`).join("<br>")}</p></body></html>`;

  try {
    const resend = new Resend(config.resendApiKey);
    const { data, error } = await resend.emails.send(
      {
        from: config.orderNotificationFrom,
        html: markup,
        subject: `${copy.subject} ${order.displayNumber}`,
        text,
        to: [order.customer.email],
      },
      { idempotencyKey: `andrelook-order-confirmation-${acceptanceIds[0]}` },
    );
    if (error) throw new Error(error.message);
    await prisma.orderLegalAcceptance.updateMany({
      data: {
        confirmationLastError: null,
        confirmationProviderId: data?.id ?? null,
        confirmationSentAt: new Date(),
        confirmationStatus: "SENT",
      },
      where: { id: { in: acceptanceIds } },
    });
  } catch (error) {
    await prisma.orderLegalAcceptance.updateMany({
      data: {
        confirmationLastError: safeError(error),
        confirmationStatus: "FAILED",
      },
      where: { id: { in: acceptanceIds } },
    });
  }
  return acceptanceIds;
}

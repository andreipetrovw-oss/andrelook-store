import "server-only";

import { Resend } from "resend";

import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

function html(value: string | null | undefined) {
  return (value ?? "—").replace(/[&<>"']/g, (character) => {
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
  return message.replace(/re_[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 500);
}

export async function sendNewOrderNotification(orderId: string) {
  const prisma = getPrisma();
  const config = getServerConfig();
  const order = await prisma.order.findUnique({
    select: {
      city: true,
      countryCode: true,
      addressLine1: true,
      addressLine2: true,
      acquisitionChannel: true,
      currency: true,
      customer: {
        select: {
          email: true,
          instagramHandle: true,
          name: true,
          phone: true,
          preferredContactMethod: true,
          preferredContactValue: true,
          telegramHandle: true,
        },
      },
      displayNumber: true,
      fulfilmentMethod: true,
      id: true,
      items: {
        select: {
          productNameSnapshot: true,
          quantity: true,
          colorSnapshot: true,
          sizeHelpRequested: true,
          sizeSnapshot: true,
          unitPriceMinor: true,
        },
      },
      initialReferrer: true,
      landingPath: true,
      postalCode: true,
      requestedLocale: true,
      paymentPreference: true,
      utmCampaign: true,
      utmContent: true,
      utmMedium: true,
      utmSource: true,
      utmTerm: true,
    },
    where: { id: orderId },
  });
  if (!order) throw new Error("Order notification target not found.");

  await prisma.orderNotification.upsert({
    create: {
      attempts: 1,
      orderId,
      provider: "resend",
      recipient: config.orderNotificationTo,
      status: "PENDING",
    },
    update: {
      attempts: { increment: 1 },
      lastError: null,
      status: "PENDING",
    },
    where: { orderId },
  });

  if (!config.resendApiKey || !config.orderNotificationFrom) {
    return prisma.orderNotification.update({
      data: {
        lastError: "Resend notification environment is not configured.",
        status: "SKIPPED",
      },
      where: { orderId },
    });
  }

  const item = order.items[0];
  const size = item?.sizeHelpRequested
    ? "Sizing help requested"
    : (item?.sizeSnapshot ?? "—");
  const crmUrl = new URL(
    `/admin/orders/${order.id}`,
    config.crmUrl ?? config.siteUrl,
  ).toString();
  const price =
    item?.unitPriceMinor === null ||
    item?.unitPriceMinor === undefined ||
    !order.currency
      ? "—"
      : `${(item.unitPriceMinor / 100).toFixed(2)} ${order.currency}`;
  const address =
    [
      order.addressLine1,
      order.addressLine2,
      order.postalCode,
      order.city,
      order.countryCode,
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const attribution = [
    order.acquisitionChannel,
    order.utmSource ? `source=${order.utmSource}` : null,
    order.utmMedium ? `medium=${order.utmMedium}` : null,
    order.utmCampaign ? `campaign=${order.utmCampaign}` : null,
    order.utmContent ? `content=${order.utmContent}` : null,
    order.utmTerm ? `term=${order.utmTerm}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const rows = [
    ["Reference", order.displayNumber],
    ["Customer", order.customer.name],
    ["Product", item?.productNameSnapshot ?? "—"],
    ["Size", size],
    ["Colour", item?.colorSnapshot ?? "—"],
    ["Quantity", String(item?.quantity ?? 1)],
    ["Unit price", price],
    ["Country / city", `${order.countryCode ?? "—"} / ${order.city ?? "—"}`],
    ["Address", address],
    ["Fulfilment", order.fulfilmentMethod ?? "—"],
    ["Payment preference", order.paymentPreference ?? "—"],
    ["Preferred contact", order.customer.preferredContactMethod],
    ["Contact", order.customer.preferredContactValue],
    ["Phone", order.customer.phone ?? "—"],
    ["Email", order.customer.email ?? "—"],
    [
      "Social",
      order.customer.telegramHandle ?? order.customer.instagramHandle ?? "—",
    ],
    ["Language", order.requestedLocale],
    ["Source / attribution", attribution],
    ["Landing path", order.landingPath ?? "—"],
    ["Initial referrer", order.initialReferrer ?? "—"],
  ];
  const text = [
    `New Andrelook order request ${order.displayNumber}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Open CRM: ${crmUrl}`,
  ].join("\n");
  const markup = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717"><h1 style="font-size:22px">New Andrelook order request</h1><p><strong>${html(order.displayNumber)}</strong></p><table cellpadding="7" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px">${rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="border-bottom:1px solid #ddd;width:38%">${html(label)}</th><td style="border-bottom:1px solid #ddd">${html(value)}</td></tr>`,
    )
    .join(
      "",
    )}</table><p style="margin-top:24px"><a href="${html(crmUrl)}">Open this order in Andrelook CRM</a></p></body></html>`;

  try {
    const resend = new Resend(config.resendApiKey);
    const { data, error } = await resend.emails.send(
      {
        from: config.orderNotificationFrom,
        html: markup,
        subject: `[Andrelook] New order ${order.displayNumber}`,
        text,
        to: [config.orderNotificationTo],
        ...(order.customer.email ? { replyTo: order.customer.email } : {}),
      },
      { idempotencyKey: `andrelook-new-order-${order.displayNumber}` },
    );
    if (error) throw new Error(error.message);
    return prisma.orderNotification.update({
      data: {
        lastError: null,
        providerMessageId: data?.id ?? null,
        sentAt: new Date(),
        status: "SENT",
      },
      where: { orderId },
    });
  } catch (error) {
    return prisma.orderNotification.update({
      data: { lastError: safeError(error), status: "FAILED" },
      where: { orderId },
    });
  }
}

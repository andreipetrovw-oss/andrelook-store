import "server-only";

import type { ShipmentStatus } from "@prisma/client";
import { Resend } from "resend";

import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";

import { isMeaningfulMilestone } from "./normalization";
import { publicStatusForShipment, publicStatusLabel } from "./public";
import { createTrackingToken, safeProviderError } from "./security";

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

export async function sendTrackingMilestoneNotification(input: {
  orderId: string;
  shipmentId: string;
  status: ShipmentStatus;
}) {
  if (!isMeaningfulMilestone(input.status)) return { status: "not-required" };
  const prisma = getPrisma();
  const config = getServerConfig();
  const order = await prisma.order.findUnique({
    select: {
      customer: { select: { email: true } },
      displayNumber: true,
      publicTrackingToken: true,
      requestedLocale: true,
    },
    where: { id: input.orderId },
  });
  if (!order?.customer.email) return { status: "no-email" };
  const token = order.publicTrackingToken ?? createTrackingToken();
  if (!order.publicTrackingToken) {
    await prisma.order.update({
      data: { publicTrackingToken: token },
      where: { id: input.orderId },
    });
  }
  const notification = await prisma.trackingMilestoneNotification.upsert({
    create: {
      attempts: 1,
      milestone: input.status,
      orderId: input.orderId,
      recipient: order.customer.email,
      shipmentId: input.shipmentId,
    },
    update: {},
    where: {
      orderId_shipmentId_milestone: {
        milestone: input.status,
        orderId: input.orderId,
        shipmentId: input.shipmentId,
      },
    },
  });
  if (notification.status === "SENT") return { status: "duplicate" };
  if (
    !config.resendApiKey ||
    !config.orderNotificationFrom ||
    config.siteUrl.hostname !== "www.andrelook.store"
  ) {
    await prisma.trackingMilestoneNotification.update({
      data: {
        lastError: "Customer milestone email is disabled outside production.",
        status: "SKIPPED",
      },
      where: { id: notification.id },
    });
    return { status: "disabled" };
  }
  const publicStatus = publicStatusForShipment(input.status);
  if (!publicStatus) return { status: "not-required" };
  const label = publicStatusLabel(order.requestedLocale, publicStatus);
  const trackingUrl = new URL(`/track/${token}`, config.siteUrl).toString();
  try {
    const resend = new Resend(config.resendApiKey);
    const { data, error } = await resend.emails.send(
      {
        from: config.orderNotificationFrom,
        html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717"><h1 style="font-size:22px">Andrelook order update</h1><p><strong>${html(order.displayNumber)}</strong></p><p>${html(label)}</p><p><a href="${html(trackingUrl)}">View your Andrelook order</a></p></body></html>`,
        subject: `[Andrelook] ${label} · ${order.displayNumber}`,
        text: `Andrelook order ${order.displayNumber}\n\n${label}\n\nTrack your order: ${trackingUrl}`,
        to: [order.customer.email],
      },
      {
        idempotencyKey: `andrelook-tracking-${input.orderId}-${input.shipmentId}-${input.status}`,
      },
    );
    if (error) throw new Error(error.message);
    await prisma.trackingMilestoneNotification.update({
      data: {
        lastError: null,
        providerMessageId: data?.id ?? null,
        sentAt: new Date(),
        status: "SENT",
      },
      where: { id: notification.id },
    });
    return { status: "sent" };
  } catch (error) {
    await prisma.trackingMilestoneNotification.update({
      data: {
        attempts: { increment: 1 },
        lastError: safeProviderError(error),
        status: "FAILED",
      },
      where: { id: notification.id },
    });
    return { status: "failed" };
  }
}

export async function notifyLinkedOrders(
  shipmentId: string,
  statuses: ShipmentStatus[],
) {
  const orders = await getPrisma().orderShipment.findMany({
    select: { orderId: true },
    where: { customerVisible: true, shipmentId },
  });
  for (const status of statuses) {
    for (const order of orders) {
      await sendTrackingMilestoneNotification({
        orderId: order.orderId,
        shipmentId,
        status,
      });
    }
  }
}

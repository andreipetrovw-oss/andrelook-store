import "server-only";

import { createHash } from "node:crypto";

import { getPrisma } from "@/lib/db";
import { isInternalTestOrder } from "@/lib/admin/test-orders";

const approvedDatasetId = "3334309000107146";
const approvedProductionProjectId = "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH";
const approvedProductionHosts = new Set([
  "andrelook.store",
  "www.andrelook.store",
]);
const graphApiVersion = "v26.0";

type MetaCapiRuntime = {
  accessToken?: string;
  datasetId?: string;
  projectId?: string;
  vercelEnvironment?: string;
};

export type MetaCapiResult =
  | { status: "sent" }
  | {
      reason:
        | "consent"
        | "environment"
        | "invalid-source"
        | "not-found"
        | "test-order";
      status: "skipped";
    }
  | { reason: "provider" | "transport"; status: "failed" };

function normalizedHost(value: string) {
  return value.trim().toLowerCase().split(":")[0] ?? "";
}

function runtimeDefaults(): Required<MetaCapiRuntime> {
  return {
    accessToken: process.env.META_CAPI_ACCESS_TOKEN?.trim() ?? "",
    datasetId: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "",
    projectId: process.env.VERCEL_PROJECT_ID?.trim() ?? "",
    vercelEnvironment: process.env.VERCEL_ENV?.trim() ?? "",
  };
}

export function metaCapiAllowedForRuntime(
  host: string,
  marketingConsent: boolean,
  runtime: MetaCapiRuntime = runtimeDefaults(),
) {
  const resolved = { ...runtimeDefaults(), ...runtime };
  return Boolean(
    marketingConsent &&
    resolved.accessToken &&
    resolved.datasetId === approvedDatasetId &&
    resolved.projectId === approvedProductionProjectId &&
    resolved.vercelEnvironment === "production" &&
    approvedProductionHosts.has(normalizedHost(host)),
  );
}

function approvedEventSource(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !approvedProductionHosts.has(url.hostname.toLowerCase()) ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/sign-in")
    ) {
      return null;
    }
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export async function sendMetaLeadForOrder(
  orderId: string,
  eventSourceUrl: string | null,
  runtime: MetaCapiRuntime = runtimeDefaults(),
): Promise<MetaCapiResult> {
  const source = approvedEventSource(eventSourceUrl);
  if (!source) return { reason: "invalid-source", status: "skipped" };

  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    select: {
      attribution: { select: { marketingConsent: true } },
      createdAt: true,
      currency: true,
      displayNumber: true,
      items: {
        select: {
          productId: true,
          quantity: true,
          unitPriceMinor: true,
        },
      },
      requestKey: true,
    },
    where: { id: orderId },
  });
  if (!order) return { reason: "not-found", status: "skipped" };
  if (isInternalTestOrder(order.displayNumber)) {
    return { reason: "test-order", status: "skipped" };
  }
  if (!order.attribution?.marketingConsent) {
    return { reason: "consent", status: "skipped" };
  }

  const resolved = { ...runtimeDefaults(), ...runtime };
  if (
    !metaCapiAllowedForRuntime(
      source.hostname,
      order.attribution.marketingConsent,
      resolved,
    )
  ) {
    return { reason: "environment", status: "skipped" };
  }

  const contentIds = [
    ...new Set(order.items.map((item) => item.productId).filter(Boolean)),
  ];
  const hasCompletePrice =
    order.currency === "EUR" &&
    order.items.length > 0 &&
    order.items.every((item) => item.unitPriceMinor !== null);
  const value = hasCompletePrice
    ? order.items.reduce(
        (total, item) => total + (item.unitPriceMinor ?? 0) * item.quantity,
        0,
      ) / 100
    : null;
  const customData = {
    content_ids: contentIds,
    ...(value !== null ? { currency: "EUR", value } : {}),
  };
  const externalId = createHash("sha256")
    .update(order.requestKey.trim().toLowerCase())
    .digest("hex");
  const body = {
    data: [
      {
        action_source: "website",
        custom_data: customData,
        event_id: order.requestKey,
        event_name: "Lead",
        event_source_url: source.toString(),
        event_time: Math.floor(order.createdAt.getTime() / 1000),
        user_data: { external_id: [externalId] },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/${approvedDatasetId}/events`,
      {
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${resolved.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!response.ok) return { reason: "provider", status: "failed" };
    return { status: "sent" };
  } catch {
    return { reason: "transport", status: "failed" };
  }
}

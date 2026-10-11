import "server-only";

import { z } from "zod";

import { getPrisma } from "@/lib/db";

const approvedProductionProjectId = "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH";
const approvedHosts = new Set(["andrelook.store", "www.andrelook.store"]);

const eventSchema = z.object({
  adName: z.string().max(200).nullable(),
  adSetName: z.string().max(200).nullable(),
  campaignName: z.string().max(200).nullable(),
  contentLabel: z.string().max(200).nullable(),
  eventId: z.string().uuid(),
  eventName: z.enum([
    "PAGE_VIEW",
    "VIEW_ITEM_LIST",
    "SELECT_ITEM",
    "VIEW_ITEM",
    "PREORDER_OPEN",
    "PREORDER_SUBMIT",
  ]),
  landingPage: z.string().max(500).nullable(),
  locale: z.enum(["RU", "ET", "EN"]),
  pagePath: z.string().startsWith("/").max(500),
  productId: z.string().max(100).nullable(),
  sessionId: z.string().uuid(),
  source: z.enum([
    "UNKNOWN",
    "META_ADS",
    "GOOGLE_ADS",
    "INSTAGRAM_ORGANIC",
    "FACEBOOK_ORGANIC",
    "TELEGRAM",
    "GOOGLE_ORGANIC",
    "BING_ORGANIC",
    "AI_CHATGPT",
    "REFERRAL",
    "DIRECT",
    "OTHER",
    "EMAIL",
    "PARTNER",
    "MARKETPLACE",
  ]),
  sourceGroup: z.enum([
    "PAID",
    "ORGANIC",
    "OWNED",
    "REFERRAL",
    "DIRECT",
    "OTHER",
    "UNKNOWN",
  ]),
});

export type FirstPartyAnalyticsEvent = z.infer<typeof eventSchema>;

function normalizedHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]!
    .trim()
    .replace(/:\d+$/, "")
    .toLowerCase();
}

export function firstPartyAnalyticsAllowedForRuntime(
  request: Request,
  runtime = {
    projectId: process.env.VERCEL_PROJECT_ID?.trim() ?? "",
    vercelEnvironment: process.env.VERCEL_ENV?.trim() ?? "",
  },
) {
  const host = normalizedHost(request);
  const origin = request.headers.get("origin");
  return Boolean(
    runtime.projectId === approvedProductionProjectId &&
    runtime.vercelEnvironment === "production" &&
    approvedHosts.has(host) &&
    (!origin || origin === `https://${host}`),
  );
}

export async function recordFirstPartyAnalyticsEvent(payload: unknown) {
  const event = eventSchema.parse(payload);
  const prisma = getPrisma();
  const product = event.productId
    ? await prisma.product.findUnique({
        select: { id: true },
        where: { id: event.productId },
      })
    : null;
  await prisma.analyticsEvent.upsert({
    create: { ...event, productId: product?.id ?? null },
    update: {},
    where: { eventId: event.eventId },
  });
}

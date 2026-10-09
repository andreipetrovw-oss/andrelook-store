import { z } from "zod";

import { isLocale } from "@/config/locales";

import { classifyTrafficSource } from "./classification";
import { trafficSources, type OrderAttributionInput } from "./types";

const sourceGroups = [
  "PAID",
  "ORGANIC",
  "OWNED",
  "REFERRAL",
  "DIRECT",
  "OTHER",
  "UNKNOWN",
] as const;

const optionalString = (maximum: number) =>
  z.string().trim().max(maximum).nullable();

const touchSchema = z.object({
  adName: optionalString(200),
  adSetName: optionalString(200),
  campaignName: optionalString(200),
  contentLabel: optionalString(200),
  eventId: z.string().trim().min(1).max(100),
  fbc: optionalString(500),
  fbclid: optionalString(500),
  fbp: optionalString(500),
  gaClientId: optionalString(200),
  gaSessionId: optionalString(200),
  gclid: optionalString(500),
  landingPage: z.string().trim().max(500),
  locale: z.string().refine(isLocale),
  occurredAt: z.iso.datetime(),
  referrer: optionalString(1000),
  source: z.enum(trafficSources),
  sourceGroup: z.enum(sourceGroups),
  utmCampaign: optionalString(200),
  utmContent: optionalString(200),
  utmMedium: optionalString(100),
  utmSource: optionalString(100),
  utmTerm: optionalString(200),
});

const attributionSchema = z.object({
  analyticsConsent: z.boolean(),
  consentVersion: z.string().trim().min(1).max(100),
  firstTouch: touchSchema.nullable(),
  lastTouch: touchSchema.nullable(),
  marketingConsent: z.boolean(),
});

export function parseOrderAttribution(value: string | undefined) {
  if (!value) return null;
  try {
    return attributionSchema.parse(JSON.parse(value)) as OrderAttributionInput;
  } catch {
    return null;
  }
}

export function safeContextualAttribution(input: {
  landingPath: string | null;
  locale: "ru" | "et" | "en";
  referrer: string | null;
  siteHost: string | null;
}) {
  const classification = classifyTrafficSource({
    referrer: input.referrer,
    siteHost: input.siteHost,
  });
  const now = new Date().toISOString();
  return {
    analyticsConsent: false,
    consentVersion: "g2-consent-v1",
    firstTouch: {
      adName: null,
      adSetName: null,
      campaignName: null,
      contentLabel: null,
      eventId: crypto.randomUUID(),
      fbc: null,
      fbclid: null,
      fbp: null,
      gaClientId: null,
      gaSessionId: null,
      gclid: null,
      landingPage: input.landingPath ?? "",
      locale: input.locale,
      occurredAt: now,
      referrer: input.referrer,
      source: classification.source,
      sourceGroup: classification.sourceGroup,
      utmCampaign: null,
      utmContent: null,
      utmMedium: null,
      utmSource: null,
      utmTerm: null,
    },
    lastTouch: null,
    marketingConsent: false,
  } satisfies OrderAttributionInput;
}

export function orderAttributionForStorage(
  submitted: OrderAttributionInput | null,
  fallback: OrderAttributionInput,
): Omit<OrderAttributionInput, "firstTouch"> & {
  firstTouch: NonNullable<OrderAttributionInput["firstTouch"]>;
} {
  if (!submitted?.firstTouch) {
    return {
      ...fallback,
      firstTouch: fallback.firstTouch!,
    };
  }
  const stripMarketing = !submitted.marketingConsent;
  const sanitize = (
    touch: NonNullable<OrderAttributionInput["firstTouch"]>,
  ) => ({
    ...touch,
    fbc: stripMarketing ? null : touch.fbc,
    fbclid: stripMarketing ? null : touch.fbclid,
    fbp: stripMarketing ? null : touch.fbp,
    gclid: stripMarketing ? null : touch.gclid,
  });
  return {
    ...submitted,
    firstTouch: sanitize(submitted.firstTouch),
    lastTouch: submitted.lastTouch ? sanitize(submitted.lastTouch) : null,
  };
}

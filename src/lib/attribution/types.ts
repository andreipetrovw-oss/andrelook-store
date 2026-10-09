import type { Locale } from "@/config/locales";

export const trafficSources = [
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
] as const;

export type TrafficSourceCode = (typeof trafficSources)[number];

export type SourceGroupCode =
  "PAID" | "ORGANIC" | "OWNED" | "REFERRAL" | "DIRECT" | "OTHER" | "UNKNOWN";

export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: "g2-consent-v1";
};

export type AttributionTouchData = {
  adName: string | null;
  adSetName: string | null;
  campaignName: string | null;
  contentLabel: string | null;
  eventId: string;
  fbc: string | null;
  fbclid: string | null;
  fbp: string | null;
  gaClientId: string | null;
  gaSessionId: string | null;
  gclid: string | null;
  landingPage: string;
  locale: Locale;
  occurredAt: string;
  referrer: string | null;
  source: TrafficSourceCode;
  sourceGroup: SourceGroupCode;
  utmCampaign: string | null;
  utmContent: string | null;
  utmMedium: string | null;
  utmSource: string | null;
  utmTerm: string | null;
};

export type AttributionState = {
  expiresAt: string;
  firstTouch: AttributionTouchData;
  lastTouch: AttributionTouchData;
  version: 2;
};

export type OrderAttributionInput = {
  analyticsConsent: boolean;
  consentVersion: string;
  firstTouch: AttributionTouchData | null;
  lastTouch: AttributionTouchData | null;
  marketingConsent: boolean;
};

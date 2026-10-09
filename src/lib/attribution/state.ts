import type { Locale } from "@/config/locales";

import {
  classifyTrafficSource,
  hasMeaningfulAttribution,
  type ClassificationInput,
} from "./classification";
import type {
  AttributionState,
  AttributionTouchData,
  ConsentPreferences,
} from "./types";

export const attributionWindowDays = 30;
export const attributionStorageKey = "andrelookAttributionV2";
export const consentStorageKey = "andrelookConsentV1";

const maximum = {
  clickId: 500,
  label: 200,
  landing: 500,
  referrer: 1000,
  source: 100,
};

function trimmed(value: string | null | undefined, limit: number) {
  const clean = value?.trim();
  return clean ? clean.slice(0, limit) : null;
}

function cookieValue(cookie: string, name: string) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

export type LandingInput = ClassificationInput & {
  adName?: string | null;
  adSetName?: string | null;
  contentLabel?: string | null;
  cookie?: string;
  eventId: string;
  landingPage: string;
  locale: Locale;
  marketingConsent: boolean;
  now: Date;
  utmContent?: string | null;
  utmTerm?: string | null;
};

export function createAttributionTouch(
  input: LandingInput,
): AttributionTouchData {
  const classification = classifyTrafficSource(input);
  return {
    adName: trimmed(input.adName, maximum.label),
    adSetName: trimmed(input.adSetName, maximum.label),
    campaignName: trimmed(input.utmCampaign, maximum.label),
    contentLabel: trimmed(
      input.contentLabel ?? input.utmContent,
      maximum.label,
    ),
    eventId: input.eventId,
    fbc: input.marketingConsent
      ? trimmed(cookieValue(input.cookie ?? "", "_fbc"), maximum.clickId)
      : null,
    fbclid: input.marketingConsent
      ? trimmed(input.fbclid, maximum.clickId)
      : null,
    fbp: input.marketingConsent
      ? trimmed(cookieValue(input.cookie ?? "", "_fbp"), maximum.clickId)
      : null,
    gaClientId: null,
    gaSessionId: null,
    gclid: input.marketingConsent
      ? trimmed(input.gclid, maximum.clickId)
      : null,
    landingPage: input.landingPage.slice(0, maximum.landing),
    locale: input.locale,
    occurredAt: input.now.toISOString(),
    referrer: trimmed(input.referrer, maximum.referrer),
    source: classification.source,
    sourceGroup: classification.sourceGroup,
    utmCampaign: trimmed(input.utmCampaign, maximum.label),
    utmContent: trimmed(input.utmContent, maximum.label),
    utmMedium: trimmed(input.utmMedium, maximum.source),
    utmSource: trimmed(input.utmSource, maximum.source),
    utmTerm: trimmed(input.utmTerm, maximum.label),
  };
}

export function updateAttributionState(
  previous: AttributionState | null,
  input: LandingInput,
): AttributionState {
  const touch = createAttributionTouch(input);
  const previousExpiry = previous ? Date.parse(previous.expiresAt) : 0;
  if (
    !previous ||
    !Number.isFinite(previousExpiry) ||
    previousExpiry <= input.now.getTime()
  ) {
    return {
      expiresAt: new Date(
        input.now.getTime() + attributionWindowDays * 86_400_000,
      ).toISOString(),
      firstTouch: touch,
      lastTouch: touch,
      version: 2,
    };
  }
  if (!hasMeaningfulAttribution(input)) return previous;
  return { ...previous, lastTouch: touch };
}

export function parseStoredAttribution(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as AttributionState;
    return parsed.version === 2 && parsed.firstTouch && parsed.lastTouch
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function parseConsentPreferences(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as ConsentPreferences;
    return parsed.version === "g2-consent-v1" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

import type { SourceGroupCode, TrafficSourceCode } from "./types";

export type ClassificationInput = {
  fbclid?: string | null;
  gclid?: string | null;
  referrer?: string | null;
  siteHost?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  utmSource?: string | null;
};

export type SourceClassification = {
  source: TrafficSourceCode;
  sourceGroup: SourceGroupCode;
};

const paidMedia = new Set([
  "cpc",
  "paid",
  "paid_search",
  "paid_social",
  "ppc",
  "social_paid",
]);

function normalized(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replaceAll(/[-\s]+/g, "_") ?? ""
  );
}

function hostname(value: string | null | undefined) {
  if (!value) return "";
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function siteHostname(value: string | null | undefined) {
  if (!value) return "";
  return hostname(value.includes("://") ? value : `https://${value}`);
}

function hostMatches(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function isInternalReferrer(
  referrer: string | null | undefined,
  siteHost: string | null | undefined,
) {
  const referrerHost = hostname(referrer);
  const ownHost = siteHostname(siteHost);
  return Boolean(
    referrerHost &&
    ownHost &&
    (referrerHost === ownHost || referrerHost.endsWith(`.${ownHost}`)),
  );
}

export function hasMeaningfulAttribution(input: ClassificationInput) {
  return Boolean(
    normalized(input.utmSource) ||
    normalized(input.utmMedium) ||
    input.utmCampaign?.trim() ||
    input.gclid?.trim() ||
    input.fbclid?.trim() ||
    (hostname(input.referrer) &&
      !isInternalReferrer(input.referrer, input.siteHost)),
  );
}

export function classifyTrafficSource(
  input: ClassificationInput,
): SourceClassification {
  const source = normalized(input.utmSource);
  const medium = normalized(input.utmMedium);
  const referrerHost = hostname(input.referrer);
  const paid = paidMedia.has(medium);

  if (
    paid &&
    [
      "meta",
      "meta_ads",
      "facebook",
      "facebook_ads",
      "instagram",
      "instagram_ads",
    ].includes(source)
  ) {
    return { source: "META_ADS", sourceGroup: "PAID" };
  }
  if (
    paid &&
    ["google", "google_ads", "googleads", "adwords"].includes(source)
  ) {
    return { source: "GOOGLE_ADS", sourceGroup: "PAID" };
  }
  if (input.gclid?.trim()) {
    return { source: "GOOGLE_ADS", sourceGroup: "PAID" };
  }
  if (input.fbclid?.trim()) {
    return { source: "META_ADS", sourceGroup: "PAID" };
  }
  if (paid) return { source: "OTHER", sourceGroup: "PAID" };

  if (source === "instagram") {
    return { source: "INSTAGRAM_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (source === "facebook") {
    return { source: "FACEBOOK_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (source === "telegram") {
    return { source: "TELEGRAM", sourceGroup: "OWNED" };
  }
  if (source === "google") {
    return { source: "GOOGLE_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (source === "bing") {
    return { source: "BING_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (["chatgpt", "openai", "ai"].includes(source)) {
    return { source: "AI_CHATGPT", sourceGroup: "ORGANIC" };
  }
  if (source === "email") {
    return { source: "EMAIL", sourceGroup: "OWNED" };
  }
  if (source === "partner") {
    return { source: "PARTNER", sourceGroup: "REFERRAL" };
  }
  if (source === "marketplace") {
    return { source: "MARKETPLACE", sourceGroup: "REFERRAL" };
  }
  if (source === "direct") {
    return { source: "DIRECT", sourceGroup: "DIRECT" };
  }
  if (source) return { source: "OTHER", sourceGroup: "OTHER" };

  if (
    ["chatgpt.com", "chat.openai.com", "perplexity.ai"].some((domain) =>
      hostMatches(referrerHost, domain),
    ) ||
    hostMatches(referrerHost, "copilot.microsoft.com") ||
    hostMatches(referrerHost, "gemini.google.com")
  ) {
    return { source: "AI_CHATGPT", sourceGroup: "ORGANIC" };
  }
  if (
    hostMatches(referrerHost, "google.com") ||
    referrerHost.startsWith("google.")
  ) {
    return { source: "GOOGLE_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (hostMatches(referrerHost, "bing.com")) {
    return { source: "BING_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (hostMatches(referrerHost, "instagram.com")) {
    return { source: "INSTAGRAM_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (hostMatches(referrerHost, "facebook.com")) {
    return { source: "FACEBOOK_ORGANIC", sourceGroup: "ORGANIC" };
  }
  if (
    hostMatches(referrerHost, "t.me") ||
    hostMatches(referrerHost, "telegram.me")
  ) {
    return { source: "TELEGRAM", sourceGroup: "OWNED" };
  }
  if (referrerHost && !isInternalReferrer(input.referrer, input.siteHost)) {
    return { source: "REFERRAL", sourceGroup: "REFERRAL" };
  }
  return { source: "DIRECT", sourceGroup: "DIRECT" };
}

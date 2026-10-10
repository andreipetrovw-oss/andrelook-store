"use client";

import type { ConsentPreferences } from "@/lib/attribution/types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

const productionHosts = new Set(["andrelook.store", "www.andrelook.store"]);
const enabled = process.env.NEXT_PUBLIC_MEASUREMENT_ENABLED === "true";
const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
let analyticsConsentGranted = false;

export function measurementAllowedForHost(
  host: string,
  measurementEnabled = enabled,
) {
  return measurementEnabled && productionHosts.has(host);
}

export function validGaMeasurementId(value: string | undefined) {
  return value && /^G-[A-Z0-9]+$/.test(value) ? value : null;
}

export function analyticsMeasurementAllowedForHost(
  host: string,
  analyticsConsent: boolean,
  measurementId = gaId,
  measurementEnabled = enabled,
) {
  return Boolean(
    analyticsConsent &&
    validGaMeasurementId(measurementId) &&
    measurementAllowedForHost(host, measurementEnabled),
  );
}

function productionMeasurementAllowed() {
  return measurementAllowedForHost(window.location.hostname);
}

function gtag(...args: unknown[]) {
  window.dataLayer?.push(args);
}

function loadGoogleAnalytics() {
  const measurementId = validGaMeasurementId(gaId);
  if (
    !measurementId ||
    document.querySelector(`[data-andrelook-ga="${measurementId}"]`)
  )
    return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.andrelookGa = measurementId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
  window.dataLayer = window.dataLayer ?? [];
  gtag("consent", "default", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

function updateGoogleAnalyticsConsent(granted: boolean) {
  if (!validGaMeasurementId(gaId) || !window.dataLayer) return;
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

function loadMetaPixel() {
  if (!metaPixelId || window.fbq) return;
  const queue = (...args: unknown[]) => {
    (queue as unknown as { q: unknown[] }).q.push(args);
  };
  (queue as unknown as { q: unknown[] }).q = [];
  window.fbq = queue;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.append(script);
  window.fbq("init", metaPixelId);
  window.fbq("track", "PageView");
}

export function applyMeasurementConsent(consent: ConsentPreferences) {
  analyticsConsentGranted = analyticsMeasurementAllowedForHost(
    window.location.hostname,
    consent.analytics,
  );
  if (!productionMeasurementAllowed()) return;
  if (analyticsConsentGranted) loadGoogleAnalytics();
  updateGoogleAnalyticsConsent(analyticsConsentGranted);
  if (consent.marketing) loadMetaPixel();
}

export function trackPublicEvent(
  name:
    | "contact_click"
    | "preorder_open"
    | "preorder_submit"
    | "select_item"
    | "size_help"
    | "telegram_click"
    | "view_item"
    | "view_item_list",
  parameters: Record<
    string,
    boolean | number | string | Array<Record<string, number | string | null>>
  > = {},
) {
  if (!productionMeasurementAllowed()) return;
  if (
    analyticsConsentGranted &&
    validGaMeasurementId(gaId) &&
    window.dataLayer
  ) {
    gtag("event", name, parameters);
  }
  if (metaPixelId && window.fbq) {
    if (name === "preorder_submit") {
      window.fbq("track", "Lead", parameters);
    } else if (name === "view_item") {
      window.fbq("track", "ViewContent", parameters);
    } else {
      window.fbq("trackCustom", name, parameters);
    }
  }
}

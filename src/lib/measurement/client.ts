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

export function measurementAllowedForHost(
  host: string,
  measurementEnabled = enabled,
) {
  return measurementEnabled && productionHosts.has(host);
}

function productionMeasurementAllowed() {
  return measurementAllowedForHost(window.location.hostname);
}

function loadGoogleAnalytics() {
  if (!gaId || document.querySelector(`[data-andrelook-ga="${gaId}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.andrelookGa = gaId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.append(script);
  window.dataLayer = window.dataLayer ?? [];
  const gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  gtag("js", new Date());
  gtag("config", gaId, { anonymize_ip: true, send_page_view: true });
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
  if (!productionMeasurementAllowed()) return;
  if (consent.analytics) loadGoogleAnalytics();
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
  if (gaId && window.dataLayer) {
    window.dataLayer.push(["event", name, parameters]);
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

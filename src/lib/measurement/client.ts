"use client";

import {
  attributionStorageKey,
  parseStoredAttribution,
} from "@/lib/attribution/state";
import type { ConsentPreferences } from "@/lib/attribution/types";

type MetaPixelBootstrap = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded: boolean;
  push: (...args: unknown[]) => void;
  queue: unknown[][];
  version: "2.0";
};

declare global {
  interface Window {
    _fbq?: MetaPixelBootstrap;
    dataLayer?: unknown[];
    fbq?: MetaPixelBootstrap;
  }
}

const productionHosts = new Set(["andrelook.store", "www.andrelook.store"]);
const enabled = process.env.NEXT_PUBLIC_MEASUREMENT_ENABLED === "true";
const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
let analyticsConsentGranted = false;
let marketingConsentGranted = false;
let firstPartyAnalyticsConsentGranted = false;
const firstPartyViewKeys = new Set<string>();
const analyticsSessionKey = "andrelookAnalyticsSessionV1";

export function measurementAllowedForHost(
  host: string,
  measurementEnabled = enabled,
) {
  return measurementEnabled && productionHosts.has(host);
}

export function validGaMeasurementId(value: string | undefined) {
  return value && /^G-[A-Z0-9]+$/.test(value) ? value : null;
}

export function validMetaPixelId(value: string | undefined) {
  return value && /^\d{10,20}$/.test(value) ? value : null;
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

export function marketingMeasurementAllowedForHost(
  host: string,
  marketingConsent: boolean,
  pixelId = metaPixelId,
  measurementEnabled = enabled,
) {
  return Boolean(
    marketingConsent &&
    validMetaPixelId(pixelId) &&
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
  const pixelId = validMetaPixelId(metaPixelId);
  if (
    !pixelId ||
    window.fbq ||
    document.querySelector(`[data-andrelook-meta="${pixelId}"]`)
  )
    return;
  const bootstrap = ((...args: unknown[]) => {
    if (bootstrap.callMethod) bootstrap.callMethod(...args);
    else bootstrap.queue.push(args);
  }) as MetaPixelBootstrap;
  bootstrap.push = bootstrap;
  bootstrap.loaded = true;
  bootstrap.version = "2.0";
  bootstrap.queue = [];
  window.fbq = bootstrap;
  window._fbq ??= bootstrap;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.andrelookMeta = pixelId;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.append(script);
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

function metaProductPayload(
  parameters: Record<
    string,
    boolean | number | string | Array<Record<string, number | string | null>>
  >,
) {
  const firstItem = Array.isArray(parameters.items)
    ? parameters.items[0]
    : undefined;
  const itemId = firstItem?.item_id ?? parameters.item_id;
  const itemName = firstItem?.item_name ?? parameters.item_name;

  return {
    ...(typeof itemId === "string" ? { content_ids: [itemId] } : {}),
    ...(typeof itemName === "string" ? { content_name: itemName } : {}),
    content_type: "product",
    ...(typeof parameters.value === "number"
      ? { value: parameters.value }
      : {}),
    ...(parameters.currency === "EUR" ? { currency: "EUR" } : {}),
  };
}

export function applyMeasurementConsent(consent: ConsentPreferences) {
  firstPartyAnalyticsConsentGranted =
    consent.analytics && productionMeasurementAllowed();
  analyticsConsentGranted = analyticsMeasurementAllowedForHost(
    window.location.hostname,
    consent.analytics,
  );
  marketingConsentGranted = marketingMeasurementAllowedForHost(
    window.location.hostname,
    consent.marketing,
  );
  if (!productionMeasurementAllowed()) return;
  if (analyticsConsentGranted) loadGoogleAnalytics();
  updateGoogleAnalyticsConsent(analyticsConsentGranted);
  if (marketingConsentGranted) loadMetaPixel();
}

type FirstPartyEventName =
  | "PAGE_VIEW"
  | "VIEW_ITEM_LIST"
  | "SELECT_ITEM"
  | "VIEW_ITEM"
  | "PREORDER_OPEN"
  | "PREORDER_SUBMIT";

function analyticsSessionId() {
  const current = sessionStorage.getItem(analyticsSessionKey);
  if (current) return current;
  const created = crypto.randomUUID();
  sessionStorage.setItem(analyticsSessionKey, created);
  return created;
}

function firstPartyEvent(
  eventName: FirstPartyEventName,
  parameters: Record<
    string,
    boolean | number | string | Array<Record<string, number | string | null>>
  >,
  eventId?: string,
) {
  if (!firstPartyAnalyticsConsentGranted) return;
  const firstItem = Array.isArray(parameters.items)
    ? parameters.items[0]
    : undefined;
  const productId = firstItem?.item_id ?? parameters.item_id;
  const pagePath = window.location.pathname;
  if (["PAGE_VIEW", "VIEW_ITEM_LIST", "VIEW_ITEM"].includes(eventName)) {
    const key = `${eventName}:${pagePath}:${typeof productId === "string" ? productId : ""}`;
    if (firstPartyViewKeys.has(key)) return;
    firstPartyViewKeys.add(key);
  }
  try {
    const state = parseStoredAttribution(
      localStorage.getItem(attributionStorageKey),
    );
    const touch = state?.lastTouch ?? state?.firstTouch;
    const localeSegment = pagePath.split("/")[1]?.toUpperCase();
    const locale = ["RU", "ET", "EN"].includes(localeSegment ?? "")
      ? localeSegment!
      : "ET";
    void fetch("/api/analytics/events", {
      body: JSON.stringify({
        adName: touch?.adName ?? null,
        adSetName: touch?.adSetName ?? null,
        campaignName: touch?.campaignName ?? null,
        contentLabel: touch?.contentLabel ?? null,
        eventId: eventId ?? crypto.randomUUID(),
        eventName,
        landingPage: touch?.landingPage?.split("?")[0] ?? pagePath,
        locale,
        pagePath,
        productId: typeof productId === "string" ? productId : null,
        sessionId: analyticsSessionId(),
        source: touch?.source ?? "DIRECT",
        sourceGroup: touch?.sourceGroup ?? "DIRECT",
      }),
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  } catch {
    // Analytics must never interfere with storefront behavior.
  }
}

export function trackFirstPartyPageView() {
  firstPartyEvent("PAGE_VIEW", {});
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
  options: { eventId?: string } = {},
) {
  if (!productionMeasurementAllowed()) return;
  const firstPartyName: FirstPartyEventName | undefined = (
    {
      preorder_open: "PREORDER_OPEN",
      preorder_submit: "PREORDER_SUBMIT",
      select_item: "SELECT_ITEM",
      view_item: "VIEW_ITEM",
      view_item_list: "VIEW_ITEM_LIST",
    } as Partial<Record<typeof name, FirstPartyEventName>>
  )[name];
  if (firstPartyName)
    firstPartyEvent(firstPartyName, parameters, options.eventId);
  if (
    analyticsConsentGranted &&
    validGaMeasurementId(gaId) &&
    window.dataLayer
  ) {
    gtag("event", name, parameters);
  }
  if (marketingConsentGranted && validMetaPixelId(metaPixelId) && window.fbq) {
    if (name === "preorder_submit") {
      const payload = metaProductPayload(parameters);
      if (options.eventId) {
        window.fbq("track", "Lead", payload, { eventID: options.eventId });
      } else {
        window.fbq("track", "Lead", payload);
      }
    } else if (name === "view_item") {
      window.fbq("track", "ViewContent", metaProductPayload(parameters));
    }
  }
}

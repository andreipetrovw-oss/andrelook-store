"use client";

import { useEffect, useRef, useState } from "react";

import { isLocale, type Locale } from "@/config/locales";
import {
  attributionStorageKey,
  consentStorageKey,
  parseConsentPreferences,
  parseStoredAttribution,
  updateAttributionState,
} from "@/lib/attribution/state";
import type { ConsentPreferences } from "@/lib/attribution/types";
import type { AttributionState } from "@/lib/attribution/types";
import {
  applyMeasurementConsent,
  trackPublicEvent,
} from "@/lib/measurement/client";

const copy = {
  en: {
    accept: "Allow analytics",
    analytics: "Analytics",
    description:
      "We use necessary storage for the site and optional analytics to understand which campaigns lead to enquiries. Marketing measurement is off unless you allow it.",
    marketing: "Marketing measurement",
    necessary: "Necessary",
    reject: "Necessary only",
    save: "Save choices",
    title: "Your privacy choices",
  },
  et: {
    accept: "Luba analüütika",
    analytics: "Analüütika",
    description:
      "Kasutame veebilehe jaoks vajalikku salvestust ning valikulist analüütikat, et mõista, millised kampaaniad toovad päringuid. Turundusmõõtmine on väljas, kuni selle lubate.",
    marketing: "Turundusmõõtmine",
    necessary: "Vajalik",
    reject: "Ainult vajalik",
    save: "Salvesta valikud",
    title: "Teie privaatsusvalikud",
  },
  ru: {
    accept: "Разрешить аналитику",
    analytics: "Аналитика",
    description:
      "Мы используем необходимое хранилище для работы сайта и, с вашего согласия, аналитику, чтобы понимать, какие кампании приводят обращения. Маркетинговые измерения отключены, пока вы их не разрешите.",
    marketing: "Маркетинговые измерения",
    necessary: "Необходимое",
    reject: "Только необходимое",
    save: "Сохранить выбор",
    title: "Настройки приватности",
  },
} satisfies Record<Locale, Record<string, string>>;

function currentLocale(): Locale {
  const segment = window.location.pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : "et";
}

function landingState(marketingConsent: boolean, reset = false) {
  const query = new URLSearchParams(window.location.search);
  return updateAttributionState(
    reset
      ? null
      : parseStoredAttribution(localStorage.getItem(attributionStorageKey)),
    {
      adName: query.get("utm_ad"),
      adSetName: query.get("utm_adset"),
      cookie: document.cookie,
      eventId: crypto.randomUUID(),
      fbclid: query.get("fbclid"),
      gclid: query.get("gclid"),
      landingPage: `${window.location.pathname}${window.location.search}`,
      locale: currentLocale(),
      marketingConsent,
      now: new Date(),
      referrer: document.referrer,
      siteHost: window.location.hostname,
      utmCampaign: query.get("utm_campaign"),
      utmContent: query.get("utm_content"),
      utmMedium: query.get("utm_medium"),
      utmSource: query.get("utm_source"),
      utmTerm: query.get("utm_term"),
    },
  );
}

export function CampaignCapture({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const pendingAttribution = useRef<AttributionState | null>(null);
  const labels = copy[locale];

  useEffect(() => {
    let stateTimer: number | undefined;
    try {
      const consent = parseConsentPreferences(
        localStorage.getItem(consentStorageKey),
      );
      if (consent) {
        stateTimer = window.setTimeout(() => {
          setAnalytics(consent.analytics);
          setMarketing(consent.marketing);
        }, 0);
        applyMeasurementConsent(consent);
        window.dispatchEvent(
          new CustomEvent("andrelook:consent", { detail: consent }),
        );
        if (consent.analytics || consent.marketing) {
          localStorage.setItem(
            attributionStorageKey,
            JSON.stringify(landingState(consent.marketing)),
          );
        }
      } else {
        pendingAttribution.current = landingState(false, true);
        stateTimer = window.setTimeout(() => setOpen(true), 0);
      }
      sessionStorage.removeItem("andrelookCampaign");
    } catch {
      // Storage restrictions must never block browsing or ordering.
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      if (link.href.startsWith("https://t.me/")) {
        trackPublicEvent("telegram_click");
      } else if (
        link.href.startsWith("mailto:") ||
        link.href.includes("instagram.com")
      ) {
        trackPublicEvent("contact_click");
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      if (stateTimer !== undefined) window.clearTimeout(stateTimer);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    const showSettings = () => setOpen(true);
    window.addEventListener("andrelook:privacy-settings", showSettings);
    return () =>
      window.removeEventListener("andrelook:privacy-settings", showSettings);
  }, []);

  const save = (nextAnalytics: boolean, nextMarketing: boolean) => {
    try {
      const preferences: ConsentPreferences = {
        analytics: nextAnalytics,
        marketing: nextMarketing,
        updatedAt: new Date().toISOString(),
        version: "g2-consent-v1",
      };
      localStorage.setItem(consentStorageKey, JSON.stringify(preferences));
      if (nextAnalytics || nextMarketing) {
        const currentLanding = `${window.location.pathname}${window.location.search}`;
        const attribution =
          nextMarketing &&
          pendingAttribution.current?.firstTouch.landingPage === currentLanding
            ? landingState(true, true)
            : (pendingAttribution.current ?? landingState(nextMarketing));
        localStorage.setItem(
          attributionStorageKey,
          JSON.stringify(attribution),
        );
      } else {
        localStorage.removeItem(attributionStorageKey);
      }
      applyMeasurementConsent(preferences);
      window.dispatchEvent(
        new CustomEvent("andrelook:consent", { detail: preferences }),
      );
    } catch {
      // Consent remains optional if browser storage is unavailable.
    }
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <section
          aria-label={labels.title}
          aria-live="polite"
          className="privacy-consent"
        >
          <div>
            <strong>{labels.title}</strong>
            <p>{labels.description}</p>
          </div>
          <div className="privacy-consent-options">
            <label>
              <input checked disabled type="checkbox" />
              <span>{labels.necessary}</span>
            </label>
            <label>
              <input
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                type="checkbox"
              />
              <span>{labels.analytics}</span>
            </label>
            <label>
              <input
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
                type="checkbox"
              />
              <span>{labels.marketing}</span>
            </label>
          </div>
          <div className="privacy-consent-actions">
            <button onClick={() => save(false, false)} type="button">
              {labels.reject}
            </button>
            <button onClick={() => save(analytics, marketing)} type="button">
              {labels.save}
            </button>
            <button onClick={() => save(true, false)} type="button">
              {labels.accept}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}

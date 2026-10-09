"use client";

import type { Locale } from "@/config/locales";

const label = {
  en: "Privacy settings",
  et: "Privaatsusseaded",
  ru: "Настройки приватности",
} satisfies Record<Locale, string>;

export function FooterPrivacySettingsButton({ locale }: { locale: Locale }) {
  return (
    <button
      className="footer-privacy-settings-trigger"
      onClick={() =>
        window.dispatchEvent(new Event("andrelook:privacy-settings"))
      }
      type="button"
    >
      {label[locale]}
    </button>
  );
}

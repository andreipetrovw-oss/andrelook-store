import type { Metadata } from "next";

import {
  defaultLocale,
  localePath,
  locales,
  type Locale,
} from "@/config/locales";
import { getServerConfig } from "@/lib/env";

const openGraphLocales: Record<Locale, string> = {
  en: "en_GB",
  et: "et_EE",
  ru: "ru_RU",
};

export function localizedOpenGraph(locale: Locale) {
  return {
    alternateLocale: locales
      .filter((item) => item !== locale)
      .map((item) => openGraphLocales[item]),
    locale: openGraphLocales[locale],
  };
}

export function brandedTitle(title: string) {
  return `${title} | Andrelook`;
}

export function localizedAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const config = getServerConfig();
  const pathFor = (targetLocale: Locale) => localePath(targetLocale, path);

  return {
    canonical: new URL(pathFor(locale), config.siteUrl).toString(),
    languages: Object.fromEntries([
      ...locales.map((targetLocale) => [
        targetLocale,
        new URL(pathFor(targetLocale), config.siteUrl).toString(),
      ]),
      ["x-default", new URL(pathFor(defaultLocale), config.siteUrl).toString()],
    ]),
  };
}

export function indexingRobots(): NonNullable<Metadata["robots"]> {
  const enabled = getServerConfig().indexingEnabled;
  return enabled
    ? { follow: true, index: true }
    : { follow: false, index: false, nocache: true };
}

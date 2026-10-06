export const locales = ["ru", "et", "en"] as const;

export type Locale = (typeof locales)[number];

// Estonian is the owner-approved primary storefront and x-default locale.
export const defaultLocale: Locale = "et";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const databaseLocale = {
  ru: "RU",
  et: "ET",
  en: "EN",
} as const satisfies Record<Locale, "RU" | "ET" | "EN">;

export function localePath(locale: Locale, path = ""): string {
  const normalized = path === "" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `/${locale}${normalized}`;
}

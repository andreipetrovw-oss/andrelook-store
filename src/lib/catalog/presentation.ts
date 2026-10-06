import type { Locale } from "@/config/locales";

const categoryNames: Record<string, Record<Locale, string>> = {
  bottoms: {
    en: "Swimwear",
    et: "Ujumisriided",
    ru: "Пляжная одежда",
  },
  hoodies: {
    en: "Sweatshirts",
    et: "Dressipluusid",
    ru: "Свитшоты и худи",
  },
  "light-jackets": {
    en: "Jackets & knitwear",
    et: "Jakid ja kudumid",
    ru: "Куртки и трикотаж",
  },
  "t-shirts": {
    en: "T-shirts & polos",
    et: "T-särgid ja polod",
    ru: "Футболки и поло",
  },
  vests: {
    en: "Vests",
    et: "Vestid",
    ru: "Жилеты",
  },
  "warm-jackets": {
    en: "Outerwear",
    et: "Üleriided",
    ru: "Верхняя одежда",
  },
};

export function getCustomerCategoryName(
  locale: Locale,
  slug: string,
  fallback: string,
) {
  return categoryNames[slug]?.[locale] ?? fallback;
}

export function getProductDisplayName(
  name: string,
  brandName: string | null | undefined,
) {
  if (!brandName) return name;
  const prefix = `${brandName} `;
  return name.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())
    ? name.slice(prefix.length)
    : name;
}

import type { Locale } from "@/config/locales";

const categoryNames: Record<string, Record<Locale, string>> = {
  bottoms: {
    en: "Swim shorts",
    et: "Ujumispüksid",
    ru: "Плавательные шорты",
  },
  hoodies: {
    en: "Sweatshirts & hoodies",
    et: "Dressipluusid ja pusad",
    ru: "Свитшоты и худи",
  },
  "light-jackets": {
    en: "Jackets & cardigans",
    et: "Joped ja kardiganid",
    ru: "Куртки и кардиганы",
  },
  "t-shirts": {
    en: "T-shirts & polos",
    et: "T-särgid ja polod",
    ru: "Футболки и поло",
  },
  vests: {
    en: "Gilets",
    et: "Vestid",
    ru: "Жилеты",
  },
  "warm-jackets": {
    en: "Puffer jackets",
    et: "Soojad joped",
    ru: "Утеплённые куртки",
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

export function formatProductCount(locale: Locale, count: number) {
  if (locale === "et") return `${count} ${count === 1 ? "toode" : "toodet"}`;
  if (locale === "ru") {
    const modulo100 = count % 100;
    const modulo10 = count % 10;
    const noun =
      modulo100 >= 11 && modulo100 <= 14
        ? "моделей"
        : modulo10 === 1
          ? "модель"
          : modulo10 >= 2 && modulo10 <= 4
            ? "модели"
            : "моделей";
    return `${count} ${noun}`;
  }
  return `${count} ${count === 1 ? "piece" : "pieces"}`;
}

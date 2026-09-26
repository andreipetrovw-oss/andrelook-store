import "server-only";

import type { Locale } from "@/config/locales";

const dictionaries = {
  ru: {
    catalog: "Каталог",
    catalogEmpty: "Одобренные товары пока не опубликованы.",
    contact: "Контакты",
    footerRegion: "Эстония · Европа",
    home: "Главная",
    language: "Язык",
    navigation: "Навигация",
    preview: "Техническая основа v1",
    tagline: "Мировые бренды · Личный подход",
    viewCatalog: "Смотреть каталог",
  },
  et: {
    catalog: "Kataloog",
    catalogEmpty: "Kinnitatud tooteid pole veel avaldatud.",
    contact: "Kontakt",
    footerRegion: "Eesti · Euroopa",
    home: "Avaleht",
    language: "Keel",
    navigation: "Navigatsioon",
    preview: "V1 tehniline alus",
    tagline: "Maailma brändid · Isiklik lähenemine",
    viewCatalog: "Vaata kataloogi",
  },
  en: {
    catalog: "Catalog",
    catalogEmpty: "No approved products have been published yet.",
    contact: "Contact",
    footerRegion: "Estonia · Europe",
    home: "Home",
    language: "Language",
    navigation: "Navigation",
    preview: "V1 technical foundation",
    tagline: "World brands · Personal approach",
    viewCatalog: "View catalog",
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

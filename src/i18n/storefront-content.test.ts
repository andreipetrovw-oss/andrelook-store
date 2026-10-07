import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDictionary } from "./dictionaries";
import { getStorefrontContent } from "./storefront-content";

const expected = {
  en: {
    meta: "PRE-ORDER · 2–3 WEEKS · TALLINN & EUROPE",
    tagline: "GLOBAL BRANDS · PERSONAL SERVICE",
  },
  et: {
    meta: "EELTELLIMUS · 2–3 NÄDALAT · TALLINN JA EUROOPA",
    tagline: "MAAILMA BRÄNDID · PERSONAALNE TEENINDUS",
  },
  ru: {
    meta: "ПРЕДЗАКАЗ · 2–3 НЕДЕЛИ · ТАЛЛИНН И ЕВРОПА",
    tagline: "МИРОВЫЕ БРЕНДЫ · ЛИЧНЫЙ ПОДХОД",
  },
} as const;

describe("owner-approved brand-first hero", () => {
  it.each(["ru", "et", "en"] as const)(
    "keeps ANDRELOOK dominant in %s",
    (locale) => {
      const home = getStorefrontContent(locale).home;
      expect(home.heroTitle).toBe("ANDRELOOK");
      expect(home.eyebrow).toBe("ANDRELOOK · TALLINN");
      expect(home.heroMeta).toBe(expected[locale].meta);
      expect(getDictionary(locale).tagline).toBe(expected[locale].tagline);
    },
  );
});

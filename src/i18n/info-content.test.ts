import { describe, expect, it } from "vitest";

import { locales } from "@/config/locales";

import { getInfoPage, infoPageSlugs } from "./info-content";

describe("localized information architecture", () => {
  it("has complete non-empty RU, ET and EN content for every route", () => {
    for (const locale of locales) {
      for (const slug of infoPageSlugs) {
        const page = getInfoPage(locale, slug);
        expect(page?.title).toBeTruthy();
        expect(page?.introduction).toBeTruthy();
        expect(page?.sections.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps public policy pages customer-ready without internal approval language", () => {
    for (const locale of locales) {
      for (const slug of ["privacy", "terms", "returns-exchanges"] as const) {
        const page = getInfoPage(locale, slug);
        expect(JSON.stringify(page)).not.toMatch(/owner|omanik|владел/i);
      }
    }
  });

  it("answers eight customer purchase questions in every locale", () => {
    for (const locale of locales) {
      const faq = getInfoPage(locale, "faq");
      expect(faq?.sections).toHaveLength(8);
      expect(JSON.stringify(faq)).not.toMatch(
        /price missing|not yet published|catalog version|six pieces|kuue tabelita|шести модел/i,
      );
    }
  });

  it("does not duplicate the visual numbering used by information pages", () => {
    for (const locale of locales) {
      const page = getInfoPage(locale, "how-to-order");
      for (const section of page?.sections ?? []) {
        expect(section.title).not.toMatch(/^\d+[.)]/);
      }
    }
  });
});

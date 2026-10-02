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

  it("keeps policy pages behind an explicit approval boundary", () => {
    for (const locale of locales) {
      for (const slug of ["privacy", "terms", "returns-exchanges"] as const) {
        expect(getInfoPage(locale, slug)?.requiresApproval).toBe(true);
      }
    }
  });
});

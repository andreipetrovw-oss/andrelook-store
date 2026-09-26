import { describe, expect, it } from "vitest";

import { defaultLocale, isLocale, localePath, locales } from "./locales";

describe("locale configuration", () => {
  it("supports exactly RU, ET and EN with provisional RU default", () => {
    expect(locales).toEqual(["ru", "et", "en"]);
    expect(defaultLocale).toBe("ru");
  });

  it("rejects unsupported locale segments", () => {
    expect(isLocale("et")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("../admin")).toBe(false);
  });

  it("builds normalized localized paths", () => {
    expect(localePath("en")).toBe("/en");
    expect(localePath("et", "/catalog/outerwear/")).toBe(
      "/et/catalog/outerwear",
    );
  });
});

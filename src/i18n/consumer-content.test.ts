import { describe, expect, it } from "vitest";
import { consumerContent } from "./consumer-content";
import { getInfoPage } from "./info-content";
import { trustContent } from "./trust-content";

describe("factual consumer information without fictional merchant terms", () => {
  for (const locale of ["et", "ru", "en"] as const) {
    it(`${locale}: replaces vague returns copy and preserves the page structure`, () => {
      const content = consumerContent[locale];
      const returns = getInfoPage(locale, "returns-exchanges");
      expect(returns?.sections).toEqual(content.returns);
      expect(returns?.sections).toHaveLength(5);
      expect(new Set(returns?.sections.map((s) => s.title)).size).toBe(5);
      expect(
        getInfoPage(locale, "delivery-payment")?.sections.slice(-2),
      ).toEqual([content.beforePayment, content.delay]);
      expect(getInfoPage(locale, "faq")?.sections[6]?.body).toBe(
        content.returnsAnswer,
      );
      expect(getInfoPage(locale, "faq")?.sections).toHaveLength(10);
      expect(getInfoPage(locale, "how-to-order")?.sections).toEqual(
        trustContent[locale].steps,
      );
      const copy = JSON.stringify(content);
      expect(copy).toContain("14");
      expect(copy).toContain("15");
      expect(copy).toContain("info.andrelook@gmail.com");
      expect(copy).not.toMatch(
        /Andreluk OÜ|17track|superbuy|dhl|AL-\d|guaranteed authentic|non-refundable deposits|TBD|TODO|registry number|registrikood/i,
      );
    });
  }
  it("retains precise statutory distinctions in the English reference copy", () => {
    const content = consumerContent.en;
    const returns = content.returns.map((s) => s.body).join(" ");
    expect(returns).toContain("14 days of receipt");
    expect(returns).toContain("within 14 days of giving notice");
    expect(returns).toContain("within 14 days of receiving notice");
    expect(returns).toContain("proof of dispatch");
    expect(returns).toContain("not automatically non-refundable");
    expect(returns).toContain("two years");
    expect(returns).toContain("two months");
    expect(returns).toContain(
      "voluntary size exchange requires separate agreement",
    );
    expect(returns).toContain(
      "no automatic fixed deductions or restocking fees",
    );
    expect(returns).toContain("where disclosed before the contract");
    expect(content.beforePayment.body).toContain("seller’s name");
    expect(content.beforePayment.body).toContain("quantity");
    expect(content.beforePayment.body).toContain(
      "advance and remaining balance",
    );
    expect(trustContent.en.tracking).toContain("not a live location");
    expect(trustContent.en.tracking).toContain("not yet purchase confirmation");
    expect(trustContent.en.review).toContain("moderated before publication");
  });
});

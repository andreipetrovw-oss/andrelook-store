import { describe, expect, it } from "vitest";

import { classifyTrafficSource } from "./classification";

describe("traffic source classification", () => {
  it.each([
    [{ gclid: "gclid" }, "GOOGLE_ADS", "PAID"],
    [{ fbclid: "fbclid" }, "META_ADS", "PAID"],
    [{ utmMedium: "paid_social", utmSource: "instagram" }, "META_ADS", "PAID"],
    [{ utmMedium: "cpc", utmSource: "google" }, "GOOGLE_ADS", "PAID"],
    [{ utmSource: "instagram" }, "INSTAGRAM_ORGANIC", "ORGANIC"],
    [{ utmSource: "facebook" }, "FACEBOOK_ORGANIC", "ORGANIC"],
    [{ utmSource: "telegram" }, "TELEGRAM", "OWNED"],
    [{ utmSource: "email" }, "EMAIL", "OWNED"],
    [{ utmSource: "partner" }, "PARTNER", "REFERRAL"],
    [{ utmSource: "marketplace" }, "MARKETPLACE", "REFERRAL"],
    [
      { referrer: "https://www.google.com/search?q=andrelook" },
      "GOOGLE_ORGANIC",
      "ORGANIC",
    ],
    [
      { referrer: "https://www.bing.com/search?q=andrelook" },
      "BING_ORGANIC",
      "ORGANIC",
    ],
    [{ referrer: "https://chatgpt.com/c/abc" }, "AI_CHATGPT", "ORGANIC"],
    [{ referrer: "https://example.com/list" }, "REFERRAL", "REFERRAL"],
    [{}, "DIRECT", "DIRECT"],
  ] as const)("classifies %j", (input, source, sourceGroup) => {
    expect(classifyTrafficSource(input)).toEqual({ source, sourceGroup });
  });

  it("does not classify an internal referrer as referral", () => {
    expect(
      classifyTrafficSource({
        referrer: "https://www.andrelook.store/et/catalog",
        siteHost: "www.andrelook.store",
      }),
    ).toEqual({ source: "DIRECT", sourceGroup: "DIRECT" });
    expect(
      classifyTrafficSource({
        referrer: "http://localhost:3000/et/catalog",
        siteHost: "localhost:3000",
      }),
    ).toEqual({ source: "DIRECT", sourceGroup: "DIRECT" });
  });
});

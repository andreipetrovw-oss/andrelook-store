import { describe, expect, it } from "vitest";

import {
  canonicalIndexNowUrls,
  indexNowKey,
  indexNowPayload,
} from "./indexnow";

describe("IndexNow public URL guard", () => {
  const siteUrl = new URL("https://www.andrelook.store");

  it("keeps only canonical localized production URLs", () => {
    expect(
      canonicalIndexNowUrls(
        [
          "https://www.andrelook.store/et",
          "https://www.andrelook.store/et/catalog",
          "https://www.andrelook.store/et/catalog?q=maya",
          "https://www.andrelook.store/admin",
          "https://www.andrelook.store/api/orders",
          "https://andrelook-v1-staging.vercel.app/et",
          "not-a-url",
          "https://www.andrelook.store/et",
        ],
        siteUrl,
      ),
    ).toEqual([
      "https://www.andrelook.store/et",
      "https://www.andrelook.store/et/catalog",
    ]);
  });

  it("builds an official-protocol payload with the root key location", () => {
    expect(
      indexNowPayload(["https://www.andrelook.store/et"], siteUrl),
    ).toEqual({
      host: "www.andrelook.store",
      key: indexNowKey,
      keyLocation: `https://www.andrelook.store/${indexNowKey}.txt`,
      urlList: ["https://www.andrelook.store/et"],
    });
  });
});

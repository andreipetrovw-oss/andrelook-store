import { describe, expect, it, vi } from "vitest";

import {
  orderAttributionForStorage,
  parseOrderAttribution,
  safeContextualAttribution,
} from "./server";

vi.mock("server-only", () => ({}));

describe("order attribution snapshot", () => {
  it("rejects malformed client attribution", () => {
    expect(parseOrderAttribution('{"marketingConsent":"yes"}')).toBeNull();
  });

  it("falls back to a safe contextual source without optional consent", () => {
    const fallback = safeContextualAttribution({
      landingPath: "/et/catalog",
      locale: "et",
      referrer: "https://www.andrelook.store/et",
      siteHost: "www.andrelook.store",
    });
    const stored = orderAttributionForStorage(null, fallback);
    expect(stored).toMatchObject({
      analyticsConsent: false,
      firstTouch: { source: "DIRECT" },
      marketingConsent: false,
    });
  });

  it("removes advertising identifiers when marketing consent is false", () => {
    const fallback = safeContextualAttribution({
      landingPath: "/en",
      locale: "en",
      referrer: null,
      siteHost: "www.andrelook.store",
    });
    const submitted = {
      ...fallback,
      analyticsConsent: true,
      firstTouch: {
        ...fallback.firstTouch!,
        fbclid: "fb-click",
        gclid: "google-click",
      },
    };
    expect(
      orderAttributionForStorage(submitted, fallback).firstTouch,
    ).toMatchObject({
      fbclid: null,
      gclid: null,
    });
  });
});

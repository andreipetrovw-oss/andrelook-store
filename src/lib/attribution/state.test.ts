import { describe, expect, it } from "vitest";

import { updateAttributionState } from "./state";

const base = {
  cookie: "_fbc=fbc-value; _fbp=fbp-value",
  eventId: "event-1",
  landingPage: "/et",
  locale: "et" as const,
  marketingConsent: true,
  now: new Date("2026-10-01T10:00:00.000Z"),
  siteHost: "www.andrelook.store",
};

describe("30-day attribution state", () => {
  it("preserves first touch and only changes last touch for a meaningful campaign", () => {
    const first = updateAttributionState(null, {
      ...base,
      utmCampaign: "autumn",
      utmMedium: "paid_social",
      utmSource: "instagram",
    });
    const direct = updateAttributionState(first, {
      ...base,
      eventId: "event-2",
      landingPage: "/et/catalog",
      now: new Date("2026-10-02T10:00:00.000Z"),
    });
    expect(direct).toBe(first);

    const later = updateAttributionState(direct, {
      ...base,
      eventId: "event-3",
      now: new Date("2026-10-03T10:00:00.000Z"),
      utmCampaign: "search",
      utmMedium: "cpc",
      utmSource: "google",
    });
    expect(later.firstTouch.source).toBe("META_ADS");
    expect(later.lastTouch.source).toBe("GOOGLE_ADS");
  });

  it("starts a new window after 30 days", () => {
    const previous = updateAttributionState(null, base);
    const next = updateAttributionState(previous, {
      ...base,
      eventId: "event-new",
      now: new Date("2026-11-01T10:00:00.000Z"),
      utmSource: "telegram",
    });
    expect(next.firstTouch.eventId).toBe("event-new");
    expect(next.firstTouch.source).toBe("TELEGRAM");
  });

  it("does not retain advertising identifiers without marketing consent", () => {
    const state = updateAttributionState(null, {
      ...base,
      fbclid: "fb-click",
      gclid: "google-click",
      marketingConsent: false,
    });
    expect(state.firstTouch).toMatchObject({
      fbc: null,
      fbclid: null,
      fbp: null,
      gclid: null,
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  analyticsMeasurementAllowedForHost,
  marketingMeasurementAllowedForHost,
  measurementAllowedForHost,
  validGaMeasurementId,
  validMetaPixelId,
} from "./client";

describe("measurement environment isolation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("allows explicitly enabled production hosts only", () => {
    expect(measurementAllowedForHost("www.andrelook.store", true)).toBe(true);
    expect(measurementAllowedForHost("andrelook.store", true)).toBe(true);
    expect(
      measurementAllowedForHost("andrelook-v1-staging.vercel.app", true),
    ).toBe(false);
    expect(measurementAllowedForHost("localhost", true)).toBe(false);
    expect(measurementAllowedForHost("www.andrelook.store", false)).toBe(false);
  });

  it("accepts only valid GA4 measurement IDs", () => {
    expect(validGaMeasurementId("G-0NLE5DGQN2")).toBe("G-0NLE5DGQN2");
    expect(validGaMeasurementId("UA-123456-1")).toBeNull();
    expect(validGaMeasurementId("G-invalid id")).toBeNull();
    expect(validGaMeasurementId(undefined)).toBeNull();
  });

  it("accepts only valid Meta Pixel IDs", () => {
    expect(validMetaPixelId("3334309000107146")).toBe("3334309000107146");
    expect(validMetaPixelId("pixel-3334309000107146")).toBeNull();
    expect(validMetaPixelId("12345")).toBeNull();
    expect(validMetaPixelId(undefined)).toBeNull();
  });

  it("requires analytics consent, a valid ID and an enabled production host", () => {
    expect(
      analyticsMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "G-0NLE5DGQN2",
        true,
      ),
    ).toBe(true);
    expect(
      analyticsMeasurementAllowedForHost(
        "www.andrelook.store",
        false,
        "G-0NLE5DGQN2",
        true,
      ),
    ).toBe(false);
    expect(
      analyticsMeasurementAllowedForHost(
        "andrelook-v1-staging.vercel.app",
        true,
        "G-0NLE5DGQN2",
        true,
      ),
    ).toBe(false);
    expect(
      analyticsMeasurementAllowedForHost(
        "localhost",
        true,
        "G-0NLE5DGQN2",
        true,
      ),
    ).toBe(false);
    expect(
      analyticsMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "UA-123456-1",
        true,
      ),
    ).toBe(false);
    expect(
      analyticsMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "G-0NLE5DGQN2",
        false,
      ),
    ).toBe(false);
  });

  it("requires marketing consent, a valid ID and an enabled production host", () => {
    expect(
      marketingMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "3334309000107146",
        true,
      ),
    ).toBe(true);
    expect(
      marketingMeasurementAllowedForHost(
        "www.andrelook.store",
        false,
        "3334309000107146",
        true,
      ),
    ).toBe(false);
    expect(
      marketingMeasurementAllowedForHost(
        "andrelook-v1-staging.vercel.app",
        true,
        "3334309000107146",
        true,
      ),
    ).toBe(false);
    expect(
      marketingMeasurementAllowedForHost(
        "localhost",
        true,
        "3334309000107146",
        true,
      ),
    ).toBe(false);
    expect(
      marketingMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "pixel-3334309000107146",
        true,
      ),
    ).toBe(false);
    expect(
      marketingMeasurementAllowedForHost(
        "www.andrelook.store",
        true,
        "3334309000107146",
        false,
      ),
    ).toBe(false);
  });

  it("loads after consent and stops future GA events after consent is revoked", async () => {
    vi.stubEnv("NEXT_PUBLIC_MEASUREMENT_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_GA4_MEASUREMENT_ID", "G-0NLE5DGQN2");
    const browserWindow: {
      dataLayer?: unknown[];
      location: { hostname: string };
    } = {
      location: { hostname: "www.andrelook.store" },
    };
    let appendedScript: unknown;
    const append = vi.fn((script: unknown) => {
      appendedScript = script;
    });
    vi.stubGlobal("window", browserWindow);
    vi.stubGlobal("document", {
      createElement: () => ({ async: false, dataset: {}, src: "" }),
      head: { append },
      querySelector: () => appendedScript ?? null,
    });
    vi.resetModules();
    const measurement = await import("./client");
    const necessaryOnly = {
      analytics: false,
      marketing: false,
      updatedAt: new Date(0).toISOString(),
      version: "g2-consent-v1" as const,
    };

    measurement.applyMeasurementConsent(necessaryOnly);
    measurement.trackPublicEvent("view_item", { item_id: "test" });
    expect(append).not.toHaveBeenCalled();
    expect(browserWindow.dataLayer).toBeUndefined();

    measurement.applyMeasurementConsent({
      ...necessaryOnly,
      analytics: true,
    });
    expect(append).toHaveBeenCalledOnce();
    measurement.trackPublicEvent("view_item", { item_id: "test" });
    expect(browserWindow.dataLayer).toContainEqual([
      "event",
      "view_item",
      { item_id: "test" },
    ]);
    measurement.applyMeasurementConsent({
      ...necessaryOnly,
      analytics: true,
    });
    expect(append).toHaveBeenCalledOnce();
    expect(
      browserWindow.dataLayer?.filter(
        (entry) => Array.isArray(entry) && entry[0] === "config",
      ),
    ).toHaveLength(1);

    measurement.applyMeasurementConsent(necessaryOnly);
    const eventCountAfterRevocation = browserWindow.dataLayer?.filter(
      (entry) => Array.isArray(entry) && entry[0] === "event",
    ).length;
    measurement.trackPublicEvent("view_item", { item_id: "blocked" });
    expect(
      browserWindow.dataLayer?.filter(
        (entry) => Array.isArray(entry) && entry[0] === "event",
      ),
    ).toHaveLength(eventCountAfterRevocation ?? 0);
    expect(browserWindow.dataLayer).toContainEqual([
      "consent",
      "update",
      { analytics_storage: "denied" },
    ]);
  });

  it("records first-party events only after analytics consent on a production host", async () => {
    vi.stubEnv("NEXT_PUBLIC_MEASUREMENT_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_GA4_MEASUREMENT_ID", "G-0NLE5DGQN2");
    const request = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const session = new Map<string, string>();
    vi.stubGlobal("fetch", request);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => session.set(key, value),
    });
    vi.stubGlobal("window", {
      location: {
        hostname: "www.andrelook.store",
        pathname: "/et/catalog/test",
      },
    });
    vi.stubGlobal("document", {
      createElement: () => ({ async: false, dataset: {}, src: "" }),
      head: { append: vi.fn() },
      querySelector: () => null,
    });
    vi.resetModules();
    const measurement = await import("./client");
    const consent = {
      analytics: false,
      marketing: false,
      updatedAt: new Date(0).toISOString(),
      version: "g2-consent-v1" as const,
    };
    measurement.applyMeasurementConsent(consent);
    measurement.trackPublicEvent("view_item", { item_id: "product-one" });
    expect(request).not.toHaveBeenCalled();

    measurement.applyMeasurementConsent({ ...consent, analytics: true });
    measurement.trackPublicEvent("view_item", { item_id: "product-one" });
    expect(request).toHaveBeenCalledOnce();
    expect(JSON.parse(request.mock.calls[0]![1].body as string)).toMatchObject({
      eventName: "VIEW_ITEM",
      pagePath: "/et/catalog/test",
      productId: "product-one",
      source: "DIRECT",
    });

    measurement.trackPublicEvent("preorder_cta_attempt", {
      item_id: "product-one",
    });
    measurement.trackPublicEvent("preorder_selection_required", {
      item_id: "product-one",
    });
    expect(request).toHaveBeenCalledTimes(3);
    expect(
      request.mock.calls.slice(1).map((call) => {
        const event = JSON.parse(call[1].body as string);
        return [event.eventName, event.productId];
      }),
    ).toEqual([
      ["PREORDER_CTA_ATTEMPT", "product-one"],
      ["PREORDER_SELECTION_REQUIRED", "product-one"],
    ]);
    expect(
      request.mock.calls.slice(1).every((call) => {
        const event = JSON.parse(call[1].body as string);
        return !JSON.stringify(event).includes("email");
      }),
    ).toBe(true);
    expect(
      (window as Window).dataLayer?.filter(
        (entry) =>
          Array.isArray(entry) &&
          ["preorder_cta_attempt", "preorder_selection_required"].includes(
            entry[1],
          ),
      ),
    ).toHaveLength(0);

    measurement.applyMeasurementConsent(consent);
    measurement.trackPublicEvent("preorder_open", { item_id: "product-one" });
    measurement.trackPublicEvent("preorder_cta_attempt", {
      item_id: "product-one",
    });
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("loads Meta once after marketing consent, allowlists payloads and stops after revocation", async () => {
    vi.stubEnv("NEXT_PUBLIC_MEASUREMENT_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "3334309000107146");
    const browserWindow: {
      _fbq?: ((...args: unknown[]) => void) & { queue: unknown[][] };
      fbq?: ((...args: unknown[]) => void) & { queue: unknown[][] };
      location: { hostname: string };
    } = {
      location: { hostname: "www.andrelook.store" },
    };
    let appendedScript: unknown;
    const append = vi.fn((script: unknown) => {
      appendedScript = script;
    });
    vi.stubGlobal("window", browserWindow);
    vi.stubGlobal("document", {
      createElement: () => ({ async: false, dataset: {}, src: "" }),
      head: { append },
      querySelector: () => appendedScript ?? null,
    });
    vi.resetModules();
    const measurement = await import("./client");
    const necessaryOnly = {
      analytics: false,
      marketing: false,
      updatedAt: new Date(0).toISOString(),
      version: "g2-consent-v1" as const,
    };

    measurement.applyMeasurementConsent(necessaryOnly);
    measurement.applyMeasurementConsent({
      ...necessaryOnly,
      analytics: true,
    });
    expect(append).not.toHaveBeenCalled();
    expect(browserWindow.fbq).toBeUndefined();

    measurement.applyMeasurementConsent({
      ...necessaryOnly,
      marketing: true,
    });
    expect(append).toHaveBeenCalledOnce();
    expect(browserWindow.fbq?.queue).toEqual([
      ["init", "3334309000107146"],
      ["track", "PageView"],
    ]);
    expect(browserWindow._fbq).toBe(browserWindow.fbq);

    measurement.applyMeasurementConsent({
      ...necessaryOnly,
      marketing: true,
    });
    expect(append).toHaveBeenCalledOnce();
    expect(
      browserWindow.fbq?.queue.filter(
        (entry) => entry[0] === "init" || entry[1] === "PageView",
      ),
    ).toHaveLength(2);

    measurement.trackPublicEvent("view_item", {
      currency: "EUR",
      items: [
        {
          currency: "EUR",
          item_brand: "Private brand field",
          item_category: "Private category field",
          item_id: "AL-LEGACY-001",
          item_name: "Maya Down Jacket",
          price: 259,
        },
      ],
      value: 259,
    });
    expect(browserWindow.fbq?.queue).toContainEqual([
      "track",
      "ViewContent",
      {
        content_ids: ["AL-LEGACY-001"],
        content_name: "Maya Down Jacket",
        content_type: "product",
        value: 259,
        currency: "EUR",
      },
    ]);

    measurement.trackPublicEvent(
      "preorder_submit",
      {
        item_id: "AL-LEGACY-001",
        item_name: "Maya Down Jacket",
        locale: "et",
      },
      { eventId: "11111111-1111-4111-8111-111111111111" },
    );
    expect(browserWindow.fbq?.queue).toContainEqual([
      "track",
      "Lead",
      {
        content_ids: ["AL-LEGACY-001"],
        content_name: "Maya Down Jacket",
        content_type: "product",
      },
      { eventID: "11111111-1111-4111-8111-111111111111" },
    ]);
    const pixelQueueLength = browserWindow.fbq?.queue.length ?? 0;
    measurement.trackPublicEvent("preorder_cta_attempt", {
      item_id: "AL-LEGACY-001",
    });
    measurement.trackPublicEvent("preorder_selection_required", {
      item_id: "AL-LEGACY-001",
    });
    expect(browserWindow.fbq?.queue).toHaveLength(pixelQueueLength);
    expect(JSON.stringify(browserWindow.fbq?.queue)).not.toContain(
      "Private brand field",
    );
    expect(JSON.stringify(browserWindow.fbq?.queue)).not.toContain(
      "Private category field",
    );
    expect(JSON.stringify(browserWindow.fbq?.queue)).not.toContain("locale");
    expect(JSON.stringify(browserWindow.fbq?.queue)).not.toContain("Purchase");

    measurement.applyMeasurementConsent(necessaryOnly);
    const eventCountAfterRevocation = browserWindow.fbq?.queue.length ?? 0;
    measurement.trackPublicEvent("view_item", {
      item_id: "blocked",
      item_name: "Blocked event",
    });
    expect(browserWindow.fbq?.queue).toHaveLength(eventCountAfterRevocation);
  });
});

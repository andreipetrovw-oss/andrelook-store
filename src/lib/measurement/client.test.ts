import { afterEach, describe, expect, it, vi } from "vitest";

import {
  analyticsMeasurementAllowedForHost,
  measurementAllowedForHost,
  validGaMeasurementId,
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
});

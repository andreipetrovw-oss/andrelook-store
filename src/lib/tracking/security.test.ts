import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createTrackingToken,
  safeProviderError,
  verifyBearerSecret,
  verifySeventeenTrackSignature,
} from "./security";

describe("tracking security", () => {
  it("creates opaque high-entropy tokens", () => {
    const first = createTrackingToken();
    const second = createTrackingToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
  });

  it("verifies the documented 17TRACK body/key signature", () => {
    const body = '{"event":"TRACKING_UPDATED"}';
    const token = "secret";
    const signature = createHash("sha256")
      .update(`${body}/${token}`)
      .digest("hex");
    expect(verifySeventeenTrackSignature(body, signature, token)).toBe(true);
    expect(verifySeventeenTrackSignature(`${body} `, signature, token)).toBe(
      false,
    );
  });

  it("validates fallback webhook bearer auth and redacts errors", () => {
    expect(verifyBearerSecret("Bearer webhook-secret", "webhook-secret")).toBe(
      true,
    );
    expect(verifyBearerSecret("Bearer wrong", "webhook-secret")).toBe(false);
    expect(
      safeProviderError(new Error("token ABCDEFGHIJK failed")),
    ).not.toContain("ABCDEFGHIJK");
  });
});

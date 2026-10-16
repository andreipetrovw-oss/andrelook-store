import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createTrackingCredentials,
  createTrackingToken,
  decryptTrackingAccessCode,
  hashTrackingAccessCode,
  normalizeTrackingAccessCode,
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

  it("creates a separate encrypted eight-character access code", () => {
    const credentials = createTrackingCredentials();
    expect(credentials.accessCode).toMatch(
      /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/,
    );
    expect(credentials.accessCode).not.toContain("0");
    expect(credentials.accessCode).not.toContain("O");
    expect(credentials.accessCode).not.toContain("I");
    expect(credentials.publicTrackingToken).not.toContain(
      normalizeTrackingAccessCode(credentials.accessCode),
    );
    expect(credentials.trackingAccessCodeEncrypted).not.toContain(
      normalizeTrackingAccessCode(credentials.accessCode),
    );
    expect(
      decryptTrackingAccessCode(credentials.trackingAccessCodeEncrypted),
    ).toBe(credentials.accessCode);
    expect(hashTrackingAccessCode(credentials.accessCode)).toBe(
      credentials.trackingAccessCodeHash,
    );
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

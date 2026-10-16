import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export {
  createTrackingAccessCode,
  createTrackingCredentials,
  createTrackingToken,
  decryptTrackingAccessCode,
  encryptTrackingAccessCode,
  formatTrackingAccessCode,
  hashTrackingAccessCode,
  normalizeTrackingAccessCode,
} from "./credentials";

export function hashLookupBucket(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifySeventeenTrackSignature(
  rawBody: string,
  receivedSignature: string | null,
  token: string,
) {
  if (!receivedSignature || !token) return false;
  const expected = createHash("sha256")
    .update(`${rawBody}/${token}`, "utf8")
    .digest("hex");
  const received = receivedSignature.trim().toLowerCase();
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function verifyBearerSecret(
  authorization: string | null,
  expectedSecret: string,
) {
  if (!authorization?.startsWith("Bearer ") || !expectedSecret) return false;
  const received = authorization.slice("Bearer ".length);
  if (received.length !== expectedSecret.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expectedSecret));
}

export function safeProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/[A-Z0-9]{8,}/gi, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .slice(0, 300);
}

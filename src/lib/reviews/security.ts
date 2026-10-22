import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export function validReviewToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function reviewHash(value: string) {
  return createHash("sha256")
    .update(`andrelook-reviews-v1:${value}`)
    .digest("hex");
}

function key() {
  const secret = process.env.TRACKING_ACCESS_CODE_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Review credentials are unavailable.");
  return createHash("sha256")
    .update(`andrelook-review-encryption-v1:${secret}`)
    .digest();
}

export function newReviewCredentials() {
  const token = randomBytes(32).toString("base64url");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  return {
    tokenHash: reviewHash(token),
    tokenEncrypted: [iv, cipher.getAuthTag(), encrypted]
      .map((v) => v.toString("base64url"))
      .join("."),
  };
}

export function invitationToken(encrypted: string) {
  const [iv, tag, value] = encrypted.split(".");
  if (!iv || !tag || !value)
    throw new Error("Review credentials are unavailable.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(value, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

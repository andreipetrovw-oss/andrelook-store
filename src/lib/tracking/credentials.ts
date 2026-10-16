import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

const accessCodeAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const accessCodePattern = /^[2-9A-HJ-NP-Z]{8}$/;

function accessCodeSecret() {
  const value = process.env.TRACKING_ACCESS_CODE_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "test") {
    return "andrelook-tracking-test-secret-only-0001";
  }
  throw new Error(
    "TRACKING_ACCESS_CODE_SECRET must contain at least 32 characters.",
  );
}

function encryptionKey() {
  return createHash("sha256").update(accessCodeSecret()).digest();
}

export function createTrackingToken() {
  return randomBytes(32).toString("base64url");
}

export function normalizeTrackingAccessCode(value: string) {
  return value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "");
}

export function formatTrackingAccessCode(value: string) {
  const normalized = normalizeTrackingAccessCode(value);
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

export function createTrackingAccessCode() {
  const bytes = randomBytes(8);
  return Array.from(bytes, (value) => accessCodeAlphabet[value & 31]).join("");
}

export function hashTrackingAccessCode(value: string) {
  const normalized = normalizeTrackingAccessCode(value);
  if (!accessCodePattern.test(normalized)) return null;
  return createHmac("sha256", accessCodeSecret())
    .update(normalized)
    .digest("hex");
}

export function encryptTrackingAccessCode(value: string) {
  const normalized = normalizeTrackingAccessCode(value);
  if (!accessCodePattern.test(normalized)) {
    throw new Error("Invalid tracking access code.");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptTrackingAccessCode(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted access code.");
  const [ivValue, tagValue, encryptedValue] = parts;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue!, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue!, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue!, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  return formatTrackingAccessCode(decrypted);
}

export function createTrackingCredentials() {
  const accessCode = createTrackingAccessCode();
  return {
    accessCode: formatTrackingAccessCode(accessCode),
    publicTrackingToken: createTrackingToken(),
    trackingAccessCodeEncrypted: encryptTrackingAccessCode(accessCode),
    trackingAccessCodeHash: hashTrackingAccessCode(accessCode)!,
    trackingCredentialsRotatedAt: new Date(),
  };
}

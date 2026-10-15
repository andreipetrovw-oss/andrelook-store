import type {
  ProviderEvent,
  ProviderSnapshot,
  RegisterShipmentInput,
} from "../types";

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function asDate(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function eventId(parts: Array<string | null>) {
  return parts.map((part) => part ?? "").join("|");
}

export async function providerPost(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs = 30_000,
) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `Tracking provider request failed with HTTP ${response.status}.`,
    );
  }
  return payload;
}

export function unavailableSnapshot(
  provider: ProviderSnapshot["provider"],
  raw: unknown,
): ProviderSnapshot {
  return {
    carrierCode: null,
    carrierName: null,
    estimatedDeliveryAt: null,
    events: [],
    provider,
    providerTrackingId: null,
    raw,
    rawStatus: null,
    syncStatus: "UNAVAILABLE",
  };
}

export function sortEvents(events: ProviderEvent[]) {
  return events.toSorted((left, right) => {
    if (!left.occurredAt) return -1;
    if (!right.occurredAt) return 1;
    return left.occurredAt.valueOf() - right.occurredAt.valueOf();
  });
}

export function providerInput(input: RegisterShipmentInput) {
  return {
    ...(input.carrierCode && /^\d+$/.test(input.carrierCode)
      ? { carrier: Number(input.carrierCode) }
      : {}),
    number: input.trackingNumber,
  };
}

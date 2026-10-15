import "server-only";

import type {
  ProviderEvent,
  ProviderSnapshot,
  RegisterShipmentInput,
  TrackingProviderAdapter,
} from "../types";
import {
  asArray,
  asDate,
  asRecord,
  asString,
  eventId,
  providerInput,
  providerPost,
  sortEvents,
  unavailableSnapshot,
} from "./shared";

const baseUrl = "https://api.17track.net/track/v2.4";

function trackingObject(payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const accepted = asArray(data?.accepted);
  return asRecord(accepted[0]) ?? asRecord(data) ?? null;
}

export function parseSeventeenTrackSnapshot(
  payload: unknown,
): ProviderSnapshot {
  const item = trackingObject(payload);
  if (!item) return unavailableSnapshot("SEVENTEEN_TRACK", payload);
  const trackInfo = asRecord(item.track_info) ?? asRecord(item.trackInfo);
  const latestStatus = asRecord(trackInfo?.latest_status);
  const providers = asArray(
    trackInfo?.tracking && asRecord(trackInfo.tracking)?.providers,
  );
  const provider = asRecord(providers[0]);
  const providerInfo = asRecord(provider?.provider);
  const providerEvents = asArray(provider?.events);
  const fallbackLatest = asRecord(trackInfo?.latest_event);
  const rawEvents = providerEvents.length
    ? providerEvents
    : fallbackLatest
      ? [fallbackLatest]
      : [];
  const events: ProviderEvent[] = rawEvents.flatMap((value, index) => {
    const event = asRecord(value);
    if (!event) return [];
    const occurredAt = asDate(event.time_utc) ?? asDate(event.time_iso);
    const status = asString(event.sub_status) ?? asString(event.stage);
    const description =
      asString(asRecord(event.description_translation)?.description) ??
      asString(event.description);
    const location = asString(event.location);
    return [
      {
        description,
        id: eventId([
          asString(event.time_utc) ?? asString(event.time_iso),
          status,
          description,
          location,
          String(index),
        ]),
        location,
        occurredAt,
        stage: asString(event.stage),
        status,
      },
    ];
  });
  const latestSyncStatus = asString(provider?.latest_sync_status);
  const listSyncStatus = item.sync_status;
  const rawStatus =
    asString(latestStatus?.sub_status) ??
    asString(latestStatus?.status) ??
    asString(item.tracking_status) ??
    asString(item.package_status);
  const notFound = rawStatus?.toLowerCase().includes("notfound") ?? false;
  const failed = latestSyncStatus?.toLowerCase() === "failure";
  const estimate = asRecord(
    asRecord(trackInfo?.time_metrics)?.estimated_delivery_date,
  );
  return {
    carrierCode:
      providerInfo?.key === undefined
        ? item.carrier === undefined
          ? null
          : String(item.carrier)
        : String(providerInfo.key),
    carrierName: asString(providerInfo?.name),
    estimatedDeliveryAt: asDate(estimate?.to) ?? asDate(estimate?.from) ?? null,
    events: sortEvents(events),
    provider: "SEVENTEEN_TRACK",
    providerTrackingId: null,
    raw: payload,
    rawStatus,
    syncStatus:
      failed || listSyncStatus === false
        ? "FAILURE"
        : notFound
          ? "NOT_FOUND"
          : latestSyncStatus || listSyncStatus === true || events.length
            ? "SUCCESS"
            : "PENDING",
  };
}

export class SeventeenTrackAdapter implements TrackingProviderAdapter {
  readonly provider = "SEVENTEEN_TRACK" as const;

  constructor(private readonly token: string) {}

  private call(path: string, body: unknown, timeoutMs?: number) {
    return providerPost(
      `${baseUrl}/${path}`,
      { "17token": this.token },
      body,
      timeoutMs,
    );
  }

  async register(input: RegisterShipmentInput) {
    const payload = await this.call("register", [providerInput(input)]);
    const root = asRecord(payload);
    const data = asRecord(root?.data);
    const rejected = asArray(data?.rejected);
    if (rejected.length) {
      const error = asRecord(asRecord(rejected[0])?.error);
      const code = error?.code;
      const message = asString(error?.message);
      return {
        ...unavailableSnapshot("SEVENTEEN_TRACK", payload),
        rawStatus: [code, message].filter(Boolean).join(": ") || "REJECTED",
        syncStatus:
          code === -18019903 || message?.toLowerCase().includes("carrier")
            ? ("NOT_FOUND" as const)
            : ("FAILURE" as const),
      };
    }
    return parseSeventeenTrackSnapshot(payload);
  }

  async getTracking(input: RegisterShipmentInput) {
    const details = await this.call("gettrackinfo", [providerInput(input)]);
    const parsed = parseSeventeenTrackSnapshot(details);
    if (parsed.syncStatus !== "UNAVAILABLE") return parsed;
    const list = await this.call("gettracklist", {
      number: input.trackingNumber,
    });
    return parseSeventeenTrackSnapshot(list);
  }

  async getRealTimeTracking(input: RegisterShipmentInput) {
    const payload = await this.call(
      "getRealTimeTrackInfo",
      [{ ...providerInput(input), cacheLevel: "Standard" }],
      35_000,
    );
    return parseSeventeenTrackSnapshot(payload);
  }
}

export function parseSeventeenTrackWebhook(payload: unknown) {
  const root = asRecord(payload);
  const event = asString(root?.event);
  const data = root?.data;
  const values = asArray(asRecord(data)?.accepted);
  const records = values.length ? values : data ? [data] : [];
  return {
    event,
    records: records.flatMap((record) => {
      const value = asRecord(record);
      const number = asString(value?.number);
      return number
        ? [
            {
              number,
              snapshot: parseSeventeenTrackSnapshot({
                data: { accepted: [record] },
              }),
            },
          ]
        : [];
    }),
  };
}

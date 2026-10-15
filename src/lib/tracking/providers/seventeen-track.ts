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

function providerError(payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const rejected = asRecord(asArray(data?.rejected)[0]);
  const rejectedError = asRecord(rejected?.error);
  const rootError = asRecord(asArray(data?.errors)[0]);
  const code = rejectedError?.code ?? rootError?.code ?? root?.code ?? null;
  const message =
    asString(rejectedError?.message) ??
    asString(rootError?.message) ??
    asString(root?.message);
  if (typeof code !== "number" || code === 0) return null;
  return {
    carrierCode:
      rejected?.carrier === undefined || rejected.carrier === null
        ? null
        : String(rejected.carrier),
    code,
    message,
  };
}

function errorSyncStatus(code: number) {
  if (code === -18019901) return "PENDING" as const;
  if (code === -18019903 || code === -18019909) return "NOT_FOUND" as const;
  if (code === -18019912 || code === -18019818) return "UNAVAILABLE" as const;
  return "FAILURE" as const;
}

export function parseSeventeenTrackSnapshot(
  payload: unknown,
): ProviderSnapshot {
  const error = providerError(payload);
  if (error) {
    return {
      ...unavailableSnapshot("SEVENTEEN_TRACK", payload),
      carrierCode: error.carrierCode,
      rawStatus: [error.code, error.message].filter(Boolean).join(": "),
      syncStatus: errorSyncStatus(error.code),
    };
  }
  const item = trackingObject(payload);
  if (!item) return unavailableSnapshot("SEVENTEEN_TRACK", payload);
  const trackInfo = asRecord(item.track_info) ?? asRecord(item.trackInfo);
  const latestStatus = asRecord(trackInfo?.latest_status);
  const providers = asArray(
    trackInfo?.tracking && asRecord(trackInfo.tracking)?.providers,
  );
  const requestedCarrier =
    item.carrier === undefined || item.carrier === null
      ? null
      : String(item.carrier);
  const provider =
    providers.map(asRecord).find((candidate) => {
      const key = asRecord(candidate?.provider)?.key;
      return requestedCarrier !== null && String(key) === requestedCarrier;
    }) ??
    providers
      .map(asRecord)
      .find((candidate) => asArray(candidate?.events).length) ??
    asRecord(providers[0]);
  const providerInfo = asRecord(provider?.provider);
  const providerEvents = providers.flatMap((candidate) => {
    const record = asRecord(candidate);
    const key = asRecord(record?.provider)?.key;
    return asArray(record?.events).map((event) => ({ event, key }));
  });
  const fallbackLatest = asRecord(trackInfo?.latest_event);
  const rawEvents = providerEvents.length
    ? providerEvents
    : fallbackLatest
      ? [{ event: fallbackLatest, key: providerInfo?.key }]
      : [];
  const events: ProviderEvent[] = rawEvents.flatMap((value, index) => {
    const event = asRecord(value.event);
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
          value.key === undefined || value.key === null
            ? null
            : String(value.key),
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
    asString(item.package_status) ??
    asString(item.tracking_status);
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
    return parseSeventeenTrackSnapshot(payload);
  }

  async getTracking(input: RegisterShipmentInput) {
    const details = await this.call("gettrackinfo", [providerInput(input)]);
    const parsed = parseSeventeenTrackSnapshot(details);
    if (
      parsed.syncStatus !== "UNAVAILABLE" &&
      !(parsed.syncStatus === "NOT_FOUND" && !parsed.carrierCode)
    ) {
      return parsed;
    }
    const list = await this.call("gettracklist", {
      number: input.trackingNumber,
    });
    const listed = parseSeventeenTrackSnapshot(list);
    return listed.syncStatus === "UNAVAILABLE" ? parsed : listed;
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

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
  providerPost,
  sortEvents,
  unavailableSnapshot,
} from "./shared";

const baseUrl = "https://api.ship24.com/public/v1";

function snapshot(payload: unknown): ProviderSnapshot {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const trackings = asArray(data?.trackings);
  const tracking = asRecord(trackings[0]) ?? asRecord(data?.tracking) ?? data;
  if (!tracking) return unavailableSnapshot("SHIP24", payload);
  const shipment = asRecord(tracking.shipment);
  const delivery = asRecord(shipment?.delivery);
  const tracker = asRecord(tracking.tracker);
  const events: ProviderEvent[] = asArray(tracking.events).flatMap(
    (value, index) => {
      const event = asRecord(value);
      if (!event) return [];
      const occurredAt =
        asDate(event.datetime) ??
        asDate(event.occurrenceDatetime) ??
        asDate(event.datetimeUtc);
      const status =
        asString(event.statusCode) ??
        asString(event.status) ??
        asString(event.statusCategory) ??
        asString(event.statusMilestone);
      const description = asString(event.status) ?? asString(event.description);
      const location = asString(event.location);
      return [
        {
          description,
          id:
            asString(event.eventId) ??
            eventId([
              asString(event.datetime) ?? asString(event.occurrenceDatetime),
              status,
              description,
              location,
              String(index),
            ]),
          location,
          occurredAt,
          stage:
            asString(event.statusMilestone) ?? asString(event.statusCategory),
          status,
        },
      ];
    },
  );
  const couriers = asArray(shipment?.recognizedCouriers);
  const courier = asRecord(couriers[0]);
  const rawStatus =
    asString(shipment?.statusMilestone) ??
    asString(shipment?.statusCode) ??
    asString(shipment?.statusCategory) ??
    asString(tracking.status);
  return {
    carrierCode: asString(courier?.courierCode),
    carrierName: asString(courier?.courierName),
    estimatedDeliveryAt:
      asDate(delivery?.estimatedDeliveryDate) ??
      asDate(delivery?.aiPredictiveDeliveryDate) ??
      asDate(shipment?.deliveryDate) ??
      asDate(shipment?.estimatedDeliveryDate) ??
      null,
    events: sortEvents(events),
    provider: "SHIP24",
    providerTrackingId:
      asString(tracker?.trackerId) ?? asString(tracking.trackerId),
    raw: payload,
    rawStatus,
    syncStatus: events.length || rawStatus ? "SUCCESS" : "NOT_FOUND",
  };
}

export class Ship24Adapter implements TrackingProviderAdapter {
  readonly provider = "SHIP24" as const;

  constructor(private readonly apiKey: string) {}

  private call(path: string, body: unknown) {
    return providerPost(
      `${baseUrl}${path}`,
      { Authorization: `Bearer ${this.apiKey}` },
      body,
      65_000,
    );
  }

  async register(input: RegisterShipmentInput) {
    return this.getTracking(input);
  }

  async getTracking(input: RegisterShipmentInput) {
    const payload = await this.call("/trackers/track", {
      clientTrackerId: input.shipmentId,
      trackingNumber: input.trackingNumber,
    });
    return snapshot(payload);
  }
}

export function parseShip24Webhook(payload: unknown) {
  const root = asRecord(payload);
  const trackings = asArray(root?.trackings ?? asRecord(root?.data)?.trackings);
  return trackings.flatMap((tracking) => {
    const record = asRecord(tracking);
    const tracker = asRecord(record?.tracker);
    const number =
      asString(tracker?.trackingNumber) ?? asString(record?.trackingNumber);
    return number
      ? [{ number, snapshot: snapshot({ data: { trackings: [tracking] } }) }]
      : [];
  });
}

import type {
  ShipmentKind,
  ShipmentProvider,
  ShipmentStatus,
  ShipmentSyncStatus,
} from "@prisma/client";

export type ProviderEvent = {
  description: string | null;
  id: string;
  location: string | null;
  occurredAt: Date | null;
  stage: string | null;
  status: string | null;
};

export type ProviderSnapshot = {
  carrierCode: string | null;
  carrierName: string | null;
  estimatedDeliveryAt: Date | null;
  estimatedDeliveryFrom: Date | null;
  estimatedDeliveryTo: Date | null;
  events: ProviderEvent[];
  provider: ShipmentProvider;
  providerTrackingId: string | null;
  raw: unknown;
  rawStatus: string | null;
  syncStatus: ShipmentSyncStatus;
};

export type RegisterShipmentInput = {
  carrierCode?: string | null;
  shipmentId: string;
  trackingNumber: string;
};

export type TrackingProviderAdapter = {
  getTracking(input: RegisterShipmentInput): Promise<ProviderSnapshot>;
  getRealTimeTracking?(input: RegisterShipmentInput): Promise<ProviderSnapshot>;
  provider: ShipmentProvider;
  register(input: RegisterShipmentInput): Promise<ProviderSnapshot>;
};

export type StatusCandidate = {
  occurredAt: Date | null;
  status: ShipmentStatus;
};

export type ShipmentForNormalization = {
  kind: ShipmentKind;
  normalizedStatus: ShipmentStatus;
};

export type PublicTrackingLocale = "ET" | "RU" | "EN";

export type PublicTrackingCurrentStatus =
  | "TRACKING_ADDED"
  | "ORDER_CONFIRMED"
  | "PREPARING"
  | "LOGISTICS_REGISTERED"
  | "IN_TRANSIT"
  | "ARRIVED_IN_ESTONIA"
  | "READY_FOR_HANDOVER"
  | "LOCAL_DELIVERY"
  | "DELIVERED";

export type PublicTrackingMilestoneStatus =
  | PublicTrackingCurrentStatus
  | "INTERNATIONAL_LOGISTICS_ACCEPTED"
  | "AIR_TRANSPORT_HANDOFF"
  | "INTERNATIONAL_TRANSIT_STARTED"
  | "ARRIVED_IN_EUROPE"
  | "EUROPE_PROCESSING_AWAITING_CUSTOMS";

export type PublicTrackingStatus = PublicTrackingCurrentStatus;

export type PublicTrackingEvent = {
  label: string;
  occurredAt: string | null;
  status: PublicTrackingMilestoneStatus;
};

export type PublicTrackingOrder = {
  carrierName: string | null;
  deliveryMethod: string;
  estimatedDeliveryFrom: string | null;
  estimatedDeliveryTo: string | null;
  items: Array<{
    colour: string | null;
    name: string;
    quantity: number;
    size: string | null;
  }>;
  lastUpdatedAt: string | null;
  locale: PublicTrackingLocale;
  reference: string;
  status: PublicTrackingStatus;
  statusLabel: string;
  timeline: PublicTrackingEvent[];
  trackingNumber: string | null;
};

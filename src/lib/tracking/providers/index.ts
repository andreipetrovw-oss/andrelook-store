import "server-only";

import type { ShipmentProvider } from "@prisma/client";

import { getServerConfig } from "@/lib/env";

import type { TrackingProviderAdapter } from "../types";
import { SeventeenTrackAdapter } from "./seventeen-track";
import { Ship24Adapter } from "./ship24";

export function getTrackingAdapter(
  provider: ShipmentProvider,
): TrackingProviderAdapter | null {
  const config = getServerConfig();
  if (provider === "SEVENTEEN_TRACK" && config.seventeenTrackToken) {
    return new SeventeenTrackAdapter(config.seventeenTrackToken);
  }
  if (provider === "SHIP24" && config.ship24ApiKey) {
    return new Ship24Adapter(config.ship24ApiKey);
  }
  return null;
}

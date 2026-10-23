import "server-only";

import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";

type JsonObject = { [key: string]: Prisma.JsonValue };

function stableJson(value: Prisma.JsonValue): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as JsonObject)
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sizeGuideEvidence(
  chartData: Prisma.JsonValue | null | undefined,
  units: string | null | undefined,
) {
  if (!chartData) {
    return {
      sizeGuideAvailable: false,
      sizeGuideSnapshot: undefined,
      sizeGuideVersion: null,
    };
  }
  const snapshot = {
    chartData,
    units: units ?? null,
  } satisfies Prisma.InputJsonValue;
  return {
    sizeGuideAvailable: true,
    sizeGuideSnapshot: snapshot,
    sizeGuideVersion: createHash("sha256")
      .update(stableJson(snapshot))
      .digest("hex"),
  };
}

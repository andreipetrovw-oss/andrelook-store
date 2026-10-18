import type { LogisticsEvidenceEventType } from "@prisma/client";

import type { OwnerEvidenceInput } from "./owner-evidence";
import { parseEvidenceLocalDateTime, parseTallinnDate } from "./time";

const EVENT_PATTERNS: Array<{
  customerVisible: boolean;
  eventType: LogisticsEvidenceEventType;
  patterns: RegExp[];
}> = [
  {
    customerVisible: true,
    eventType: "LOGISTICS_INSTRUCTION_PROVIDED",
    patterns: [
      /shipment instruction.*provided electronically/i,
      /logistics instruction.*provided/i,
    ],
  },
  {
    customerVisible: false,
    eventType: "LOGISTICS_INFORMATION_RECEIVED",
    patterns: [
      /electronic (?:goods|shipment).*information received/i,
      /shipment information received/i,
    ],
  },
  {
    customerVisible: false,
    eventType: "MOVING_TO_CARRIER_WAREHOUSE",
    patterns: [/on the way to (?:the )?carrier warehouse/i],
  },
  {
    customerVisible: true,
    eventType: "INTERNATIONAL_LOGISTICS_ACCEPTED",
    patterns: [/arrived at (?:the )?receiving point/i],
  },
  {
    customerVisible: true,
    eventType: "AIR_TRANSPORT_HANDOFF",
    patterns: [
      /express parcel outbound/i,
      /sent to (?:the )?airline company/i,
      /handed over for air transport/i,
    ],
  },
  {
    customerVisible: false,
    eventType: "FLIGHT_BOOKED",
    patterns: [/flight (?:has been )?booked/i],
  },
  {
    customerVisible: true,
    eventType: "INTERNATIONAL_TRANSIT_STARTED",
    patterns: [/flight (?:has )?(?:departed|departure)/i],
  },
  {
    customerVisible: true,
    eventType: "ARRIVED_IN_EUROPE",
    patterns: [/flight (?:has )?landed in europe/i],
  },
  {
    customerVisible: true,
    eventType: "EUROPE_PROCESSING_AWAITING_CUSTOMS",
    patterns: [/awaiting customs clearance/i, /waiting for customs clearance/i],
  },
];

const dateTimePattern =
  /(?<date>20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})[ T](?<time>\d{1,2}:\d{2})/;
const etaPattern =
  /(?:ETA|estimated\s+(?:delivery|arrival))(?:\s+(?:shown|date|is))?\s*[:：-]?\s*(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})/i;

function normalizedDate(value: string) {
  const [year, month, day] = value.split(/[-/.]/);
  if (!year || !month || !day) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function recognizedEvent(description: string) {
  return EVENT_PATTERNS.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(description)),
  );
}

function ignorableLine(line: string) {
  return /^(?:tracking history|logistics tracking|status\s*:\s*transit|transit)$/i.test(
    line,
  );
}

export type ParsedSuperbuyHistory = {
  eta: { date: Date; note: string } | null;
  evidence: Array<OwnerEvidenceInput & { canonicalKey: string }>;
  unrecognized: string[];
};

export function buildSuperbuyImportPreview(
  parsed: ParsedSuperbuyHistory,
  existingCanonicalKeys: Iterable<string>,
  currentEta: { from: Date | null; to: Date | null },
) {
  const existing = new Set(existingCanonicalKeys);
  return {
    etaProposed: Boolean(
      parsed.eta &&
      (currentEta.from?.valueOf() !== parsed.eta.date.valueOf() ||
        currentEta.to?.valueOf() !== parsed.eta.date.valueOf()),
    ),
    newEvidence: parsed.evidence.filter(
      ({ canonicalKey }) => !existing.has(canonicalKey),
    ),
  };
}

export function parseSuperbuyTrackingHistory(
  rawText: string,
  shipmentId: string,
): ParsedSuperbuyHistory {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const evidence: ParsedSuperbuyHistory["evidence"] = [];
  const unrecognized: string[] = [];
  let eta: ParsedSuperbuyHistory["eta"] = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const etaMatch = line.match(etaPattern);
    if (etaMatch?.[1]) {
      const dateText = normalizedDate(etaMatch[1]);
      const date = dateText ? parseTallinnDate(dateText) : null;
      if (date) {
        eta = {
          date,
          note: `Owner-verified upstream logistics estimate: ${dateText}. Non-guaranteed estimate.`,
        };
      } else {
        unrecognized.push(line);
      }
      continue;
    }

    const dateMatch = line.match(dateTimePattern);
    if (!dateMatch?.groups?.date || !dateMatch.groups.time) {
      if (!ignorableLine(line)) unrecognized.push(line);
      continue;
    }
    const date = normalizedDate(dateMatch.groups.date);
    const time = dateMatch.groups.time.padStart(5, "0");
    if (!date) {
      unrecognized.push(line);
      continue;
    }
    const sourceTimestampText = `${date} ${time}`;
    let description = line.slice((dateMatch.index ?? 0) + dateMatch[0].length);
    description = description.replace(/^[\s:：—–-]+/, "").trim();
    if (!description && lines[index + 1]) {
      description = lines[index + 1]!;
      index += 1;
    }
    const matched = recognizedEvent(description);
    const eventTimestamp = parseEvidenceLocalDateTime(
      sourceTimestampText.replace(" ", "T"),
      "Asia/Shanghai",
    );
    if (!matched || !eventTimestamp) {
      unrecognized.push(`${sourceTimestampText} ${description}`.trim());
      continue;
    }
    evidence.push({
      canonicalKey: `owner-verified-upstream:${sourceTimestampText}:${matched.eventType}`,
      customerVisible: matched.customerVisible,
      eventTimestamp,
      eventType: matched.eventType,
      evidenceNote: description,
      internalLocation: null,
      internalReference: null,
      shipmentId,
      sourceLabel: "Superbuy (owner verified)",
      sourceTimestampText,
      sourceTimeZone: "Asia/Shanghai",
      sourceType: "OWNER_VERIFIED_LOGISTICS",
      verificationStatus: "VERIFIED",
    });
  }

  return {
    eta,
    evidence: [
      ...new Map(evidence.map((item) => [item.canonicalKey, item])).values(),
    ],
    unrecognized: [...new Set(unrecognized)],
  };
}

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type EvidenceRecord = {
  canonicalKey: string;
  createdAt: Date;
  createdByAdminId: string;
  customerVisible: boolean;
  eventTimestamp: Date | null;
  eventType: Parameters<
    typeof import("./owner-evidence").normalizedStatusForOwnerEvidence
  >[0];
  evidenceNote: string;
  id: string;
  internalLocation: string | null;
  internalReference: string | null;
  revision: number;
  shipmentId: string;
  sourceLabel: string;
  sourceTimestampText: string | null;
  sourceTimeZone: string | null;
  sourceType: "OWNER_VERIFIED_LOGISTICS" | "SUPPORTED_UPSTREAM_PROVIDER";
  supersedesId: string | null;
  verificationStatus: "PENDING_REVIEW" | "VERIFIED" | "VOIDED";
};

let evidenceRecords: EvidenceRecord[] = [];
let shipmentState = {
  etaEvidenceNote: null as string | null,
  etaFrom: null as Date | null,
  etaSource: null as string | null,
  etaTo: null as Date | null,
  etaWindowSource: null as string | null,
  lastConfirmedEventAt: new Date("2026-10-04T09:00:00Z") as Date | null,
  normalizedStatus: "ORDER_CONFIRMED" as string,
  requiresOwnerReview: false,
};
let evidenceSequence = 0;
const shipmentUpdate = vi.fn(
  async ({ data }: { data: Record<string, unknown> }) => {
    Object.assign(shipmentState, data);
    return shipmentState;
  },
);
const evidenceCreate = vi.fn(
  async ({ data }: { data: Partial<EvidenceRecord> }) => {
    const record = {
      createdAt: new Date("2026-10-18T09:00:00Z"),
      id: `evidence-${++evidenceSequence}`,
      revision: 1,
      supersedesId: null,
      ...data,
    } as EvidenceRecord;
    evidenceRecords.push(record);
    return record;
  },
);
const tx = {
  shipment: {
    findUniqueOrThrow: vi.fn(async () => shipmentState),
    update: shipmentUpdate,
  },
  shipmentLogisticsEvidence: {
    create: evidenceCreate,
    findFirst: vi.fn(
      async ({ where }: { where: Record<string, string> }) =>
        evidenceRecords.find(
          (record) =>
            record.canonicalKey === where.canonicalKey &&
            record.shipmentId === where.shipmentId,
        ) ?? null,
    ),
    findMany: vi.fn(
      async ({
        select,
        where,
      }: {
        select: Record<string, boolean>;
        where: { canonicalKey?: { in: string[] }; shipmentId: string };
      }) => {
        const records = evidenceRecords.filter(
          (record) =>
            record.shipmentId === where.shipmentId &&
            (!where.canonicalKey ||
              where.canonicalKey.in.includes(record.canonicalKey)),
        );
        if (select.canonicalKey) {
          return records.map(({ canonicalKey }) => ({ canonicalKey }));
        }
        return records;
      },
    ),
    findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
      const record = evidenceRecords.find(({ id }) => id === where.id);
      if (!record) throw new Error("Evidence not found");
      return {
        ...record,
        supersededBy:
          evidenceRecords.find(
            ({ supersedesId }) => supersedesId === record.id,
          ) ?? null,
      };
    }),
  },
};
const transaction = vi.fn(async (callback: (client: typeof tx) => unknown) =>
  callback(tx),
);

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ $transaction: transaction }),
}));

import {
  createOwnerLogisticsEvidence,
  importOwnerLogisticsEvidence,
  reconcileOwnerEvidenceState,
  reviseOwnerLogisticsEvidence,
  voidOwnerLogisticsEvidence,
} from "./owner-evidence";
import { verifiedPilotEvidence } from "./pilot-evidence";

function input(overrides: Record<string, unknown> = {}) {
  return {
    customerVisible: true,
    eventTimestamp: new Date("2026-10-10T15:58:00Z"),
    eventType: "INTERNATIONAL_TRANSIT_STARTED" as const,
    evidenceNote: "Owner checked the live source.",
    internalLocation: "Private upstream location",
    internalReference: "private-reference",
    shipmentId: "shipment-pilot",
    sourceLabel: "Private owner-verified source",
    sourceTimestampText: "2026-10-10 23:58",
    sourceTimeZone: "Asia/Shanghai",
    sourceType: "OWNER_VERIFIED_LOGISTICS" as const,
    verificationStatus: "VERIFIED" as const,
    ...overrides,
  };
}

describe("owner-verified logistics evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    evidenceRecords = [];
    evidenceSequence = 0;
    shipmentState = {
      etaEvidenceNote: null,
      etaFrom: null,
      etaSource: null,
      etaTo: null,
      etaWindowSource: null,
      lastConfirmedEventAt: new Date("2026-10-04T09:00:00Z"),
      normalizedStatus: "ORDER_CONFIRMED",
      requiresOwnerReview: false,
    };
  });

  it("creates verified evidence and advances only on physical evidence", async () => {
    const result = await createOwnerLogisticsEvidence("owner-1", input());

    expect(result.created).toBe(true);
    expect(evidenceRecords).toHaveLength(1);
    expect(evidenceRecords[0]).toMatchObject({
      createdByAdminId: "owner-1",
      verificationStatus: "VERIFIED",
    });
    expect(shipmentState.normalizedStatus).toBe("INTERNATIONAL_TRANSIT");
    expect(shipmentState.lastConfirmedEventAt).toEqual(
      new Date("2026-10-10T15:58:00Z"),
    );
  });

  it("edits and voids by appending auditable revisions", async () => {
    await createOwnerLogisticsEvidence(
      "owner-1",
      input({ verificationStatus: "PENDING_REVIEW" }),
    );
    const original = evidenceRecords[0]!;
    const revised = await reviseOwnerLogisticsEvidence(
      "owner-2",
      original.id,
      input({
        evidenceNote: "Verified after owner review.",
        verificationStatus: "VERIFIED",
      }),
    );
    const voided = await voidOwnerLogisticsEvidence(
      "owner-3",
      revised.id,
      "Source correction requested.",
    );

    expect(evidenceRecords).toHaveLength(3);
    expect(revised).toMatchObject({
      createdByAdminId: "owner-2",
      revision: 2,
      supersedesId: original.id,
    });
    expect(voided).toMatchObject({
      createdByAdminId: "owner-3",
      customerVisible: false,
      revision: 3,
      supersedesId: revised.id,
      verificationStatus: "VOIDED",
    });
    expect(voided.evidenceNote).toContain("VOID: Source correction requested.");
    expect(evidenceRecords.map(({ id }) => id)).toContain(original.id);
  });

  it("imports the pilot idempotently and does not rewrite an identical ETA", async () => {
    const pilot = verifiedPilotEvidence("shipment-pilot");
    const first = await importOwnerLogisticsEvidence({
      adminId: "owner-1",
      ...pilot,
      shipmentId: "shipment-pilot",
    });
    const updatesAfterFirstImport = shipmentUpdate.mock.calls.length;
    const second = await importOwnerLogisticsEvidence({
      adminId: "owner-1",
      ...pilot,
      shipmentId: "shipment-pilot",
    });

    expect(first).toMatchObject({ created: 9, etaUpdated: true });
    expect(second).toMatchObject({ created: 0, etaUpdated: false });
    expect(evidenceRecords).toHaveLength(9);
    expect(shipmentUpdate.mock.calls.length).toBe(updatesAfterFirstImport);
    expect(shipmentState).toMatchObject({
      etaConfidence: "MEDIUM",
      etaFrom: pilot.eta.date,
      etaSource: "OWNER_VERIFIED_LOGISTICS",
      etaTo: pilot.eta.date,
      etaWindowSource: "OWNER_VERIFIED_LOGISTICS",
      normalizedStatus: "EUROPEAN_LOGISTICS",
    });
  });

  it("preserves an official ETA instead of silently replacing it", async () => {
    const pilot = verifiedPilotEvidence("shipment-pilot");
    const officialEta = new Date("2026-10-20T09:00:00Z");
    shipmentState.etaFrom = officialEta;
    shipmentState.etaTo = officialEta;
    shipmentState.etaSource = "OWNER_CONFIRMED";
    shipmentState.etaWindowSource = "OFFICIAL_CARRIER";

    const result = await importOwnerLogisticsEvidence({
      adminId: "owner-1",
      ...pilot,
      shipmentId: "shipment-pilot",
    });

    expect(result.etaUpdated).toBe(false);
    expect(shipmentState.etaFrom).toEqual(officialEta);
  });

  it("never moves backward or overrides newer contradictory carrier evidence", () => {
    const currentAt = new Date("2026-10-16T10:00:00Z");
    const state = reconcileOwnerEvidenceState(
      {
        lastConfirmedEventAt: currentAt,
        normalizedStatus: "ARRIVED_AT_ANDRELOOK",
        requiresOwnerReview: false,
      },
      [
        {
          eventTimestamp: new Date("2026-10-15T07:03:00Z"),
          eventType: "EUROPE_PROCESSING_AWAITING_CUSTOMS",
          id: "older-owner-evidence",
          supersedesId: null,
          verificationStatus: "VERIFIED",
        },
      ],
    );

    expect(state).toMatchObject({
      conflict: true,
      lastConfirmedEventAt: currentAt,
      requiresOwnerReview: true,
      status: "ARRIVED_AT_ANDRELOOK",
    });
  });
});

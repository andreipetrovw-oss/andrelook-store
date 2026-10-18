import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  isVerifiedPilotOrderSet,
  verifiedPilotEvidence,
} from "./pilot-evidence";

describe("verified pilot evidence definition", () => {
  it("matches only the exact three verified real orders", () => {
    expect(
      isVerifiedPilotOrderSet([
        "AL-20261015-4F3DAD",
        "AL-20261015-32CC44",
        "AL-20261015-3D0AA1",
      ]),
    ).toBe(true);
    expect(
      isVerifiedPilotOrderSet(["AL-20261015-32CC44", "AL-20261015-3D0AA1"]),
    ).toBe(false);
    expect(
      isVerifiedPilotOrderSet([
        "AL-20261015-32CC44",
        "AL-20261015-3D0AA1",
        "AL-TEST",
      ]),
    ).toBe(false);
  });

  it("preserves source timestamps, physical sequence, visibility, and ETA", () => {
    const pilot = verifiedPilotEvidence("shipment-pilot");

    expect(pilot.evidence).toHaveLength(9);
    expect(
      pilot.evidence.map(({ sourceTimestampText }) => sourceTimestampText),
    ).toEqual([
      "2026-10-04 11:00",
      "2026-10-04 11:29",
      "2026-10-04 15:39",
      "2026-10-05 17:23",
      "2026-10-06 13:41",
      "2026-10-09 15:25",
      "2026-10-10 23:58",
      "2026-10-13 09:19",
      "2026-10-15 15:03",
    ]);
    expect(
      pilot.evidence
        .filter(({ customerVisible }) => customerVisible)
        .map(({ eventType }) => eventType),
    ).toEqual([
      "LOGISTICS_INSTRUCTION_PROVIDED",
      "INTERNATIONAL_LOGISTICS_ACCEPTED",
      "AIR_TRANSPORT_HANDOFF",
      "INTERNATIONAL_TRANSIT_STARTED",
      "ARRIVED_IN_EUROPE",
      "EUROPE_PROCESSING_AWAITING_CUSTOMS",
    ]);
    expect(pilot.evidence.at(-1)?.eventTimestamp?.toISOString()).toBe(
      "2026-10-15T07:03:00.000Z",
    );
    expect(pilot.eta.date.toISOString()).toBe("2026-10-19T09:00:00.000Z");
    expect(JSON.stringify(pilot)).not.toContain("CM526833901DE");
  });
});

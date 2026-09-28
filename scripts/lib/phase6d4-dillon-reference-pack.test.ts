import { describe, expect, it } from "vitest";

import {
  dillonCompleteEvidencePositions,
  dillonInvariantMap,
  phase6d4Candidates,
  phase6d4RejectedPasses,
} from "./phase6d4-dillon-reference-pack";

describe("Phase 6D.4 Dillon Golden Master pack", () => {
  it("contains six unique private roles without inventing a side view", () => {
    expect(phase6d4Candidates).toHaveLength(6);
    expect(new Set(phase6d4Candidates.map((item) => item.role)).size).toBe(6);
    expect(phase6d4Candidates.map((item) => item.role)).toEqual([
      "PRIMARY",
      "FRONT",
      "BACK",
      "INTERIOR",
      "BRANDING",
      "HARDWARE",
    ]);
  });

  it("keeps the complete 21-source evidence set represented in the invariant map", () => {
    expect(dillonCompleteEvidencePositions).toEqual(
      Array.from({ length: 21 }, (_, index) => index + 1),
    );
    const represented = new Set<number>(
      dillonInvariantMap.flatMap((item) => item.evidencePositions),
    );
    expect(
      dillonCompleteEvidencePositions.every((item) => represented.has(item)),
    ).toBe(true);
  });

  it("records iteration history and rejected fidelity failures", () => {
    expect(
      phase6d4Candidates.every((item) => item.iterationHistory.length > 0),
    ).toBe(true);
    expect(phase6d4RejectedPasses).toHaveLength(3);
    expect(
      phase6d4RejectedPasses.some((item) =>
        item.reason.includes("readable secondary label text"),
      ),
    ).toBe(true);
  });
});

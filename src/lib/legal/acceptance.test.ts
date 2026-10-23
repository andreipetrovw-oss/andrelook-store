import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sizeGuideEvidence } from "./acceptance";

describe("legal size-guide evidence", () => {
  it("creates a deterministic version from the exact chart and unit snapshot", () => {
    const first = sizeGuideEvidence(
      { rows: [{ chest: "52", size: "M" }], headers: ["size", "chest"] },
      "cm",
    );
    const reordered = sizeGuideEvidence(
      { headers: ["size", "chest"], rows: [{ size: "M", chest: "52" }] },
      "cm",
    );

    expect(first).toEqual(reordered);
    expect(first).toMatchObject({
      sizeGuideAvailable: true,
      sizeGuideSnapshot: {
        chartData: expect.any(Object),
        units: "cm",
      },
      sizeGuideVersion: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it("records that no public chart was available without inventing a snapshot", () => {
    expect(sizeGuideEvidence(null, null)).toEqual({
      sizeGuideAvailable: false,
      sizeGuideSnapshot: undefined,
      sizeGuideVersion: null,
    });
  });
});

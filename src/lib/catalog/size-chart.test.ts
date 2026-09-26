import { describe, expect, it } from "vitest";

import { parseSizeChart } from "./size-chart";

describe("verified size-chart presentation", () => {
  it("keeps source rows aligned with their size columns", () => {
    expect(
      parseSizeChart({
        measurements: [{ name: "Length", values: [60, 62, null] }],
        sizes: ["S", "M", "L"],
      }),
    ).toEqual({
      measurements: [{ name: "Length", values: [60, 62, null] }],
      sizes: ["S", "M", "L"],
    });
  });

  it("refuses malformed or misaligned chart data", () => {
    expect(parseSizeChart({ sizes: ["S"] })).toBeNull();
    expect(
      parseSizeChart({
        measurements: [{ name: "Length", values: [60, 62] }],
        sizes: ["S"],
      }),
    ).toBeNull();
  });
});

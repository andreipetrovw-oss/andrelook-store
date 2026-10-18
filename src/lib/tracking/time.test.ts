import { describe, expect, it } from "vitest";

import {
  parseEvidenceLocalDateTime,
  parseTallinnLocalDateTime,
  tallinnLocalInput,
} from "./time";

describe("Tallinn tracking timestamps", () => {
  it("preserves the local calendar date around midnight", () => {
    const value = parseTallinnLocalDateTime("2026-10-16T00:15");
    expect(value?.toISOString()).toBe("2026-10-15T21:15:00.000Z");
    expect(tallinnLocalInput(value)).toBe("2026-10-16T00:15");
  });

  it("uses the winter offset after daylight-saving time", () => {
    expect(parseTallinnLocalDateTime("2026-11-16T00:15")?.toISOString()).toBe(
      "2026-11-15T22:15:00.000Z",
    );
  });

  it("preserves an upstream UTC+8 source timestamp exactly", () => {
    expect(
      parseEvidenceLocalDateTime(
        "2026-10-15T15:03",
        "Asia/Shanghai",
      )?.toISOString(),
    ).toBe("2026-10-15T07:03:00.000Z");
  });

  it("rejects impossible source dates rather than normalizing them", () => {
    expect(
      parseEvidenceLocalDateTime("2026-02-31T15:03", "Asia/Shanghai"),
    ).toBeNull();
  });
});

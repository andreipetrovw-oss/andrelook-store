import { describe, expect, it } from "vitest";

import { parseTallinnLocalDateTime, tallinnLocalInput } from "./time";

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
});

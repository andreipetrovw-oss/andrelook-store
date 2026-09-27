import { describe, expect, it } from "vitest";

import {
  formatDateInput,
  formatOwnerDateTimeInput,
  parseDateInput,
  parseOwnerDateTimeInput,
} from "./date-input";

describe("owner CRM date inputs", () => {
  it("round-trips Tallinn winter and summer times", () => {
    for (const value of ["2026-01-15T10:30", "2026-07-15T10:30"]) {
      expect(formatOwnerDateTimeInput(parseOwnerDateTimeInput(value))).toBe(
        value,
      );
    }
  });

  it("round-trips date-only operational fields", () => {
    expect(formatDateInput(parseDateInput("2026-09-27"))).toBe("2026-09-27");
  });

  it("keeps empty values explicitly pending", () => {
    expect(parseDateInput("")).toBeNull();
    expect(parseOwnerDateTimeInput("")).toBeNull();
  });
});

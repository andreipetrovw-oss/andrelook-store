import { describe, expect, it } from "vitest";

import { measurementAllowedForHost } from "./client";

describe("measurement environment isolation", () => {
  it("allows explicitly enabled production hosts only", () => {
    expect(measurementAllowedForHost("www.andrelook.store", true)).toBe(true);
    expect(measurementAllowedForHost("andrelook.store", true)).toBe(true);
    expect(
      measurementAllowedForHost("andrelook-v1-staging.vercel.app", true),
    ).toBe(false);
    expect(measurementAllowedForHost("localhost", true)).toBe(false);
    expect(measurementAllowedForHost("www.andrelook.store", false)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { goldenWorkspaceByInternalCode } from "./golden-workspace";

describe("Phase 6D.2 golden workspace", () => {
  it("is limited to the four authorized products", () => {
    expect(Object.keys(goldenWorkspaceByInternalCode)).toHaveLength(4);
  });

  it("keeps every source shortlist deliberately small and unique", () => {
    for (const workspace of Object.values(goldenWorkspaceByInternalCode)) {
      expect(workspace.shortlist.length).toBeGreaterThanOrEqual(3);
      expect(workspace.shortlist.length).toBeLessThanOrEqual(6);
      expect(
        new Set(workspace.shortlist.map((item) => item.position)).size,
      ).toBe(workspace.shortlist.length);
    }
  });

  it("provides reviewable suggestions for all three locales", () => {
    for (const workspace of Object.values(goldenWorkspaceByInternalCode)) {
      for (const locale of ["RU", "ET", "EN"] as const) {
        expect(workspace.content[locale].name).not.toBe("");
        expect(workspace.content[locale].description).not.toBe("");
      }
    }
  });
});

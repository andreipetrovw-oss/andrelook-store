import { describe, expect, it } from "vitest";

import {
  approvedPublicAssetWhere,
  visiblePublicationStatuses,
} from "./visibility";

describe("storefront publication and image boundary", () => {
  it("keeps normal storefront reads limited to published products", () => {
    expect(visiblePublicationStatuses("public", true)).toEqual(["PUBLISHED"]);
    expect(visiblePublicationStatuses("local-review", false)).toEqual([
      "PUBLISHED",
    ]);
  });

  it("permits READY products only in explicitly enabled local review", () => {
    expect(visiblePublicationStatuses("local-review", true)).toEqual([
      "READY",
      "PUBLISHED",
    ]);
  });

  it("requires both review approval and an approval timestamp for public assets", () => {
    expect(approvedPublicAssetWhere).toEqual({
      approvedAt: { not: null },
      reviewStatus: "APPROVED",
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  acceptanceTestOrderNumbers,
  businessOrderWhere,
  isInternalTestOrder,
} from "./test-orders";

describe("production acceptance-order classification", () => {
  it("marks only the exact controlled production test orders", () => {
    expect(isInternalTestOrder("AL-20261007-3C7477")).toBe(true);
    expect(isInternalTestOrder("AL-20261011-302FDC")).toBe(true);
    expect(isInternalTestOrder("AL-20261023-424699")).toBe(true);
    expect(isInternalTestOrder("AL-20261023-42469A")).toBe(false);
    expect(isInternalTestOrder("AL-20261007-3C7478")).toBe(false);
    expect(isInternalTestOrder("AL-20261011-302FDD")).toBe(false);
    expect(isInternalTestOrder("AL-REAL-CUSTOMER")).toBe(false);
  });

  it("provides the shared exclusion for business KPI queries", () => {
    expect(acceptanceTestOrderNumbers).toEqual([
      "AL-20261007-3C7477",
      "AL-20261011-302FDC",
      "AL-20261023-424699",
    ]);
    expect(businessOrderWhere).toEqual({
      displayNumber: {
        notIn: [...acceptanceTestOrderNumbers],
      },
    });
  });
});

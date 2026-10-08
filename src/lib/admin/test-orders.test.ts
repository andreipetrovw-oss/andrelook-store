import { describe, expect, it } from "vitest";

import {
  acceptanceTestOrderNumbers,
  businessOrderWhere,
  isInternalTestOrder,
} from "./test-orders";

describe("production acceptance-order classification", () => {
  it("marks only the exact controlled production acceptance order", () => {
    expect(isInternalTestOrder("AL-20261007-3C7477")).toBe(true);
    expect(isInternalTestOrder("AL-20261007-3C7478")).toBe(false);
    expect(isInternalTestOrder("AL-REAL-CUSTOMER")).toBe(false);
  });

  it("provides the shared exclusion for business KPI queries", () => {
    expect(acceptanceTestOrderNumbers).toEqual(["AL-20261007-3C7477"]);
    expect(businessOrderWhere).toEqual({
      displayNumber: { notIn: ["AL-20261007-3C7477"] },
    });
  });
});

import { describe, expect, it } from "vitest";

import { localizeMeasurementLabel } from "./size-guide";

describe("size-guide measurement labels", () => {
  it("localizes known supplier terminology without changing unknown evidence", () => {
    expect(localizeMeasurementLabel("ru", "Bust")).toBe("Обхват груди");
    expect(localizeMeasurementLabel("et", "Clothes length")).toBe(
      "Rõiva pikkus",
    );
    expect(localizeMeasurementLabel("en", "custom source label")).toBe(
      "custom source label",
    );
  });
});

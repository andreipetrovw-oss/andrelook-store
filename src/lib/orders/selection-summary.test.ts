import { describe, expect, it } from "vitest";

import { SIZE_HELP_VALUE } from "./request-constants";
import { selectionSummary } from "./selection-summary";

const labels = {
  neutralPrompt: "Choose colour and size",
  sizingAssistance: "Sizing assistance",
};

describe("order selection summary", () => {
  it("does not claim sizing assistance before the customer selects it", () => {
    expect(selectionSummary({ colour: undefined, size: "", ...labels })).toBe(
      "Choose colour and size",
    );
  });

  it("shows only actual partial selections", () => {
    expect(selectionSummary({ colour: "Navy", size: "", ...labels })).toBe(
      "Navy",
    );
    expect(selectionSummary({ colour: undefined, size: "M", ...labels })).toBe(
      "M",
    );
  });

  it("shows sizing assistance only for the explicit sentinel state", () => {
    expect(
      selectionSummary({
        colour: "Must",
        size: SIZE_HELP_VALUE,
        ...labels,
      }),
    ).toBe("Must · Sizing assistance");
  });
});

import { describe, expect, it } from "vitest";

import { imageRoleLabel, presentBlockingIssue } from "./presentation";

describe("Russian owner presentation", () => {
  it("uses distinct, natural labels for gallery and additional image roles", () => {
    expect(imageRoleLabel.GALLERY).toBe("Галерея");
    expect(imageRoleLabel.ADDITIONAL).toBe("Дополнительное");
  });

  it("translates known legacy blocking notes without changing owner text", () => {
    expect(
      presentBlockingIssue(
        "Owner retail price and availability are not approved.",
      ),
    ).toBe("Розничная цена и наличие не подтверждены владельцем.");
    expect(presentBlockingIssue("Проверить название цвета.")).toBe(
      "Проверить название цвета.",
    );
  });
});

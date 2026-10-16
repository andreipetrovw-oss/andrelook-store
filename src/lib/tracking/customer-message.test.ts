import { describe, expect, it } from "vitest";

import { customerTrackingMessage } from "./customer-message";

describe("localized customer tracking messages", () => {
  it.each([
    ["ET", "Jälgimise juurdepääsukood", "Olek"],
    ["RU", "Код доступа к отслеживанию", "Статус"],
    ["EN", "Tracking Access Code", "Status"],
  ] as const)(
    "builds one complete %s owner-copy message",
    (locale, code, status) => {
      const message = customerTrackingMessage({
        accessCode: "ABCD-EFGH",
        locale,
        reference: "AL-20261016-ABCDEF",
        status: "Safe status",
        url: "https://www.andrelook.store/track/secure-token",
      });
      expect(message).toContain("AL-20261016-ABCDEF");
      expect(message).toContain("ABCD-EFGH");
      expect(message).toContain(code);
      expect(message).toContain(status);
      expect(message).toContain(
        "https://www.andrelook.store/track/secure-token",
      );
    },
  );
});

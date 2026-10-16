import { describe, expect, it } from "vitest";

import { customerTrackingMessage } from "./customer-message";

describe("localized customer tracking messages", () => {
  it.each([
    [
      "ET",
      `Tere!\nTeie Andrelooki tellimus on registreeritud meie jälgimissüsteemis.\n\nTellimuse number: AL-20261016-ABCDEF\nJälgimiskood: ABCD-EFGH\n\nTellimuse staatust saate jälgida siin:\nhttps://www.andrelook.store/track/secure-token\n\nLehte uuendatakse automaatselt, kui saabub uus kinnitatud logistiline info.`,
    ],
    [
      "RU",
      `Здравствуйте!\nВаш заказ Andrelook зарегистрирован в системе отслеживания.\n\nНомер заказа: AL-20261016-ABCDEF\nКод отслеживания: ABCD-EFGH\n\nСледить за статусом заказа можно здесь:\nhttps://www.andrelook.store/track/secure-token\n\nСтраница обновляется автоматически при появлении новой подтверждённой информации по логистике.`,
    ],
    [
      "EN",
      `Hello!\nYour Andrelook order has been registered in our tracking system.\n\nOrder number: AL-20261016-ABCDEF\nTracking code: ABCD-EFGH\n\nYou can follow your order here:\nhttps://www.andrelook.store/track/secure-token\n\nThe page updates automatically when new confirmed logistics information becomes available.`,
    ],
  ] as const)(
    "builds one complete %s owner-copy message",
    (locale, expected) => {
      const message = customerTrackingMessage({
        accessCode: "ABCD-EFGH",
        locale,
        reference: "AL-20261016-ABCDEF",
        status: "Safe status",
        url: "https://www.andrelook.store/track/secure-token",
      });
      expect(message).toBe(expected);
      expect(message).not.toContain("Safe status");
    },
  );
});

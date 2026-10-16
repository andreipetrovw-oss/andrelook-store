import type { PublicTrackingLocale } from "./types";

export function customerTrackingMessage(input: {
  accessCode: string;
  locale: PublicTrackingLocale;
  reference: string;
  status: string;
  url: string;
}) {
  const copy = {
    EN: `Hello!\nYour Andrelook order has been registered in our tracking system.\n\nOrder number: ${input.reference}\nTracking code: ${input.accessCode}\n\nYou can follow your order here:\n${input.url}\n\nThe page updates automatically when new confirmed logistics information becomes available.`,
    ET: `Tere!\nTeie Andrelooki tellimus on registreeritud meie jälgimissüsteemis.\n\nTellimuse number: ${input.reference}\nJälgimiskood: ${input.accessCode}\n\nTellimuse staatust saate jälgida siin:\n${input.url}\n\nLehte uuendatakse automaatselt, kui saabub uus kinnitatud logistiline info.`,
    RU: `Здравствуйте!\nВаш заказ Andrelook зарегистрирован в системе отслеживания.\n\nНомер заказа: ${input.reference}\nКод отслеживания: ${input.accessCode}\n\nСледить за статусом заказа можно здесь:\n${input.url}\n\nСтраница обновляется автоматически при появлении новой подтверждённой информации по логистике.`,
  };
  return copy[input.locale];
}

import type { PublicTrackingLocale } from "./types";

export function customerTrackingMessage(input: {
  accessCode: string;
  locale: PublicTrackingLocale;
  reference: string;
  status: string;
  url: string;
}) {
  const copy = {
    EN: `Andrelook order ${input.reference}\nTracking Access Code: ${input.accessCode}\nTrack: ${input.url}\nStatus: ${input.status}`,
    ET: `Andrelooki tellimus ${input.reference}\nJälgimise juurdepääsukood: ${input.accessCode}\nJälgimine: ${input.url}\nOlek: ${input.status}`,
    RU: `Заказ Andrelook ${input.reference}\nКод доступа к отслеживанию: ${input.accessCode}\nОтслеживание: ${input.url}\nСтатус: ${input.status}`,
  };
  return copy[input.locale];
}

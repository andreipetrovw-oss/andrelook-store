import type { PublicTrackingLocale } from "./types";

export const trackingCopy = {
  EN: {
    accessCode: "Tracking Access Code",
    carrier: "Local carrier",
    check: "Track order",
    checking: "Checking…",
    eta: "Estimated arrival",
    invalid:
      "We could not verify those details. Check them or wait before trying again.",
    items: "Your order",
    last: "Last confirmed update",
    lookupBody:
      "Enter your order number and individual Tracking Access Code. Your order number alone is never enough to open tracking.",
    lookupTitle: "Track your order",
    method: "Delivery method",
    network:
      "This page reflects verified updates stored by Andrelook. It is not GPS tracking.",
    note: "Your shipment is in the international logistics network. The next update will appear after a confirmed carrier or Andrelook milestone.",
    order: "Order number",
    refresh: "Refresh status",
    support: "Need help? Contact Andrelook ↗",
    timeline: "Order journey",
  },
  ET: {
    accessCode: "Jälgimise juurdepääsukood",
    carrier: "Kohalik vedaja",
    check: "Jälgi tellimust",
    checking: "Kontrollin…",
    eta: "Eeldatav saabumine",
    invalid:
      "Andmeid ei õnnestunud kinnitada. Kontrolli neid või proovi veidi hiljem uuesti.",
    items: "Sinu tellimus",
    last: "Viimane kinnitatud uuendus",
    lookupBody:
      "Sisesta tellimuse number ja personaalne jälgimise juurdepääsukood. Ainult tellimuse numbriga jälgimist avada ei saa.",
    lookupTitle: "Jälgi tellimust",
    method: "Kättesaamisviis",
    network:
      "Leht näitab Andrelooki salvestatud kinnitatud uuendusi. Tegemist ei ole GPS-jälgimisega.",
    note: "Saadetis on rahvusvahelises logistikavõrgus. Järgmine uuendus ilmub pärast vedaja või Andrelooki kinnitatud sündmust.",
    order: "Tellimuse number",
    refresh: "Värskenda olekut",
    support: "Vajad abi? Võta Andrelookiga ühendust ↗",
    timeline: "Tellimuse teekond",
  },
  RU: {
    accessCode: "Код доступа к отслеживанию",
    carrier: "Местный перевозчик",
    check: "Отследить заказ",
    checking: "Проверяем…",
    eta: "Ожидаемое прибытие",
    invalid:
      "Не удалось проверить данные. Проверьте их или повторите попытку позже.",
    items: "Ваш заказ",
    last: "Последнее подтверждённое обновление",
    lookupBody:
      "Введите номер заказа и индивидуальный код доступа к отслеживанию. Одного номера заказа недостаточно.",
    lookupTitle: "Отследить заказ",
    method: "Способ получения",
    network:
      "Страница показывает подтверждённые обновления, сохранённые Andrelook. Это не GPS-отслеживание.",
    note: "Отправление находится в международной логистической сети. Следующее обновление появится после подтверждённого события перевозчика или Andrelook.",
    order: "Номер заказа",
    refresh: "Обновить статус",
    support: "Нужна помощь? Связаться с Andrelook ↗",
    timeline: "Путь заказа",
  },
} as const satisfies Record<PublicTrackingLocale, object>;

export function trackingLocale(value: string | undefined) {
  const locale = value?.toUpperCase();
  return locale === "RU" || locale === "EN" ? locale : "ET";
}

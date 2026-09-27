import type {
  AcquisitionChannel,
  AvailabilityType,
  ContactMethod,
  ImageRole,
  OrderStatus,
  PaymentKind,
  PublicationStatus,
  ReviewDecision,
  SourceReviewStatus,
} from "@prisma/client";

export const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: "Новая заявка",
  CONTACTED: "Связались",
  CONFIRMED: "Подтверждено",
  AWAITING_PAYMENT: "Ожидает оплату",
  PAID: "Оплачено",
  ORDERED: "Заказано поставщику",
  IN_TRANSIT: "В пути",
  READY: "Готово к выдаче",
  DELIVERED: "Выдано",
  CANCELLED: "Отменено",
};

export const availabilityLabel: Record<AvailabilityType, string> = {
  IN_STOCK: "В наличии",
  PRE_ORDER: "Предзаказ",
  UNAVAILABLE: "Недоступно",
};

export const publicationLabel: Record<PublicationStatus, string> = {
  DRAFT: "Черновик",
  READY: "На проверке",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
};

export const reviewDecisionLabel: Record<ReviewDecision, string> = {
  PENDING: "Не заполнено",
  APPROVED: "Подтверждено",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "Требует доработки",
};

export const sourceReviewLabel: Record<SourceReviewStatus, string> = {
  CANDIDATE: "Кандидат",
  NEEDS_REVIEW: "На проверке",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
};

export const imageRoleLabel: Record<ImageRole, string> = {
  PRIMARY: "Главная",
  FRONT: "Спереди",
  BACK: "Сзади",
  SIDE: "Сбоку",
  ALTERNATIVE: "Альтернативный ракурс",
  INTERIOR: "Внутри",
  GALLERY: "Дополнительное",
  DETAIL: "Деталь",
  BRANDING: "Логотип / брендинг",
  ADDITIONAL: "Дополнительное",
  SIZE_CHART: "Размерная сетка",
};

export const channelLabel: Record<AcquisitionChannel, string> = {
  DIRECT: "Прямое обращение",
  INSTAGRAM: "Instagram",
  MARKETPLACE: "Маркетплейс",
  ADVERTISING: "Реклама",
  REFERRAL: "Рекомендация",
  OTHER: "Другое",
};

export const contactMethodLabel: Record<ContactMethod, string> = {
  TELEGRAM: "Telegram",
  INSTAGRAM: "Instagram",
  PHONE: "Телефон",
  EMAIL: "Эл. почта",
  OTHER: "Другое",
};

export const paymentKindLabel: Record<PaymentKind, string> = {
  DEPOSIT: "Предоплата",
  BALANCE: "Остаток",
  FULL: "Полная оплата",
  REFUND: "Возврат",
  ADJUSTMENT: "Корректировка",
};

export function formatDate(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(value)
    : "Не указано";
}

export function formatDateTime(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(value)
    : "Не указано";
}

export function formatMoney(
  valueMinor: number | null | undefined,
  currency: string | null | undefined,
) {
  if (valueMinor === null || valueMinor === undefined || !currency) {
    return "Не указано";
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
  }).format(valueMinor / 100);
}

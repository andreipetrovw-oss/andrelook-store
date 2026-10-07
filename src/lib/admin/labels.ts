import {
  AcquisitionChannel,
  AvailabilityType,
  ContactMethod,
  FulfilmentMethod,
  NotificationStatus,
  OrderStatus,
  PaymentKind,
  PaymentPreference,
  PublicationStatus,
  SourceReviewStatus,
} from "@prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  NEW: "Новый",
  CONTACTED: "Связались",
  CONFIRMED: "Подтверждён",
  AWAITING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачен",
  ORDERED: "Заказан у поставщика",
  IN_TRANSIT: "В пути",
  READY: "Готов",
  DELIVERED: "Доставлен / Выдан",
  CANCELLED: "Отменён",
};

export const paymentKindLabels: Record<PaymentKind, string> = {
  DEPOSIT: "Предоплата",
  BALANCE: "Остаток",
  FULL: "Полная оплата",
  REFUND: "Возврат",
  ADJUSTMENT: "Корректировка",
};

export const contactMethodLabels: Record<ContactMethod, string> = {
  TELEGRAM: "Telegram",
  INSTAGRAM: "Instagram",
  PHONE: "Телефон",
  EMAIL: "Email",
  OTHER: "Другое",
};

export const acquisitionChannelLabels: Record<AcquisitionChannel, string> = {
  DIRECT: "Прямой переход",
  INSTAGRAM: "Instagram",
  MARKETPLACE: "Маркетплейс",
  ADVERTISING: "Реклама",
  REFERRAL: "Рекомендация",
  OTHER: "Другое",
};

export const fulfilmentMethodLabels: Record<FulfilmentMethod, string> = {
  PERSONAL_HANDOVER: "Личная передача",
  DELIVERY: "Доставка",
};

export const paymentPreferenceLabels: Record<PaymentPreference, string> = {
  DEPOSIT_30_BALANCE_ON_HANDOVER: "30% предоплата, остаток при получении",
  FULL_ADVANCE: "Полная предоплата",
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  PENDING: "Ожидает отправки",
  SENT: "Отправлено",
  FAILED: "Ошибка",
  SKIPPED: "Пропущено",
};

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  DRAFT: "Черновик",
  READY: "Готов к проверке",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
};

export const availabilityTypeLabels: Record<AvailabilityType, string> = {
  IN_STOCK: "В наличии",
  PRE_ORDER: "Предзаказ",
  UNAVAILABLE: "Недоступен",
};

export const sourceReviewStatusLabels: Record<SourceReviewStatus, string> = {
  CANDIDATE: "Кандидат",
  NEEDS_REVIEW: "Требует проверки",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
};

export const russianDate = new Intl.DateTimeFormat("ru-RU");
export const russianDateTime = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

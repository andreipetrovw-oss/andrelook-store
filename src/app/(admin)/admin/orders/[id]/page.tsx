import {
  DeliveryMode,
  FulfilmentMethod,
  OrderStatus,
  OrderTrackingMilestoneKind,
  PaymentKind,
} from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { randomUUID } from "node:crypto";

import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { FinancialForm } from "@/components/admin/financial-form";
import { OrderReviewSection } from "@/components/admin/order-review-section";
import { OrderMilestoneForm } from "@/components/admin/order-milestone-form";
import { TrackingCustomerControls } from "@/components/admin/tracking-customer-controls";
import {
  getAdminOrder,
  getOrderCorrectionProductOptions,
} from "@/lib/admin/query";
import { getServerConfig } from "@/lib/env";
import { shipmentStatusLabels } from "@/lib/tracking/admin";
import { customerTrackingMessage } from "@/lib/tracking/customer-message";
import { getPublicTrackingOrder } from "@/lib/tracking/public";
import { trafficSourceLabels } from "@/lib/admin/traffic-labels";
import {
  acquisitionChannelLabels,
  contactMethodLabels,
  fulfilmentMethodLabels,
  notificationStatusLabels,
  orderStatusLabels,
  paymentKindLabels,
  paymentPreferenceLabels,
  russianDate,
  russianDateTime,
} from "@/lib/admin/labels";

import {
  retryOrderNotification,
  rotateOrderTrackingLink,
  updateOrderDetails,
  updateOrderItem,
  updateOrderStatus,
} from "../../actions";

const trackingMilestoneLabels: Record<OrderTrackingMilestoneKind, string> = {
  INTERNATIONAL_DISPATCH_CONFIRMED: "Международная отправка подтверждена",
  ORDER_CONFIRMED: "Заказ подтверждён",
  PACKING_CONFIRMED: "Упаковка подтверждена",
  PAYMENT_RECEIVED: "Оплата / предоплата получена (только CRM)",
  PREPARATION_STARTED: "Подготовка начата",
  QUALITY_CHECK_APPROVED: "Проверка качества одобрена",
  QUALITY_CHECK_RECEIVED: "Получены материалы проверки качества",
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, productOptions] = await Promise.all([
    getAdminOrder(id),
    getOrderCorrectionProductOptions(),
  ]);
  if (!order) notFound();
  const firstTouch = order.attribution?.touches.find(
    (touch) => touch.touchType === "FIRST",
  );
  const lastTouch =
    order.attribution?.touches.find((touch) => touch.touchType === "LAST") ??
    firstTouch;
  const trackingUrl = order.publicTrackingToken
    ? new URL(
        `/track/${order.publicTrackingToken}`,
        getServerConfig().siteUrl,
      ).toString()
    : null;
  const customerTracking = order.publicTrackingToken
    ? await getPublicTrackingOrder(
        order.publicTrackingToken,
        order.requestedLocale,
      )
    : null;
  const customerMessage =
    trackingUrl && order.trackingAccessCode && customerTracking
      ? customerTrackingMessage({
          accessCode: order.trackingAccessCode,
          locale: order.requestedLocale,
          reference: order.displayNumber,
          status: customerTracking.statusLabel,
          url: trackingUrl,
        })
      : null;
  return (
    <>
      <span className="eyebrow">{order.displayNumber}</span>
      <div className="admin-title-row">
        <h1>{order.customer.name}</h1>
        {order.isTest ? (
          <span className="admin-test-badge admin-test-badge-large">
            Тестовый заказ
          </span>
        ) : null}
      </div>
      <div className="order-detail-grid">
        <OrderReviewSection orderId={order.id} />
        <section className="admin-panel">
          <h2>Клиент и контакт</h2>
          <dl>
            <div>
              <dt>Предпочтительный контакт</dt>
              <dd>
                {contactMethodLabels[order.customer.preferredContactMethod]}
              </dd>
            </div>
            <div>
              <dt>Контакт</dt>
              <dd>{order.customer.preferredContactValue}</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>{order.customer.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.customer.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Язык</dt>
              <dd>{order.requestedLocale}</dd>
            </div>
            <div>
              <dt>Источник</dt>
              <dd>{acquisitionChannelLabels[order.acquisitionChannel]}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Заказ</h2>
          {order.items.map((item) => (
            <div className="admin-correction-block" key={item.id}>
              <dl>
                <div>
                  <dt>Товар</dt>
                  <dd>{item.productNameSnapshot}</dd>
                </div>
                <div>
                  <dt>Размер</dt>
                  <dd>
                    {item.sizeHelpRequested
                      ? "Нужна помощь с размером"
                      : (item.sizeSnapshot ?? "Не выбран")}
                  </dd>
                </div>
                <div>
                  <dt>Количество</dt>
                  <dd>{item.quantity}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{item.colorSnapshot ?? "Не выбран"}</dd>
                </div>
                <div>
                  <dt>Цена на момент заказа</dt>
                  <dd>
                    {item.unitPriceMinor === null || !order.currency
                      ? "Не подтверждена"
                      : `${(item.unitPriceMinor / 100).toFixed(2)} ${order.currency}`}
                  </dd>
                </div>
                <div>
                  <dt>Замеры / комментарий по размеру</dt>
                  <dd>{item.measurementsNote ?? "—"}</dd>
                </div>
              </dl>
              <details className="admin-correction-details">
                <summary>Исправить позицию</summary>
                <form action={updateOrderItem} className="admin-stack-form">
                  <input name="itemId" type="hidden" value={item.id} />
                  <input name="orderId" type="hidden" value={order.id} />
                  <label>
                    <span>Товар</span>
                    <select
                      defaultValue={item.productId ?? ""}
                      name="productId"
                    >
                      {!item.productId ? (
                        <option disabled value="">
                          Выберите товар
                        </option>
                      ) : null}
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.internalCode} ·{" "}
                          {product.brand?.displayName ?? "Без бренда"} ·{" "}
                          {product.translations[0]?.name ?? "Без названия"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Название / модель в заказе</span>
                    <input
                      defaultValue={item.productNameSnapshot}
                      name="productName"
                      required
                    />
                  </label>
                  <label>
                    <span>Цвет</span>
                    <input
                      defaultValue={item.colorSnapshot ?? ""}
                      name="color"
                    />
                  </label>
                  <label>
                    <span>Размер</span>
                    <input defaultValue={item.sizeSnapshot ?? ""} name="size" />
                  </label>
                  <label>
                    <span>Количество</span>
                    <input
                      defaultValue={item.quantity}
                      max="20"
                      min="1"
                      name="quantity"
                      required
                      type="number"
                    />
                  </label>
                  <label>
                    <span>Замеры / заметка клиента</span>
                    <textarea
                      defaultValue={item.measurementsNote ?? ""}
                      name="measurementsNote"
                    />
                  </label>
                  <button type="submit">Сохранить исправление</button>
                </form>
              </details>
            </div>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Получение и оплата</h2>
          <dl>
            <div>
              <dt>Способ получения</dt>
              <dd>
                {order.fulfilmentMethod
                  ? fulfilmentMethodLabels[order.fulfilmentMethod]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Способ оплаты</dt>
              <dd>
                {order.paymentPreference
                  ? paymentPreferenceLabels[order.paymentPreference]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Страна / город</dt>
              <dd>
                {order.countryCode ?? "—"} · {order.city ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Адрес</dt>
              <dd>
                {[order.addressLine1, order.addressLine2, order.postalCode]
                  .filter(Boolean)
                  .join(", ") || "Личная передача"}
              </dd>
            </div>
          </dl>
          {order.shipmentLinks.length ? (
            <p className="admin-warning-note">
              Заказ связан с логистикой. Исправление деталей не изменит и не
              удалит существующую привязку посылки.
            </p>
          ) : null}
          <details className="admin-correction-details">
            <summary>Исправить получение и заметки</summary>
            <form action={updateOrderDetails} className="admin-stack-form">
              <input name="orderId" type="hidden" value={order.id} />
              <label>
                <span>Способ получения</span>
                <select
                  defaultValue={order.fulfilmentMethod ?? ""}
                  name="fulfilmentMethod"
                >
                  <option value="">Не указан</option>
                  {Object.values(FulfilmentMethod).map((method) => (
                    <option key={method} value={method}>
                      {fulfilmentMethodLabels[method]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Маршрут доставки</span>
                <select
                  defaultValue={order.deliveryMode ?? ""}
                  name="deliveryMode"
                >
                  <option value="">Не указан</option>
                  {Object.values(DeliveryMode).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Заметка клиента</span>
                <textarea
                  defaultValue={order.customerNotes ?? ""}
                  name="customerNotes"
                />
              </label>
              <label>
                <span>Внутренняя заметка владельца</span>
                <textarea
                  defaultValue={order.internalNotes ?? ""}
                  name="internalNotes"
                />
              </label>
              <button type="submit">Сохранить исправления</button>
            </form>
          </details>
        </section>
        <section className="admin-panel">
          <h2>Источник клиента</h2>
          <dl>
            <div>
              <dt>Первый источник</dt>
              <dd>
                {firstTouch
                  ? trafficSourceLabels[firstTouch.source]
                  : acquisitionChannelLabels[order.acquisitionChannel]}
              </dd>
            </div>
            <div>
              <dt>Последний значимый источник</dt>
              <dd>{lastTouch ? trafficSourceLabels[lastTouch.source] : "—"}</dd>
            </div>
            <div>
              <dt>Кампания</dt>
              <dd>{lastTouch?.campaignName ?? "—"}</dd>
            </div>
            {lastTouch?.contentLabel || lastTouch?.adName ? (
              <div>
                <dt>Объявление / креатив</dt>
                <dd>{lastTouch.adName ?? lastTouch.contentLabel}</dd>
              </div>
            ) : null}
            {firstTouch?.landingPage ? (
              <div>
                <dt>Первая страница</dt>
                <dd>{firstTouch.landingPage}</dd>
              </div>
            ) : null}
            {firstTouch ? (
              <div>
                <dt>Дата первого визита</dt>
                <dd>{russianDateTime.format(firstTouch.occurredAt)}</dd>
              </div>
            ) : null}
            {lastTouch ? (
              <div>
                <dt>Последнее касание</dt>
                <dd>{russianDateTime.format(lastTouch.occurredAt)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Согласие на аналитику</dt>
              <dd>{order.attribution?.analyticsConsent ? "Да" : "Нет"}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Уведомление владельца</h2>
          <dl>
            <div>
              <dt>Статус</dt>
              <dd>
                {order.notification
                  ? notificationStatusLabels[order.notification.status]
                  : "Не отправлялось"}
              </dd>
            </div>
            <div>
              <dt>Получатель</dt>
              <dd>{order.notification?.recipient ?? "—"}</dd>
            </div>
            <div>
              <dt>Попытки</dt>
              <dd>{order.notification?.attempts ?? 0}</dd>
            </div>
            <div>
              <dt>ID провайдера</dt>
              <dd>{order.notification?.providerMessageId ?? "—"}</dd>
            </div>
            <div>
              <dt>Последняя ошибка</dt>
              <dd>{order.notification?.lastError ?? "—"}</dd>
            </div>
          </dl>
          {order.notification?.status !== "SENT" ? (
            <form action={retryOrderNotification} className="admin-stack-form">
              <input name="orderId" type="hidden" value={order.id} />
              <button type="submit">Повторить отправку</button>
            </form>
          ) : null}
        </section>
        <section className="admin-panel">
          <h2>Исполнение</h2>
          <dl>
            <div>
              <dt>Заказано у поставщика</dt>
              <dd>
                {order.supplierOrderedAt
                  ? russianDate.format(order.supplierOrderedAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>ETA</dt>
              <dd>
                {order.etaText ??
                  (order.etaDate ? russianDate.format(order.etaDate) : null) ??
                  "—"}
              </dd>
            </div>
            <div>
              <dt>Отслеживание</dt>
              <dd>{order.trackingReference ?? "—"}</dd>
            </div>
            <div>
              <dt>Следующее действие</dt>
              <dd>
                {order.nextActionAt
                  ? russianDateTime.format(order.nextActionAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Заметки</dt>
              <dd>{order.internalNotes ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel admin-panel-wide">
          <h2>Логистика и отслеживание</h2>
          <dl>
            <div>
              <dt>Номер заказа</dt>
              <dd>{order.displayNumber}</dd>
            </div>
            <div>
              <dt>Код доступа</dt>
              <dd>{order.trackingAccessCode ?? "Не создан"}</dd>
            </div>
            <div>
              <dt>Публичная ссылка</dt>
              <dd>
                {trackingUrl ? (
                  <a href={trackingUrl} rel="noreferrer" target="_blank">
                    Открыть защищённую страницу ↗
                  </a>
                ) : (
                  "Не создана"
                )}
              </dd>
            </div>
            <div>
              <dt>Безопасный статус клиента</dt>
              <dd>{customerTracking?.statusLabel ?? "—"}</dd>
            </div>
            <div>
              <dt>Последнее подтверждённое обновление</dt>
              <dd>
                {customerTracking?.lastUpdatedAt
                  ? russianDateTime.format(
                      new Date(customerTracking.lastUpdatedAt),
                    )
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Окно ETA</dt>
              <dd>
                {customerTracking?.estimatedDeliveryFrom &&
                customerTracking.estimatedDeliveryTo
                  ? `${russianDate.format(new Date(customerTracking.estimatedDeliveryFrom))} — ${russianDate.format(new Date(customerTracking.estimatedDeliveryTo))}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Маршрут</dt>
              <dd>
                {order.deliveryMode ?? "Определяется из способа получения"}
              </dd>
            </div>
          </dl>
          <TrackingCustomerControls
            accessCode={order.trackingAccessCode}
            message={customerMessage}
            trackingUrl={trackingUrl}
          />
          <form action={rotateOrderTrackingLink} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <button type="submit">
              {trackingUrl
                ? "Перевыпустить ссылку и код доступа"
                : "Создать ссылку и код доступа"}
            </button>
          </form>
          <p className="admin-readiness-note">
            Перевыпуск немедленно отзывает прежнюю ссылку и код. Используйте
            только перед передачей новых реквизитов клиенту.
          </p>
          <ul className="timeline">
            {order.shipmentLinks.map((link) => (
              <li key={link.id}>
                <Link href={`/admin/logistics/${link.shipment.id}`}>
                  <strong>Открыть управление логистикой</strong>
                </Link>
                <span>
                  {shipmentStatusLabels[link.shipment.normalizedStatus]}
                  {link.shipment.lastConfirmedEventAt
                    ? ` · ${russianDateTime.format(link.shipment.lastConfirmedEventAt)}`
                    : ""}
                  {link.shipment.staleFlag ? " · данные устарели" : ""}
                </span>
              </li>
            ))}
          </ul>
          {!order.shipmentLinks.length ? (
            <p className="admin-readiness-note">
              Посылки пока не привязаны. Создайте или откройте её в разделе
              «Логистика» и прикрепите этот заказ.
            </p>
          ) : null}
          <h3>Подтверждённая история заказа</h3>
          <OrderMilestoneForm
            key={order.id}
            orderId={order.id}
            kinds={Object.values(OrderTrackingMilestoneKind).map((kind) => ({
              value: kind,
              label: trackingMilestoneLabels[kind],
            }))}
          />
          {order.trackingMilestones.length ? (
            <ul className="timeline">
              {order.trackingMilestones.map((milestone) => (
                <li key={milestone.id}>
                  <strong>{trackingMilestoneLabels[milestone.kind]}</strong>
                  <span>
                    {russianDateTime.format(milestone.occurredAt)} ·{" "}
                    {milestone.evidenceSource} ·{" "}
                    {milestone.createdByAdmin.email}
                  </span>
                  <p>{milestone.evidenceNote}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-readiness-note">
              Подтверждённая историческая дата ещё не внесена. Клиенту
              показывается нейтральное добавление в систему, а не ложное
              подтверждение заказа.
            </p>
          )}
          {order.trackingNotifications.length ? (
            <>
              <h3>Уведомления клиенту</h3>
              <ul className="timeline">
                {order.trackingNotifications.map((notification) => (
                  <li key={notification.id}>
                    <strong>
                      {shipmentStatusLabels[notification.milestone]}
                    </strong>
                    <span>
                      {notification.status} · {notification.recipient} ·{" "}
                      {russianDateTime.format(notification.createdAt)}
                    </span>
                    {notification.lastError ? (
                      <p>{notification.lastError}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
        <section className="admin-panel">
          <h2>Цена заказа</h2>
          <dl>
            <div>
              <dt>Цена на момент заказа</dt>
              <dd>
                {order.storeTotalMinor === null
                  ? "Не зафиксирована"
                  : `${(order.storeTotalMinor / 100).toFixed(2)} ${order.currency}`}
              </dd>
            </div>
            <div>
              <dt>Согласованная цена</dt>
              <dd>
                {order.agreedTotalMinor === null
                  ? "Не задана"
                  : `${(order.agreedTotalMinor / 100).toFixed(2)} ${order.currency}`}
              </dd>
            </div>
            <div>
              <dt>Действующая сумма</dt>
              <dd>
                {order.effectiveTotalMinor === null
                  ? "Не подтверждена"
                  : `${(order.effectiveTotalMinor / 100).toFixed(2)} ${order.currency}`}
              </dd>
            </div>
            <div>
              <dt>Требуемая предоплата</dt>
              <dd>
                {order.requiredPrepaymentMinor === null
                  ? "Не рассчитана"
                  : `${(order.requiredPrepaymentMinor / 100).toFixed(2)} ${order.currency}`}
              </dd>
            </div>
          </dl>
          <details className="admin-correction-details">
            <summary>Изменить согласованную цену</summary>
            <FinancialForm operation="PRICE">
              <input name="orderId" type="hidden" value={order.id} />
              <label>
                <span>Согласованная сумма, {order.currency}</span>
                <input
                  defaultValue={
                    order.agreedTotalMinor === null
                      ? ""
                      : (order.agreedTotalMinor / 100).toFixed(2)
                  }
                  inputMode="decimal"
                  min="0.01"
                  name="agreedPrice"
                  placeholder="Пусто — использовать исходную сумму"
                  step="0.01"
                />
              </label>
              {order.activePayments.length ? (
                <label className="admin-confirm-checkbox">
                  <input
                    name="existingPaymentsAcknowledged"
                    required
                    type="checkbox"
                    value="true"
                  />
                  <span>
                    Подтверждаю изменение цены при существующей активной оплате.
                  </span>
                </label>
              ) : null}
              <ConfirmSubmitButton message="Сохранить новую согласованную цену и пересчитать финансовое состояние заказа?">
                Сохранить цену
              </ConfirmSubmitButton>
            </FinancialForm>
          </details>
        </section>
        <section className="admin-panel">
          <h2>Статус</h2>
          <form action={updateOrderStatus} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <select defaultValue={order.status} name="status">
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>
            <input
              name="note"
              placeholder="Комментарий для истории (необязательно)"
            />
            <button type="submit">Обновить статус</button>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Оплата</h2>
          <p>
            Оплачено: {(order.paidMinor / 100).toFixed(2)}{" "}
            {order.currency ?? ""}
          </p>
          <p>
            Остаток:{" "}
            {order.balanceMinor === null
              ? "Итоговая сумма не подтверждена"
              : `${(order.balanceMinor / 100).toFixed(2)} ${order.currency ?? ""}`}
          </p>
          <p className="admin-readiness-note">
            Сброс оплаты сохраняет запись и аудит, но исключает её из расчётов.
          </p>
          <FinancialForm operation="ADD">
            <input name="orderId" type="hidden" value={order.id} />
            <input name="requestKey" type="hidden" value={randomUUID()} />
            <select name="kind">
              {Object.values(PaymentKind).map((kind) => (
                <option key={kind} value={kind}>
                  {paymentKindLabels[kind]}
                </option>
              ))}
            </select>
            <input
              inputMode="decimal"
              min="0.01"
              name="amount"
              placeholder="Сумма"
              required
              step="0.01"
            />
            <input
              defaultValue={order.currency ?? "EUR"}
              maxLength={3}
              name="currency"
              required
            />
            <input
              inputMode="decimal"
              min="0"
              name="processorFee"
              placeholder="Фактическая комиссия, EUR (если известна)"
              step="0.01"
            />
            <input name="reference" placeholder="Номер / комментарий" />
            <button type="submit">Записать оплату</button>
          </FinancialForm>
          <div className="admin-payment-list">
            {order.payments.map((payment) => (
              <details className="admin-correction-details" key={payment.id}>
                <summary>
                  {payment.status === "VOIDED" ? "Сброшено: " : "Оплата: "}
                  {paymentKindLabels[payment.kind]} ·{" "}
                  {(payment.amountMinor / 100).toFixed(2)} {payment.currency} ·{" "}
                  {russianDate.format(payment.receivedAt)}
                </summary>
                <p>
                  Комиссия:{" "}
                  {payment.processorFeeMinor === null
                    ? "не указана"
                    : `${(payment.processorFeeMinor / 100).toFixed(2)} ${payment.currency}`}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </p>
                {payment.status === "ACTIVE" ? (
                  <>
                    <FinancialForm operation="EDIT">
                      <input name="orderId" type="hidden" value={order.id} />
                      <input
                        name="paymentId"
                        type="hidden"
                        value={payment.id}
                      />
                      <select defaultValue={payment.kind} name="kind">
                        {Object.values(PaymentKind).map((kind) => (
                          <option key={kind} value={kind}>
                            {paymentKindLabels[kind]}
                          </option>
                        ))}
                      </select>
                      <input
                        defaultValue={(payment.amountMinor / 100).toFixed(2)}
                        inputMode="decimal"
                        min="0.01"
                        name="amount"
                        required
                        step="0.01"
                      />
                      <input
                        defaultValue={payment.currency}
                        maxLength={3}
                        name="currency"
                        required
                      />
                      <input
                        defaultValue={
                          payment.processorFeeMinor === null
                            ? ""
                            : (payment.processorFeeMinor / 100).toFixed(2)
                        }
                        inputMode="decimal"
                        min="0"
                        name="processorFee"
                        placeholder="Комиссия"
                        step="0.01"
                      />
                      <input
                        defaultValue={payment.reference ?? ""}
                        name="reference"
                        placeholder="Номер / комментарий"
                      />
                      <ConfirmSubmitButton message="Сохранить исправление оплаты и пересчитать финансовое состояние заказа?">
                        Сохранить оплату
                      </ConfirmSubmitButton>
                    </FinancialForm>
                    <FinancialForm operation="VOID">
                      <input name="orderId" type="hidden" value={order.id} />
                      <input
                        name="paymentId"
                        type="hidden"
                        value={payment.id}
                      />
                      <label>
                        <span>Причина сброса</span>
                        <input name="reason" required />
                      </label>
                      <ConfirmSubmitButton message="Сбросить эту оплату? Запись останется в аудите, но будет исключена из суммы оплаты.">
                        Сбросить оплату
                      </ConfirmSubmitButton>
                    </FinancialForm>
                  </>
                ) : (
                  <p className="admin-warning-note">
                    Сброшено{" "}
                    {payment.voidedAt
                      ? russianDateTime.format(payment.voidedAt)
                      : ""}
                    {payment.voidReason ? ` · ${payment.voidReason}` : ""}
                  </p>
                )}
              </details>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <h2>История заказа</h2>
          <ol className="timeline">
            {order.statusHistory.map((entry) => (
              <li key={entry.id}>
                <strong>{orderStatusLabels[entry.toStatus]}</strong>
                <span>{russianDateTime.format(entry.createdAt)}</span>
                {entry.note ? <p>{entry.note}</p> : null}
              </li>
            ))}
          </ol>
          {order.correctionHistory.length ? (
            <>
              <h3>Аудит исправлений</h3>
              <ol className="timeline">
                {order.correctionHistory.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.changedField}</strong>
                    <span>
                      {russianDateTime.format(entry.createdAt)} ·{" "}
                      {entry.changedByAdmin?.email ?? "Удалённый администратор"}
                    </span>
                    <p>
                      {JSON.stringify(entry.previousValue)} →{" "}
                      {JSON.stringify(entry.newValue)}
                    </p>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </section>
      </div>
    </>
  );
}

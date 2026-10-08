import { OrderStatus, PaymentKind } from "@prisma/client";
import { notFound } from "next/navigation";

import { getAdminOrder } from "@/lib/admin/query";
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
  recordPayment,
  retryOrderNotification,
  updateOrderStatus,
} from "../../actions";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
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
            <dl key={item.id}>
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
        </section>
        <section className="admin-panel">
          <h2>Источник обращения</h2>
          <dl>
            <div>
              <dt>Канал</dt>
              <dd>{acquisitionChannelLabels[order.acquisitionChannel]}</dd>
            </div>
            <div>
              <dt>UTM</dt>
              <dd>
                {[
                  order.utmSource,
                  order.utmMedium,
                  order.utmCampaign,
                  order.utmContent,
                  order.utmTerm,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Прямой переход / нет"}
              </dd>
            </div>
            <div>
              <dt>Страница входа</dt>
              <dd>{order.landingPath ?? "—"}</dd>
            </div>
            <div>
              <dt>Исходный реферер</dt>
              <dd>{order.initialReferrer ?? "—"}</dd>
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
          <form action={recordPayment} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
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
            <input name="reference" placeholder="Номер / комментарий" />
            <button type="submit">Записать оплату</button>
          </form>
          <ul className="timeline">
            {order.payments.map((payment) => (
              <li key={payment.id}>
                {paymentKindLabels[payment.kind]} ·{" "}
                {(payment.amountMinor / 100).toFixed(2)} {payment.currency} ·{" "}
                {russianDate.format(payment.receivedAt)}
              </li>
            ))}
          </ul>
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
        </section>
      </div>
    </>
  );
}

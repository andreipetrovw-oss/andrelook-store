import { OrderStatus, PaymentKind } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  channelLabel,
  contactMethodLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  paymentKindLabel,
} from "@/lib/admin/presentation";
import {
  formatDateInput,
  formatOwnerDateTimeInput,
} from "@/lib/admin/date-input";
import { getAdminOrder } from "@/lib/admin/query";

import {
  recordPayment,
  updateOrderOperations,
  updateOrderStatus,
} from "../../actions";

const orderProgress = Object.values(OrderStatus);

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const firstItem = order.items[0];
  const imageUrl = firstItem?.product?.images[0]?.url;

  return (
    <>
      <Link className="admin-back-link" href="/admin/orders">
        ← Назад к заказам
      </Link>
      <header className="order-hero">
        <div>
          <span className="eyebrow">{order.displayNumber}</span>
          <h1>{order.customer.name}</h1>
          <p>
            {contactMethodLabel[order.customer.preferredContactMethod]} ·{" "}
            {order.customer.preferredContactValue}
          </p>
        </div>
        <span className={`status-pill status-${order.status.toLowerCase()}`}>
          {orderStatusLabel[order.status]}
        </span>
      </header>

      <section
        aria-label="Краткая информация о заказе"
        className="order-summary-card"
      >
        <div className="order-product-thumb">
          {imageUrl ? (
            <Image
              alt={firstItem?.productNameSnapshot ?? "Товар"}
              height={160}
              sizes="96px"
              src={imageUrl}
              width={128}
            />
          ) : (
            <span aria-hidden="true">A</span>
          )}
        </div>
        <div className="order-summary-product">
          <span>Товар</span>
          <strong>{firstItem?.productNameSnapshot ?? "Не указан"}</strong>
        </div>
        <dl>
          <div>
            <dt>Размер</dt>
            <dd>{firstItem?.sizeSnapshot ?? "Не указан"}</dd>
          </div>
          <div>
            <dt>Цвет</dt>
            <dd>{firstItem?.colorSnapshot ?? "Не указан"}</dd>
          </div>
          <div>
            <dt>Подтверждённая сумма</dt>
            <dd>{formatMoney(order.confirmedTotalMinor, order.currency)}</dd>
          </div>
          <div>
            <dt>Оплачено</dt>
            <dd>{formatMoney(order.paidMinor, order.currency)}</dd>
          </div>
          <div>
            <dt>Осталось</dt>
            <dd>{formatMoney(order.balanceMinor, order.currency)}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="progress-heading"
        className="admin-panel admin-panel-wide"
      >
        <div className="section-heading-row">
          <div>
            <span className="admin-section-label">Текущий этап</span>
            <h2 id="progress-heading">Путь заказа</h2>
          </div>
        </div>
        <ol className="order-progress">
          {orderProgress.map((status) => (
            <li
              className={status === order.status ? "is-current" : undefined}
              key={status}
            >
              <span>{orderStatusLabel[status]}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="order-detail-grid">
        <section className="admin-panel">
          <span className="admin-section-label">Клиент</span>
          <h2>Контакт</h2>
          <dl>
            <div>
              <dt>Способ связи</dt>
              <dd>
                {contactMethodLabel[order.customer.preferredContactMethod]}
              </dd>
            </div>
            <div>
              <dt>Контакт</dt>
              <dd>{order.customer.preferredContactValue}</dd>
            </div>
            <div>
              <dt>Язык заявки</dt>
              <dd>{order.requestedLocale}</dd>
            </div>
            <div>
              <dt>Источник</dt>
              <dd>{channelLabel[order.acquisitionChannel]}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Следующий шаг</span>
          <h2>Рабочие данные заказа</h2>
          <p>
            Заполняйте только подтверждённые данные. Каждое изменение попадает в
            неизменяемый журнал.
          </p>
          <form action={updateOrderOperations} className="admin-form-grid">
            <input name="orderId" type="hidden" value={order.id} />
            <label>
              <span>Подтверждённая сумма</span>
              <input
                defaultValue={
                  order.confirmedTotalMinor === null
                    ? ""
                    : order.confirmedTotalMinor / 100
                }
                inputMode="decimal"
                min="0.01"
                name="confirmedTotal"
                placeholder="Не указана"
                step="0.01"
              />
            </label>
            <label>
              <span>Валюта</span>
              <input
                defaultValue={order.currency ?? "EUR"}
                maxLength={3}
                name="currency"
              />
            </label>
            <label>
              <span>Следующее действие · время Эстонии</span>
              <input
                defaultValue={formatOwnerDateTimeInput(order.nextActionAt)}
                name="nextActionAt"
                type="datetime-local"
              />
            </label>
            <label>
              <span>Заказано поставщику</span>
              <input
                defaultValue={formatDateInput(order.supplierOrderedAt)}
                name="supplierOrderedAt"
                type="date"
              />
            </label>
            <label>
              <span>Ожидаемая дата</span>
              <input
                defaultValue={formatDateInput(order.etaDate)}
                name="etaDate"
                type="date"
              />
            </label>
            <label>
              <span>Пояснение срока</span>
              <input
                defaultValue={order.etaText ?? ""}
                name="etaText"
                placeholder="Только подтверждённая информация"
              />
            </label>
            <label>
              <span>Номер отслеживания</span>
              <input
                defaultValue={order.trackingReference ?? ""}
                name="trackingReference"
                placeholder="Не указан"
              />
            </label>
            <label>
              <span>Причина отмены</span>
              <input
                defaultValue={order.cancelledReason ?? ""}
                name="cancelledReason"
                placeholder="Только для отменённого заказа"
              />
            </label>
            <label className="wide">
              <span>Внутренняя заметка</span>
              <textarea
                defaultValue={order.internalNotes ?? ""}
                name="internalNotes"
                placeholder="Следующий шаг или важный контекст"
                rows={4}
              />
            </label>
            <button type="submit">Сохранить рабочие данные</button>
          </form>
        </section>

        <section className="admin-panel">
          <span className="admin-section-label">Действие владельца</span>
          <h2>Изменить статус</h2>
          <form action={updateOrderStatus} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <label>
              <span>Новый статус</span>
              <select defaultValue={order.status} name="status">
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Комментарий в историю</span>
              <input name="note" placeholder="Необязательно" />
            </label>
            <button type="submit">Сохранить статус</button>
          </form>
        </section>

        <section className="admin-panel">
          <span className="admin-section-label">Финансы</span>
          <h2>Оплаты</h2>
          <div className="payment-summary">
            <p>
              <span>Оплачено</span>
              <strong>{formatMoney(order.paidMinor, order.currency)}</strong>
            </p>
            <p>
              <span>Осталось</span>
              <strong>{formatMoney(order.balanceMinor, order.currency)}</strong>
            </p>
          </div>
          <form action={recordPayment} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <label>
              <span>Тип оплаты</span>
              <select name="kind">
                {Object.values(PaymentKind).map((kind) => (
                  <option key={kind} value={kind}>
                    {paymentKindLabel[kind]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Сумма</span>
              <input
                inputMode="decimal"
                min="0.01"
                name="amount"
                placeholder="0,00"
                required
                step="0.01"
              />
            </label>
            <label>
              <span>Валюта</span>
              <input
                defaultValue={order.currency ?? "EUR"}
                maxLength={3}
                name="currency"
                required
              />
            </label>
            <label>
              <span>Номер или комментарий</span>
              <input name="reference" placeholder="Необязательно" />
            </label>
            <button type="submit">Записать оплату</button>
          </form>
          {order.payments.length ? (
            <ul className="timeline compact">
              {order.payments.map((payment) => (
                <li key={payment.id}>
                  {paymentKindLabel[payment.kind]} ·{" "}
                  {formatMoney(payment.amountMinor, payment.currency)} ·{" "}
                  {formatDate(payment.receivedAt)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="pending-note">Оплат пока нет.</p>
          )}
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Неизменяемый журнал</span>
          <h2>История статусов</h2>
          <ol className="timeline">
            {order.statusHistory.map((entry) => (
              <li key={entry.id}>
                <strong>{orderStatusLabel[entry.toStatus]}</strong>
                <span>{formatDateTime(entry.createdAt)}</span>
                {entry.note ? <p>{entry.note}</p> : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Неизменяемый журнал</span>
          <h2>История рабочих данных</h2>
          {order.auditEvents.length ? (
            <ol className="timeline">
              {order.auditEvents.map((entry) => (
                <li key={entry.id}>
                  <strong>Обновлены рабочие данные</strong>
                  <span>
                    {formatDateTime(entry.createdAt)}
                    {entry.changedByAdmin?.email
                      ? ` · ${entry.changedByAdmin.email}`
                      : ""}
                  </span>
                  {entry.note ? <p>{entry.note}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="pending-note">Изменений пока нет.</p>
          )}
        </section>
      </div>
    </>
  );
}

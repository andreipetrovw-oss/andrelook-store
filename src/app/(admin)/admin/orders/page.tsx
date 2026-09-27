import { OrderStatus } from "@prisma/client";
import Link from "next/link";

import { getAdminOrders } from "@/lib/admin/query";
import {
  channelLabel,
  formatDate,
  formatMoney,
  orderStatusLabel,
} from "@/lib/admin/presentation";

function paymentState(order: {
  balanceMinor: number | null;
  confirmedTotalMinor: number | null;
  currency: string | null;
  paidMinor: number;
}) {
  if (order.confirmedTotalMinor === null) return "Сумма не подтверждена";
  if (order.balanceMinor === 0) return "Оплачено";
  if (order.paidMinor > 0) {
    return `Осталось ${formatMoney(order.balanceMinor, order.currency)}`;
  }
  return "Оплата ожидается";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ attention?: string; q?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const orders = await getAdminOrders({
    attention: filters.attention,
    query: filters.q,
    status: filters.status,
  });

  return (
    <>
      <header className="admin-page-header">
        <span className="eyebrow">Работа с клиентами</span>
        <h1>Заказы</h1>
        <p>Заявки, оплаты и следующие действия — в одном рабочем списке.</p>
      </header>

      {filters.attention === "overdue" ? (
        <div className="active-filter">
          <span>Показаны просроченные задачи</span>
          <Link href="/admin/orders">Сбросить</Link>
        </div>
      ) : null}

      <form className="admin-filters">
        <label>
          <span>Поиск</span>
          <input
            defaultValue={filters.q}
            name="q"
            placeholder="Номер, клиент или товар"
          />
        </label>
        <label>
          <span>Статус</span>
          <select defaultValue={filters.status ?? ""} name="status">
            <option value="">Все статусы</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {orderStatusLabel[status]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Показать</button>
      </form>

      <div className="admin-table-wrap orders-desktop" tabIndex={0}>
        <table className="admin-table orders-table">
          <thead>
            <tr>
              <th>Заказ</th>
              <th>Клиент и товар</th>
              <th>Размер / цвет</th>
              <th>Статус</th>
              <th>Источник</th>
              <th>Дата</th>
              <th>Следующее действие</th>
              <th>Оплата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const item = order.items[0];
              return (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.displayNumber}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.customer.name}</strong>
                    <small>
                      {item?.productNameSnapshot ?? "Товар не указан"}
                    </small>
                  </td>
                  <td>
                    {item?.sizeSnapshot ?? "—"} / {item?.colorSnapshot ?? "—"}
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${order.status.toLowerCase()}`}
                    >
                      {orderStatusLabel[order.status]}
                    </span>
                  </td>
                  <td>{channelLabel[order.acquisitionChannel]}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{formatDate(order.nextActionAt)}</td>
                  <td>{paymentState(order)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="orders-mobile">
        {orders.map((order) => {
          const item = order.items[0];
          return (
            <Link
              className="order-mobile-card"
              href={`/admin/orders/${order.id}`}
              key={order.id}
            >
              <div className="order-mobile-heading">
                <strong>{order.displayNumber}</strong>
                <span
                  className={`status-pill status-${order.status.toLowerCase()}`}
                >
                  {orderStatusLabel[order.status]}
                </span>
              </div>
              <h2>{order.customer.name}</h2>
              <p>{item?.productNameSnapshot ?? "Товар не указан"}</p>
              <dl>
                <div>
                  <dt>Размер / цвет</dt>
                  <dd>
                    {item?.sizeSnapshot ?? "—"} / {item?.colorSnapshot ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt>Следующее действие</dt>
                  <dd>{formatDate(order.nextActionAt)}</dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>{paymentState(order)}</dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>

      {!orders.length ? (
        <div className="admin-empty">
          <strong>Заказы не найдены</strong>
          <p>Измените поиск или фильтр.</p>
        </div>
      ) : null}
    </>
  );
}

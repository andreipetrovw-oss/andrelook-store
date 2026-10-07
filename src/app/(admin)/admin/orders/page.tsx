import { OrderStatus } from "@prisma/client";
import Link from "next/link";

import { getAdminOrders } from "@/lib/admin/query";
import {
  acquisitionChannelLabels,
  notificationStatusLabels,
  orderStatusLabels,
  russianDate,
} from "@/lib/admin/labels";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const orders = await getAdminOrders({
    query: filters.q,
    status: filters.status,
  });
  return (
    <>
      <span className="eyebrow">Продажи с сопровождением</span>
      <h1>Заказы</h1>
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
                {orderStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Применить</button>
      </form>
      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Товар</th>
              <th>Статус</th>
              <th>Источник</th>
              <th>Уведомление</th>
              <th>Дата</th>
              <th>Следующее действие</th>
              <th>Остаток</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>
                    {order.displayNumber}
                  </Link>
                </td>
                <td>{order.customer.name}</td>
                <td>{order.items[0]?.productNameSnapshot ?? "—"}</td>
                <td>{orderStatusLabels[order.status]}</td>
                <td>{acquisitionChannelLabels[order.acquisitionChannel]}</td>
                <td>
                  {order.notification
                    ? notificationStatusLabels[order.notification.status]
                    : "—"}
                </td>
                <td>{russianDate.format(order.orderDate)}</td>
                <td>
                  {order.nextActionAt
                    ? russianDate.format(order.nextActionAt)
                    : "—"}
                </td>
                <td>
                  {order.balanceMinor === null || !order.currency
                    ? "Не подтверждён"
                    : `${(order.balanceMinor / 100).toFixed(2)} ${order.currency}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!orders.length ? (
        <p className="admin-empty">Подходящих заказов нет.</p>
      ) : null}
    </>
  );
}

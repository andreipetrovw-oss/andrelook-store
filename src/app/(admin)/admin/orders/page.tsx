import { OrderStatus } from "@prisma/client";
import Link from "next/link";

import { getAdminOrders } from "@/lib/admin/query";

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
      <span className="eyebrow">Assisted sales</span>
      <h1>Orders</h1>
      <form className="admin-filters">
        <label>
          <span>Search</span>
          <input
            defaultValue={filters.q}
            name="q"
            placeholder="Reference, customer or product"
          />
        </label>
        <label>
          <span>Status</span>
          <select defaultValue={filters.status ?? ""} name="status">
            <option value="">All statuses</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply</button>
      </form>
      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Status</th>
              <th>Source</th>
              <th>Notification</th>
              <th>Date</th>
              <th>Next action</th>
              <th>Balance</th>
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
                <td>{order.status.replaceAll("_", " ")}</td>
                <td>{order.acquisitionChannel}</td>
                <td>{order.notification?.status ?? "—"}</td>
                <td>{order.orderDate.toLocaleDateString("en-GB")}</td>
                <td>
                  {order.nextActionAt?.toLocaleDateString("en-GB") ?? "—"}
                </td>
                <td>
                  {order.balanceMinor === null || !order.currency
                    ? "Pending"
                    : `${(order.balanceMinor / 100).toFixed(2)} ${order.currency}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!orders.length ? (
        <p className="admin-empty">No matching orders.</p>
      ) : null}
    </>
  );
}

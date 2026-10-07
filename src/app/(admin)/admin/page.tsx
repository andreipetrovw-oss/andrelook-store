import Link from "next/link";

import { getAdminOverview } from "@/lib/admin/query";

const cards = [
  ["NEW", "Новые запросы"],
  ["CONFIRMED", "Активные заказы"],
  ["AWAITING_PAYMENT", "Ожидают оплаты"],
  ["IN_TRANSIT", "В пути"],
  ["READY", "Готовы"],
] as const;

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  return (
    <>
      <span className="eyebrow">Только для владельца</span>
      <h1>Обзор</h1>
      <div className="admin-cards">
        {cards.map(([status, label]) => (
          <Link
            className="admin-card"
            href={`/admin/orders?status=${status}`}
            key={status}
          >
            <strong>{label}</strong>
            <p>{overview.counts[status] ?? 0}</p>
          </Link>
        ))}
        <Link className="admin-card warning" href="/admin/orders">
          <strong>Просроченные действия</strong>
          <p>{overview.overdue}</p>
        </Link>
      </div>
    </>
  );
}

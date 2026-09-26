import Link from "next/link";

import { getAdminOverview } from "@/lib/admin/query";

const cards = [
  ["NEW", "New leads"],
  ["CONFIRMED", "Active orders"],
  ["AWAITING_PAYMENT", "Awaiting payment"],
  ["IN_TRANSIT", "In transit"],
  ["READY", "Ready"],
] as const;

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  return (
    <>
      <span className="eyebrow">Owner only</span>
      <h1>Overview</h1>
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
          <strong>Overdue next actions</strong>
          <p>{overview.overdue}</p>
        </Link>
      </div>
    </>
  );
}

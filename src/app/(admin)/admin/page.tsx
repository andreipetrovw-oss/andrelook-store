const statuses = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "AWAITING_PAYMENT",
  "PAID",
  "ORDERED",
  "IN_TRANSIT",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function AdminOverviewPage() {
  return (
    <>
      <span className="eyebrow">Owner only</span>
      <h1>Overview</h1>
      <p>
        The CRM boundary is ready. Operational data will follow in Phase 6C.
      </p>
      <div className="admin-cards">
        {statuses.map((status) => (
          <article className="admin-card" key={status}>
            <strong>{status.replaceAll("_", " ")}</strong>
            <p>0</p>
          </article>
        ))}
      </div>
    </>
  );
}

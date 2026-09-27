export default function AdminLoading() {
  return (
    <div aria-live="polite" className="admin-route-state" role="status">
      <span className="eyebrow">Andrelook CRM</span>
      <h1>Загружаем данные…</h1>
      <div className="admin-loading-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

import Link from "next/link";

import { getAdminOverview } from "@/lib/admin/query";

const actions = [
  {
    description: "Нужно ответить клиенту и уточнить детали.",
    href: "/admin/orders?status=NEW",
    label: "Новые заявки",
    status: "NEW",
  },
  {
    description: "Подтверждённые заказы, по которым ожидается оплата.",
    href: "/admin/orders?status=AWAITING_PAYMENT",
    label: "Ожидают оплату",
    status: "AWAITING_PAYMENT",
  },
  {
    description: "Заказы уже едут — проверьте срок и отслеживание.",
    href: "/admin/orders?status=IN_TRANSIT",
    label: "В пути",
    status: "IN_TRANSIT",
  },
  {
    description: "Можно связаться с клиентом и договориться о выдаче.",
    href: "/admin/orders?status=READY",
    label: "Готовы к выдаче",
    status: "READY",
  },
] as const;

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  const visibleActions = actions
    .map((item) => ({ ...item, count: overview.counts[item.status] ?? 0 }))
    .filter((item) => item.count > 0);

  return (
    <>
      <header className="admin-page-header">
        <span className="eyebrow">Сегодня</span>
        <h1>Главная</h1>
        <p>Короткий обзор заявок и следующих действий.</p>
      </header>

      <section aria-labelledby="attention-heading" className="attention-panel">
        <div className="section-heading-row">
          <div>
            <span className="admin-section-label">Рабочий список</span>
            <h2 id="attention-heading">Что требует внимания</h2>
          </div>
          <Link className="text-link" href="/admin/orders">
            Все заказы
          </Link>
        </div>

        {overview.overdue > 0 ? (
          <Link
            className="attention-item is-urgent"
            href="/admin/orders?attention=overdue"
          >
            <div>
              <strong>Просроченные задачи</strong>
              <span>Дата следующего действия уже прошла.</span>
            </div>
            <b>{overview.overdue}</b>
          </Link>
        ) : null}

        {visibleActions.map((item) => (
          <Link className="attention-item" href={item.href} key={item.status}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </div>
            <b>{item.count}</b>
          </Link>
        ))}

        {overview.productsForReview > 0 ? (
          <Link className="attention-item" href="/admin/catalog?state=review">
            <div>
              <strong>Товары ждут решения</strong>
              <span>
                Откройте карточки и завершите только подтверждённые владельцем
                данные.
              </span>
            </div>
            <b>{overview.productsForReview}</b>
          </Link>
        ) : null}

        {!overview.overdue &&
        !visibleActions.length &&
        !overview.productsForReview ? (
          <div className="admin-empty is-positive">
            <strong>Срочных действий нет</strong>
            <p>Новые задачи появятся здесь автоматически.</p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="summary-heading" className="dashboard-summary">
        <div className="section-heading-row">
          <div>
            <span className="admin-section-label">Состояние работы</span>
            <h2 id="summary-heading">Заказы по этапам</h2>
          </div>
        </div>
        <div className="admin-cards">
          {(
            [
              ["NEW", "Новые"],
              ["CONTACTED", "Связались"],
              ["CONFIRMED", "Подтверждены"],
              ["ORDERED", "Заказаны"],
              ["IN_TRANSIT", "В пути"],
              ["READY", "К выдаче"],
            ] as const
          ).map(([status, label]) => (
            <Link
              className="admin-card"
              href={`/admin/orders?status=${status}`}
              key={status}
            >
              <span>{label}</span>
              <strong>{overview.counts[status] ?? 0}</strong>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

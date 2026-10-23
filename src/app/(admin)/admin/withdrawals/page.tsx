import Link from "next/link";

import { getWithdrawalRequests } from "@/lib/admin/query";
import { russianDateTime } from "@/lib/admin/labels";

export default async function AdminWithdrawalsPage() {
  const requests = await getWithdrawalRequests();
  return (
    <>
      <span className="eyebrow">Права потребителей</span>
      <h1>Заявления об отказе</h1>
      <p className="admin-overview-note">
        Здесь фиксируются онлайн-заявления. Получение заявления не означает
        автоматического решения о состоянии товара или сумме возврата.
      </p>
      <section className="admin-panel admin-panel-wide">
        {requests.length ? (
          <div className="admin-history-list">
            {requests.map((request) => (
              <article key={request.id}>
                <strong>{request.orderReference}</strong>
                <span>{russianDateTime.format(request.submittedAt)}</span>
                <small>
                  {request.consumerName} · {request.confirmationEmail}
                </small>
                <small>
                  Подтверждение: {request.confirmationStatus} · версия:{" "}
                  {request.policyVersion}
                </small>
                {request.order ? (
                  <Link href={`/admin/orders/${request.order.id}`}>
                    Открыть заказ {request.order.displayNumber}
                  </Link>
                ) : (
                  <span className="admin-warning-note">
                    Заказ не сопоставлен автоматически — проверьте вручную, не
                    отклоняя заявление только по этой причине.
                  </span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p>Заявлений пока нет.</p>
        )}
      </section>
    </>
  );
}

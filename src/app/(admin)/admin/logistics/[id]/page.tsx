import { ShipmentRelationship, ShipmentStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  linkOrderToShipment,
  reconcileShipmentAction,
  recordShipmentMilestone,
  updateShipmentEta,
  updateShipmentPublicTracking,
} from "@/app/(admin)/admin/actions";
import {
  getAdminShipment,
  getOrdersForShipmentLinking,
  shipmentStatusLabels,
} from "@/lib/tracking/admin";

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Tallinn",
});

function stamp(value: Date | null) {
  return value ? dateTime.format(value) : "—";
}

export default async function AdminShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [shipment, orders] = await Promise.all([
    getAdminShipment(id),
    getOrdersForShipmentLinking(),
  ]);
  if (!shipment) notFound();
  return (
    <>
      <span className="eyebrow">Внутренняя логистика</span>
      <div className="admin-title-row">
        <h1>{shipment.internalTrackingNumber}</h1>
        {shipment.requiresOwnerReview ? (
          <span className="admin-test-badge">Нужна сверка</span>
        ) : null}
      </div>
      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Посылка</h2>
          <dl>
            <div>
              <dt>Тип</dt>
              <dd>{shipment.kind}</dd>
            </div>
            <div>
              <dt>Провайдер</dt>
              <dd>{shipment.provider}</dd>
            </div>
            <div>
              <dt>Резерв</dt>
              <dd>{shipment.fallbackProvider ?? "—"}</dd>
            </div>
            <div>
              <dt>Перевозчик</dt>
              <dd>{shipment.detectedCarrierName ?? "Не определён"}</dd>
            </div>
            <div>
              <dt>Перевозчик по резерву</dt>
              <dd>{shipment.fallbackDetectedCarrierName ?? "—"}</dd>
            </div>
            <div>
              <dt>Статус клиента</dt>
              <dd>{shipmentStatusLabels[shipment.normalizedStatus]}</dd>
            </div>
            <div>
              <dt>Raw status</dt>
              <dd>{shipment.rawStatus ?? "—"}</dd>
            </div>
            <div>
              <dt>Fallback raw status</dt>
              <dd>{shipment.fallbackRawStatus ?? "—"}</dd>
            </div>
            <div>
              <dt>Sync status</dt>
              <dd>{shipment.providerSyncStatus}</dd>
            </div>
            <div>
              <dt>Последний успешный sync</dt>
              <dd>{stamp(shipment.lastSuccessfulSyncAt)}</dd>
            </div>
            <div>
              <dt>Резервный sync</dt>
              <dd>{shipment.fallbackSyncStatus ?? "—"}</dd>
            </div>
            <div>
              <dt>Последний успешный резервный sync</dt>
              <dd>{stamp(shipment.fallbackLastSuccessfulSyncAt)}</dd>
            </div>
            <div>
              <dt>Последнее движение</dt>
              <dd>{stamp(shipment.lastConfirmedEventAt)}</dd>
            </div>
            <div>
              <dt>ETA</dt>
              <dd>{stamp(shipment.estimatedDeliveryAt)}</dd>
            </div>
            <div>
              <dt>Источник ETA</dt>
              <dd>{shipment.etaSource ?? "—"}</dd>
            </div>
            <div>
              <dt>Устарело</dt>
              <dd>
                {shipment.staleFlag ? "Да — нужна частная сверка" : "Нет"}
              </dd>
            </div>
          </dl>
          <div className="admin-inline-actions">
            <form action={reconcileShipmentAction}>
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <button type="submit">Сверить основной источник</button>
            </form>
            <form action={reconcileShipmentAction}>
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <input name="forceFallback" type="hidden" value="true" />
              <button type="submit">Сверить через резерв</button>
            </form>
            <form action={reconcileShipmentAction}>
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <input name="realTime" type="hidden" value="true" />
              <button type="submit">Real-time запрос</button>
            </form>
          </div>
          <form action={updateShipmentEta} className="admin-stack-form">
            <input name="shipmentId" type="hidden" value={shipment.id} />
            <label>
              <span>Подтверждённая ETA</span>
              <input
                defaultValue={
                  shipment.estimatedDeliveryAt
                    ? shipment.estimatedDeliveryAt.toISOString().slice(0, 16)
                    : ""
                }
                name="estimatedDeliveryAt"
                type="datetime-local"
              />
            </label>
            <label>
              <span>Основание ETA (обязательно при установке)</span>
              <input defaultValue={shipment.etaNote ?? ""} name="etaNote" />
            </label>
            <button type="submit">Сохранить или очистить ETA</button>
          </form>
        </section>

        <section className="admin-panel">
          <h2>Связанные заказы</h2>
          <ul className="timeline">
            {shipment.orderLinks.map((link) => (
              <li key={link.id}>
                <Link href={`/admin/orders/${link.order.id}`}>
                  <strong>{link.order.displayNumber}</strong>
                </Link>
                <span>
                  {link.order.customer.name} · {link.relationship} · этап{" "}
                  {link.sequence}
                </span>
              </li>
            ))}
          </ul>
          <form action={linkOrderToShipment} className="admin-stack-form">
            <input name="shipmentId" type="hidden" value={shipment.id} />
            <label>
              <span>Прикрепить заказ</span>
              <select name="orderId" required>
                <option value="">Выберите заказ</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.displayNumber} · {order.customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Роль посылки</span>
              <select defaultValue="MASTER_INBOUND" name="relationship">
                {Object.values(ShipmentRelationship).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Порядок этапа</span>
              <input defaultValue="0" min="0" name="sequence" type="number" />
            </label>
            <button type="submit">Прикрепить</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <h2>Подтверждённое операционное событие</h2>
          <p className="admin-readiness-note">
            Дата необязательна только когда точное время действительно
            неизвестно. Статус без доказанного факта добавлять нельзя.
          </p>
          <form
            action={recordShipmentMilestone}
            className="admin-stack-form admin-form-grid"
          >
            <input name="shipmentId" type="hidden" value={shipment.id} />
            <label>
              <span>Статус клиента</span>
              <select name="status">
                {Object.values(ShipmentStatus).map((value) => (
                  <option key={value} value={value}>
                    {shipmentStatusLabels[value]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Источник доказательства</span>
              <select defaultValue="OWNER_CONFIRMED" name="evidenceSource">
                {[
                  "OWNER_CONFIRMED",
                  "WAREHOUSE_CONFIRMED",
                  "MANUAL_OVERRIDE",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Подтверждённое время</span>
              <input name="occurredAt" type="datetime-local" />
            </label>
            <label>
              <span>Основание / доказательство</span>
              <input name="reason" required />
            </label>
            <button type="submit">Записать событие</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <h2>Публичные данные местной доставки</h2>
          {shipment.kind === "LOCAL_OUTBOUND" ? (
            <form
              action={updateShipmentPublicTracking}
              className="admin-stack-form admin-form-grid"
            >
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <label>
                <span>Публичное имя перевозчика</span>
                <input
                  defaultValue={shipment.publicCarrierName ?? ""}
                  name="publicCarrierName"
                />
              </label>
              <label>
                <span>Публичный номер</span>
                <input
                  defaultValue={shipment.publicTrackingNumber ?? ""}
                  name="publicTrackingNumber"
                />
              </label>
              <label className="consent-row">
                <input
                  defaultChecked={shipment.exposePublicTracking}
                  name="exposePublicTracking"
                  type="checkbox"
                  value="true"
                />
                <span>Показывать клиенту только эти проверенные данные</span>
              </label>
              <button type="submit">Сохранить</button>
            </form>
          ) : (
            <p className="admin-readiness-note">
              Международный внутренний номер никогда не показывается клиенту.
            </p>
          )}
        </section>

        <section className="admin-panel admin-panel-wide">
          <h2>История событий</h2>
          <div className="admin-table-wrap" tabIndex={0}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Источник</th>
                  <th>Нормализовано</th>
                  <th>Raw status</th>
                  <th>Raw location</th>
                  <th>Публично</th>
                </tr>
              </thead>
              <tbody>
                {shipment.events.map((event) => (
                  <tr key={event.id}>
                    <td>{stamp(event.rawTimestamp ?? event.createdAt)}</td>
                    <td>
                      {event.evidenceSource}
                      {event.provider ? ` · ${event.provider}` : ""}
                    </td>
                    <td>{shipmentStatusLabels[event.normalizedStatus]}</td>
                    <td>{event.rawStatus ?? event.rawDescription ?? "—"}</td>
                    <td>{event.rawLocation ?? "—"}</td>
                    <td>{event.customerVisible ? "Да" : "Нет"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel admin-panel-wide">
          <h2>Raw provider evidence</h2>
          <p className="admin-readiness-note">
            Только владелец. Эти данные никогда не входят в публичный DTO.
          </p>
          {shipment.providerRecords.map((record) => (
            <details key={record.id}>
              <summary>
                {record.provider} · {record.syncStatus} ·{" "}
                {stamp(record.receivedAt)}
              </summary>
              <pre className="admin-json">
                {JSON.stringify(record.payload, null, 2)}
              </pre>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}

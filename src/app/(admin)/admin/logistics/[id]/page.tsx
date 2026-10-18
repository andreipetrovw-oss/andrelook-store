import { LogisticsEvidenceEventType, ShipmentStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  editShipmentLogisticsEvidence,
  linkOrderToShipment,
  recordShipmentMilestone,
  updateShipmentEta,
  updateShipmentPublicTracking,
  voidShipmentLogisticsEvidence,
} from "@/app/(admin)/admin/actions";
import {
  addSimpleManualUpdate,
  refreshPrimaryCarrier,
  updateShipmentIdentifiers,
} from "@/app/(admin)/admin/logistics/actions";
import { SuperbuyUpdatePanel } from "@/components/admin/superbuy-update-panel";
import {
  getAdminShipment,
  getOrdersForShipmentLinking,
  shipmentStatusLabels,
} from "@/lib/tracking/admin";
import { activeOwnerEvidence } from "@/lib/tracking/owner-evidence";
import { tallinnDateInput, tallinnLocalInput } from "@/lib/tracking/time";

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Tallinn",
});
const day = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Tallinn",
});

function stamp(value: Date | null) {
  return value ? dateTime.format(value) : "—";
}

const evidenceEventLabels: Record<LogisticsEvidenceEventType, string> = {
  AIR_TRANSPORT_HANDOFF: "Передано авиаперевозчику",
  ARRIVED_IN_EUROPE: "Прибыло в Европу",
  ESTIMATED_ARRIVAL: "Расчётная дата прибытия",
  EUROPE_PROCESSING_AWAITING_CUSTOMS: "Ожидает таможенного оформления",
  FLIGHT_BOOKED: "Рейс забронирован",
  INTERNATIONAL_LOGISTICS_ACCEPTED: "Принято международной логистикой",
  INTERNATIONAL_TRANSIT_STARTED: "Международный транзит начался",
  LOGISTICS_INFORMATION_RECEIVED: "Логистическая информация получена",
  LOGISTICS_INSTRUCTION_PROVIDED: "Логистическая информация передана",
  MOVING_TO_CARRIER_WAREHOUSE: "Направляется на склад перевозчика",
};

const simpleEventTypes = [
  LogisticsEvidenceEventType.LOGISTICS_INSTRUCTION_PROVIDED,
  LogisticsEvidenceEventType.INTERNATIONAL_LOGISTICS_ACCEPTED,
  LogisticsEvidenceEventType.AIR_TRANSPORT_HANDOFF,
  LogisticsEvidenceEventType.INTERNATIONAL_TRANSIT_STARTED,
  LogisticsEvidenceEventType.ARRIVED_IN_EUROPE,
  LogisticsEvidenceEventType.EUROPE_PROCESSING_AWAITING_CUSTOMS,
] as const;

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

  const activeEvidence = activeOwnerEvidence(shipment.logisticsEvidence);
  const ownerTimeline = activeEvidence
    .filter(
      (event) =>
        event.customerVisible &&
        event.verificationStatus === "VERIFIED" &&
        event.eventTimestamp,
    )
    .toSorted(
      (left, right) =>
        right.eventTimestamp!.valueOf() - left.eventTimestamp!.valueOf(),
    );
  const upstreamIdentifier = shipment.trackingIdentifiers.find(
    (identifier) =>
      identifier.isActive && identifier.role === "UPSTREAM_INTERNATIONAL",
  );
  const localIdentifier = shipment.trackingIdentifiers.find(
    (identifier) =>
      identifier.isActive && identifier.role === "LOCAL_LAST_MILE",
  );

  return (
    <>
      <span className="eyebrow">Логистика</span>
      <div className="admin-title-row">
        <h1>Управление посылкой</h1>
        {shipment.requiresOwnerReview ? (
          <span className="admin-test-badge">Нужна сверка</span>
        ) : null}
      </div>

      <div className="logistics-owner-flow">
        <section className="admin-panel logistics-primary-panel">
          <div className="logistics-panel-heading">
            <div>
              <span className="eyebrow">Ежедневная работа</span>
              <h2>Логистика</h2>
            </div>
            <span className="logistics-status-pill">
              {shipmentStatusLabels[shipment.normalizedStatus]}
            </span>
          </div>
          <dl className="logistics-summary-grid">
            <div>
              <dt>Статус</dt>
              <dd>{shipmentStatusLabels[shipment.normalizedStatus]}</dd>
            </div>
            <div>
              <dt>Последнее подтверждённое обновление</dt>
              <dd>{stamp(shipment.lastConfirmedEventAt)}</dd>
            </div>
            <div>
              <dt>Ожидаемое прибытие</dt>
              <dd>
                {shipment.etaFrom && shipment.etaTo
                  ? day.formatRange(shipment.etaFrom, shipment.etaTo)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Связанные заказы</dt>
              <dd>{shipment.orderLinks.length}</dd>
            </div>
          </dl>

          <div className="logistics-primary-actions">
            <form action={refreshPrimaryCarrier}>
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <button type="submit">Обновить перевозчика</button>
            </form>
            <SuperbuyUpdatePanel shipmentId={shipment.id} />
            <details className="logistics-action-panel">
              <summary>Добавить обновление вручную</summary>
              <form action={addSimpleManualUpdate} className="admin-stack-form">
                <input name="shipmentId" type="hidden" value={shipment.id} />
                <label>
                  <span>Дата и время (Таллинн)</span>
                  <input name="eventTimestamp" required type="datetime-local" />
                </label>
                <label>
                  <span>Статус</span>
                  <select name="eventType" required>
                    {simpleEventTypes.map((eventType) => (
                      <option key={eventType} value={eventType}>
                        {evidenceEventLabels[eventType]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Заметка (необязательно)</span>
                  <textarea name="note" rows={3} />
                </label>
                <label>
                  <span>Ожидаемое прибытие (необязательно)</span>
                  <input name="eta" type="date" />
                </label>
                <button type="submit">Сохранить обновление</button>
              </form>
            </details>
          </div>
        </section>

        <section className="admin-panel">
          <h2>Подтверждённая история</h2>
          {ownerTimeline.length ? (
            <ol className="logistics-timeline">
              {ownerTimeline.map((event) => (
                <li key={event.id}>
                  <time dateTime={event.eventTimestamp!.toISOString()}>
                    {day.format(event.eventTimestamp!)}
                  </time>
                  <strong>{evidenceEventLabels[event.eventType]}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="admin-readiness-note">
              Подтверждённых обновлений пока нет.
            </p>
          )}
        </section>

        <details className="admin-panel logistics-collapsible">
          <summary>Внутренние номера отслеживания</summary>
          <p className="admin-readiness-note">
            Эти номера видит только владелец. Они никогда не показываются
            клиенту.
          </p>
          <form action={updateShipmentIdentifiers} className="admin-stack-form">
            <input name="shipmentId" type="hidden" value={shipment.id} />
            <label>
              <span>Международный номер отслеживания</span>
              <input readOnly value={shipment.internalTrackingNumber} />
            </label>
            <label>
              <span>Номер посылки / заказа Superbuy</span>
              <input
                defaultValue={upstreamIdentifier?.value ?? ""}
                name="upstreamTracking"
              />
            </label>
            <label>
              <span>Дополнительный / местный номер</span>
              <input
                defaultValue={localIdentifier?.value ?? ""}
                name="localTracking"
              />
            </label>
            <button type="submit">Сохранить внутренние номера</button>
          </form>
        </details>

        <details className="admin-panel logistics-collapsible logistics-advanced">
          <summary>Расширенные детали логистики</summary>
          <p className="admin-readiness-note">
            Технические источники, доказательства и записи провайдеров. Для
            обычного обновления посылки этот раздел не требуется.
          </p>

          <section className="logistics-advanced-section">
            <h3>Связанные заказы</h3>
            <ul className="timeline">
              {shipment.orderLinks.map((link) => (
                <li key={link.id}>
                  <Link href={`/admin/orders/${link.order.id}`}>
                    <strong>{link.order.displayNumber}</strong>
                  </Link>
                  <span>{link.order.customer.name}</span>
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
              <input name="relationship" type="hidden" value="MASTER_INBOUND" />
              <input name="sequence" type="hidden" value="0" />
              <button type="submit">Прикрепить</button>
            </form>
          </section>

          <section className="logistics-advanced-section">
            <h3>Техническое состояние</h3>
            <dl>
              <div>
                <dt>Тип</dt>
                <dd>{shipment.kind}</dd>
              </div>
              <div>
                <dt>Основной источник</dt>
                <dd>{shipment.provider}</dd>
              </div>
              <div>
                <dt>Статус источника</dt>
                <dd>{shipment.providerSyncStatus}</dd>
              </div>
              <div>
                <dt>Raw status</dt>
                <dd>{shipment.rawStatus ?? "—"}</dd>
              </div>
              <div>
                <dt>Последняя успешная синхронизация</dt>
                <dd>{stamp(shipment.lastSuccessfulSyncAt)}</dd>
              </div>
              <div>
                <dt>Резервный источник</dt>
                <dd>{shipment.fallbackProvider ?? "—"}</dd>
              </div>
              <div>
                <dt>Требуется сверка</dt>
                <dd>{shipment.requiresOwnerReview ? "Да" : "Нет"}</dd>
              </div>
            </dl>
          </section>

          <section className="logistics-advanced-section">
            <h3>ETA</h3>
            <form action={updateShipmentEta} className="admin-stack-form">
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <label>
                <span>Начало окна</span>
                <input
                  defaultValue={tallinnDateInput(shipment.etaFrom)}
                  name="etaFrom"
                  type="date"
                />
              </label>
              <label>
                <span>Конец окна</span>
                <input
                  defaultValue={tallinnDateInput(shipment.etaTo)}
                  name="etaTo"
                  type="date"
                />
              </label>
              <label>
                <span>Уверенность</span>
                <select
                  defaultValue={shipment.etaConfidence ?? "MEDIUM"}
                  name="etaConfidence"
                >
                  <option value="LOW">Низкая</option>
                  <option value="MEDIUM">Средняя</option>
                  <option value="HIGH">Высокая</option>
                </select>
              </label>
              <label>
                <span>Основание ETA</span>
                <input
                  defaultValue={shipment.etaEvidenceNote ?? ""}
                  name="etaEvidenceNote"
                />
              </label>
              <button type="submit">Сохранить ETA</button>
            </form>
          </section>

          <section className="logistics-advanced-section">
            <h3>Аудит проверенных событий</h3>
            <div className="admin-table-wrap" tabIndex={0}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Событие</th>
                    <th>Источник</th>
                    <th>Проверка</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.logisticsEvidence.map((evidence) => {
                    const isCurrent = !evidence.supersededBy;
                    return (
                      <tr key={evidence.id}>
                        <td>{stamp(evidence.eventTimestamp)}</td>
                        <td>{evidenceEventLabels[evidence.eventType]}</td>
                        <td>{evidence.sourceLabel}</td>
                        <td>
                          {evidence.verificationStatus} · v{evidence.revision}
                        </td>
                        <td>
                          {isCurrent &&
                          evidence.verificationStatus !== "VOIDED" ? (
                            <details>
                              <summary>Изменить / аннулировать</summary>
                              <form
                                action={editShipmentLogisticsEvidence}
                                className="admin-stack-form"
                              >
                                <input
                                  name="evidenceId"
                                  type="hidden"
                                  value={evidence.id}
                                />
                                <input
                                  name="shipmentId"
                                  type="hidden"
                                  value={shipment.id}
                                />
                                <input
                                  name="sourceType"
                                  type="hidden"
                                  value={evidence.sourceType}
                                />
                                <label>
                                  <span>Источник</span>
                                  <input
                                    defaultValue={evidence.sourceLabel}
                                    name="sourceLabel"
                                    required
                                  />
                                </label>
                                <label>
                                  <span>Событие</span>
                                  <select
                                    defaultValue={evidence.eventType}
                                    name="eventType"
                                  >
                                    {Object.values(
                                      LogisticsEvidenceEventType,
                                    ).map((eventType) => (
                                      <option key={eventType} value={eventType}>
                                        {evidenceEventLabels[eventType]}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  <span>Время</span>
                                  <input
                                    defaultValue={
                                      evidence.sourceTimestampText
                                        ?.replace(" ", "T")
                                        .slice(0, 16) ??
                                      tallinnLocalInput(evidence.eventTimestamp)
                                    }
                                    name="eventTimestamp"
                                    required
                                    type="datetime-local"
                                  />
                                </label>
                                <input
                                  name="sourceTimeZone"
                                  type="hidden"
                                  value={
                                    evidence.sourceTimeZone ?? "Europe/Tallinn"
                                  }
                                />
                                <input
                                  name="internalLocation"
                                  type="hidden"
                                  value={evidence.internalLocation ?? ""}
                                />
                                <input
                                  name="internalReference"
                                  type="hidden"
                                  value={evidence.internalReference ?? ""}
                                />
                                <label>
                                  <span>Заметка</span>
                                  <textarea
                                    defaultValue={evidence.evidenceNote}
                                    name="evidenceNote"
                                    required
                                    rows={3}
                                  />
                                </label>
                                <input
                                  name="verificationStatus"
                                  type="hidden"
                                  value={evidence.verificationStatus}
                                />
                                {evidence.customerVisible ? (
                                  <input
                                    name="customerVisible"
                                    type="hidden"
                                    value="true"
                                  />
                                ) : null}
                                <button type="submit">Сохранить правку</button>
                              </form>
                              <form
                                action={voidShipmentLogisticsEvidence}
                                className="admin-stack-form"
                              >
                                <input
                                  name="evidenceId"
                                  type="hidden"
                                  value={evidence.id}
                                />
                                <label>
                                  <span>Причина аннулирования</span>
                                  <input name="reason" required />
                                </label>
                                <button type="submit">Аннулировать</button>
                              </form>
                            </details>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="logistics-advanced-section">
            <h3>Операционное событие</h3>
            <form action={recordShipmentMilestone} className="admin-stack-form">
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <label>
                <span>Статус клиента</span>
                <select name="status">
                  {Object.values(ShipmentStatus).map((status) => (
                    <option key={status} value={status}>
                      {shipmentStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <input
                name="evidenceSource"
                type="hidden"
                value="OWNER_CONFIRMED"
              />
              <label>
                <span>Подтверждённое время</span>
                <input name="occurredAt" type="datetime-local" />
              </label>
              <label>
                <span>Основание</span>
                <input name="reason" required />
              </label>
              <button type="submit">Записать событие</button>
            </form>
          </section>

          {shipment.kind === "LOCAL_OUTBOUND" ? (
            <section className="logistics-advanced-section">
              <h3>Публичные данные местной доставки</h3>
              <form
                action={updateShipmentPublicTracking}
                className="admin-stack-form"
              >
                <input name="shipmentId" type="hidden" value={shipment.id} />
                <label>
                  <span>Имя перевозчика</span>
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
                <label className="admin-confirm-checkbox">
                  <input
                    defaultChecked={shipment.exposePublicTracking}
                    name="exposePublicTracking"
                    type="checkbox"
                    value="true"
                  />
                  <span>Показывать клиенту</span>
                </label>
                <button type="submit">Сохранить</button>
              </form>
            </section>
          ) : null}

          <section className="logistics-advanced-section">
            <h3>События провайдера</h3>
            <div className="admin-table-wrap" tabIndex={0}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Источник</th>
                    <th>Нормализовано</th>
                    <th>Raw status</th>
                    <th>Публично</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.events.map((event) => (
                    <tr key={event.id}>
                      <td>{stamp(event.rawTimestamp ?? event.createdAt)}</td>
                      <td>{event.provider ?? event.evidenceSource}</td>
                      <td>{shipmentStatusLabels[event.normalizedStatus]}</td>
                      <td>{event.rawStatus ?? event.rawDescription ?? "—"}</td>
                      <td>{event.customerVisible ? "Да" : "Нет"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="logistics-advanced-section">
            <h3>Raw provider records</h3>
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
        </details>
      </div>
    </>
  );
}

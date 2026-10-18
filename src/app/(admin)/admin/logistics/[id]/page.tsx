import {
  LogisticsEvidenceEventType,
  ShipmentRelationship,
  ShipmentStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addShipmentLogisticsEvidence,
  editShipmentLogisticsEvidence,
  linkOrderToShipment,
  reconcileShipmentAction,
  recordShipmentMilestone,
  updateShipmentEta,
  updateShipmentPublicTracking,
  voidShipmentLogisticsEvidence,
} from "@/app/(admin)/admin/actions";
import {
  getAdminShipment,
  getOrdersForShipmentLinking,
  shipmentStatusLabels,
} from "@/lib/tracking/admin";
import {
  activeOwnerEvidence,
  summarizeOwnerEvidence,
} from "@/lib/tracking/owner-evidence";
import { tallinnDateInput, tallinnLocalInput } from "@/lib/tracking/time";

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Tallinn",
});

function stamp(value: Date | null) {
  return value ? dateTime.format(value) : "—";
}

const evidenceEventLabels: Record<LogisticsEvidenceEventType, string> = {
  AIR_TRANSPORT_HANDOFF: "Передано авиаперевозчику",
  ARRIVED_IN_EUROPE: "Прибыло в Европу",
  ESTIMATED_ARRIVAL: "Расчётная дата прибытия",
  EUROPE_PROCESSING_AWAITING_CUSTOMS:
    "Европейская обработка завершена — ожидает таможню",
  FLIGHT_BOOKED: "Рейс забронирован",
  INTERNATIONAL_LOGISTICS_ACCEPTED: "Принято международной логистикой",
  INTERNATIONAL_TRANSIT_STARTED: "Международная перевозка началась",
  LOGISTICS_INFORMATION_RECEIVED: "Логистическая информация получена",
  LOGISTICS_INSTRUCTION_PROVIDED: "Логистические данные переданы",
  MOVING_TO_CARRIER_WAREHOUSE: "Направляется на склад перевозчика",
};

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
  const evidenceSummary = summarizeOwnerEvidence(activeEvidence);
  const evidenceSources = [
    ...new Set(
      activeEvidence
        .filter((evidence) => evidence.verificationStatus === "VERIFIED")
        .map((evidence) => evidence.sourceLabel),
    ),
  ];
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
              <dt>Окно ETA</dt>
              <dd>
                {shipment.etaFrom && shipment.etaTo
                  ? `${dateTime.format(shipment.etaFrom)} — ${dateTime.format(shipment.etaTo)}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Источник ETA</dt>
              <dd>{shipment.etaWindowSource ?? shipment.etaSource ?? "—"}</dd>
            </div>
            <div>
              <dt>Уверенность ETA</dt>
              <dd>{shipment.etaConfidence ?? "—"}</dd>
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
              <span>Начало окна ETA (дата Таллинна)</span>
              <input
                defaultValue={tallinnDateInput(shipment.etaFrom)}
                name="etaFrom"
                type="date"
              />
            </label>
            <label>
              <span>Конец окна ETA (дата Таллинна)</span>
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
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>
            <label>
              <span>Основание ETA (обязательно при установке)</span>
              <input
                defaultValue={shipment.etaEvidenceNote ?? ""}
                name="etaEvidenceNote"
              />
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
          <h2>VERIFIED LOGISTICS EVIDENCE</h2>
          <p className="admin-readiness-note">
            Внутренние проверенные данные. Названия источников, заметки,
            география и идентификаторы никогда не входят в клиентский DTO.
            Изменение и аннулирование создают новую ревизию и не стирают аудит.
          </p>
          <dl>
            <div>
              <dt>BEST VERIFIED CUSTOMER STATE</dt>
              <dd>{shipmentStatusLabels[shipment.normalizedStatus]}</dd>
            </div>
            <div>
              <dt>LAST VERIFIED PHYSICAL MOVEMENT</dt>
              <dd>{stamp(evidenceSummary.lastPhysicalMovementAt)}</dd>
            </div>
            <div>
              <dt>ESTIMATED ARRIVAL</dt>
              <dd>
                {shipment.etaFrom && shipment.etaTo
                  ? `${dateTime.format(shipment.etaFrom)} — ${dateTime.format(shipment.etaTo)}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>DATA SOURCES</dt>
              <dd>{evidenceSources.join(" · ") || "—"}</dd>
            </div>
          </dl>
          <details>
            <summary>Добавить проверенное свидетельство</summary>
            <form
              action={addShipmentLogisticsEvidence}
              className="admin-stack-form admin-form-grid"
            >
              <input name="shipmentId" type="hidden" value={shipment.id} />
              <input
                name="sourceType"
                type="hidden"
                value="OWNER_VERIFIED_LOGISTICS"
              />
              <label>
                <span>Внутренний источник</span>
                <input name="sourceLabel" required />
              </label>
              <label>
                <span>Событие</span>
                <select name="eventType" required>
                  {Object.values(LogisticsEvidenceEventType).map((value) => (
                    <option key={value} value={value}>
                      {evidenceEventLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Время из источника</span>
                <input name="eventTimestamp" required type="datetime-local" />
              </label>
              <label>
                <span>Часовой пояс источника</span>
                <select defaultValue="Europe/Tallinn" name="sourceTimeZone">
                  <option value="Europe/Tallinn">Europe/Tallinn</option>
                  <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
              <label>
                <span>Внутренняя локация (необязательно)</span>
                <input name="internalLocation" />
              </label>
              <label>
                <span>Внутренняя ссылка / номер (необязательно)</span>
                <input name="internalReference" />
              </label>
              <label>
                <span>Основание / заметка</span>
                <textarea name="evidenceNote" required rows={3} />
              </label>
              <label>
                <span>Проверка</span>
                <select defaultValue="VERIFIED" name="verificationStatus">
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                </select>
              </label>
              <label className="admin-confirm-checkbox">
                <input
                  defaultChecked
                  name="customerVisible"
                  type="checkbox"
                  value="true"
                />
                <span>Показывать нормализованную веху клиенту</span>
              </label>
              <button type="submit">Add evidence</button>
            </form>
          </details>
          <div className="admin-table-wrap" tabIndex={0}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Источник / время</th>
                  <th>Событие</th>
                  <th>Проверка</th>
                  <th>Заметка</th>
                  <th>Ревизия</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {shipment.logisticsEvidence.map((evidence) => {
                  const isCurrent = !evidence.supersededBy;
                  return (
                    <tr key={evidence.id}>
                      <td>
                        <strong>{evidence.sourceLabel}</strong>
                        <small>
                          {evidence.sourceTimestampText ??
                            stamp(evidence.eventTimestamp)}{" "}
                          · {evidence.sourceTimeZone ?? "—"}
                        </small>
                      </td>
                      <td>{evidenceEventLabels[evidence.eventType]}</td>
                      <td>{evidence.verificationStatus}</td>
                      <td>{evidence.evidenceNote}</td>
                      <td>
                        v{evidence.revision} ·{" "}
                        {isCurrent ? "CURRENT" : "SUPERSEDED"}
                        <small>{evidence.createdByAdmin.email}</small>
                      </td>
                      <td>
                        {isCurrent &&
                        evidence.verificationStatus !== "VOIDED" ? (
                          <details>
                            <summary>Edit / Void</summary>
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
                                  ).map((value) => (
                                    <option key={value} value={value}>
                                      {evidenceEventLabels[value]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span>Время из источника</span>
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
                              <label>
                                <span>Часовой пояс</span>
                                <select
                                  defaultValue={
                                    evidence.sourceTimeZone ?? "Europe/Tallinn"
                                  }
                                  name="sourceTimeZone"
                                >
                                  <option value="Europe/Tallinn">
                                    Europe/Tallinn
                                  </option>
                                  <option value="Asia/Shanghai">
                                    Asia/Shanghai (UTC+8)
                                  </option>
                                  <option value="UTC">UTC</option>
                                </select>
                              </label>
                              <label>
                                <span>Локация</span>
                                <input
                                  defaultValue={evidence.internalLocation ?? ""}
                                  name="internalLocation"
                                />
                              </label>
                              <label>
                                <span>Внутренняя ссылка</span>
                                <input
                                  defaultValue={
                                    evidence.internalReference ?? ""
                                  }
                                  name="internalReference"
                                />
                              </label>
                              <label>
                                <span>Заметка</span>
                                <textarea
                                  defaultValue={evidence.evidenceNote}
                                  name="evidenceNote"
                                  required
                                  rows={3}
                                />
                              </label>
                              <label>
                                <span>Проверка</span>
                                <select
                                  defaultValue={evidence.verificationStatus}
                                  name="verificationStatus"
                                >
                                  <option value="VERIFIED">VERIFIED</option>
                                  <option value="PENDING_REVIEW">
                                    PENDING_REVIEW
                                  </option>
                                </select>
                              </label>
                              <label className="admin-confirm-checkbox">
                                <input
                                  defaultChecked={evidence.customerVisible}
                                  name="customerVisible"
                                  type="checkbox"
                                  value="true"
                                />
                                <span>Показывать нормализованную веху</span>
                              </label>
                              <button type="submit">Edit evidence</button>
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
                              <button type="submit">Void evidence</button>
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

        <section className="admin-panel admin-panel-wide">
          <h2>Private tracking identifiers</h2>
          <p className="admin-readiness-note">
            Архитектура поддерживает отдельные upstream, основной и local
            last-mile идентификаторы. Они доступны только владельцу.
          </p>
          {shipment.trackingIdentifiers.length ? (
            <ul className="timeline">
              {shipment.trackingIdentifiers.map((identifier) => (
                <li key={identifier.id}>
                  <strong>{identifier.role}</strong>
                  <span>
                    {identifier.sourceLabel} · {identifier.value} ·{" "}
                    {identifier.isActive ? "ACTIVE" : "RETIRED"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-readiness-note">
              Дополнительные идентификаторы пока не добавлены; текущий основной
              номер сохранён без изменений.
            </p>
          )}
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

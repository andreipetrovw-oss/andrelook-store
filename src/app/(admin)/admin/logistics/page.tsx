import { ShipmentKind, ShipmentProvider } from "@prisma/client";
import Link from "next/link";

import { createShipment } from "@/app/(admin)/admin/actions";
import { getAdminShipments, shipmentStatusLabels } from "@/lib/tracking/admin";

export default async function AdminLogisticsPage() {
  const shipments = await getAdminShipments();
  return (
    <>
      <span className="eyebrow">Посылки и маршруты</span>
      <h1>Логистика</h1>
      <p className="admin-overview-note">
        Посылка создаётся один раз и может быть связана с несколькими заказами.
        Международные номера остаются только в CRM.
      </p>
      <section className="admin-panel">
        <h2>Создать посылку</h2>
        <form
          action={createShipment}
          className="admin-stack-form admin-form-grid"
        >
          <label>
            <span>Внутренний номер отслеживания</span>
            <input autoComplete="off" name="internalTrackingNumber" required />
          </label>
          <label>
            <span>Тип</span>
            <select defaultValue="INTERNATIONAL_INBOUND" name="kind">
              {Object.values(ShipmentKind).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Основной провайдер</span>
            <select defaultValue="SEVENTEEN_TRACK" name="provider">
              {Object.values(ShipmentProvider).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Резервный провайдер</span>
            <select defaultValue="SHIP24" name="fallbackProvider">
              <option value="">Нет</option>
              {Object.values(ShipmentProvider).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Флаг устаревания через дней</span>
            <input
              defaultValue="7"
              max="60"
              min="1"
              name="staleAfterDays"
              type="number"
            />
          </label>
          <button type="submit">Создать и зарегистрировать</button>
        </form>
      </section>
      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Провайдер</th>
              <th>Синхронизация</th>
              <th>Заказы</th>
              <th>Контроль</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>
                  <Link href={`/admin/logistics/${shipment.id}`}>
                    {shipment.internalTrackingNumber}
                  </Link>
                </td>
                <td>{shipment.kind}</td>
                <td>{shipmentStatusLabels[shipment.normalizedStatus]}</td>
                <td>{shipment.detectedCarrierName ?? shipment.provider}</td>
                <td>{shipment.providerSyncStatus}</td>
                <td>{shipment._count.orderLinks}</td>
                <td>
                  {shipment.requiresOwnerReview
                    ? "Проверить расхождение"
                    : shipment.staleFlag
                      ? "Данные устарели"
                      : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

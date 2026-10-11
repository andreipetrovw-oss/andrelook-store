import { getProfitabilityReport } from "@/lib/admin/query";

function money(value: number | null) {
  return value === null ? "—" : `${(value / 100).toFixed(2)} EUR`;
}

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function ratio(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

export default async function ProfitabilityPage() {
  const rows = await getProfitabilityReport();

  return (
    <>
      <span className="eyebrow">Владелец · приватно</span>
      <h1>Экономика товаров</h1>
      <p className="admin-overview-note">
        Версия 1 — приблизительные плановые оценки владельца, не бухгалтерские
        данные. 10% — целевая доля рекламы для планирования; фактический расход
        берётся только из рекламных записей. Исторические заказы не дополнены
        задним числом.
      </p>
      <section className="admin-panel admin-panel-wide">
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Retail</th>
                <th>Public price</th>
                <th>Закупка</th>
                <th>Логистика</th>
                <th>Landed</th>
                <th>Комиссия 3%</th>
                <th>Цель рекламы 10%</th>
                <th>Плановая прибыль</th>
                <th>Плановая маржа</th>
                <th>Break-even CAC</th>
                <th>Break-even ROAS</th>
                <th>Факт. расход</th>
                <th>Факт. CAC</th>
                <th>Факт. вклад после рекламы</th>
                <th>Факт. маржа</th>
                <th>Факт. ROAS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.internalCode}>
                  <td>
                    <strong>{row.name}</strong>
                    <br />
                    <small>{row.internalCode}</small>
                  </td>
                  <td>
                    {money(row.economics.retailSnapshotMinor)}
                    {row.retailPriceMinor !==
                    row.economics.retailSnapshotMinor ? (
                      <>
                        <br />
                        <small>Отличается от public price</small>
                      </>
                    ) : null}
                  </td>
                  <td>{money(row.retailPriceMinor)}</td>
                  <td>{money(row.economics.purchaseEstimateMinor)}</td>
                  <td>{money(row.economics.logisticsEstimateMinor)}</td>
                  <td>{money(row.economics.landedCostEstimateMinor)}</td>
                  <td>{money(row.planning.paymentCostMinor)}</td>
                  <td>{money(row.planning.targetAdCostMinor)}</td>
                  <td>{money(row.planning.plannedProfitMinor)}</td>
                  <td>{percent(row.planning.plannedMargin)}</td>
                  <td>{money(row.planning.breakEvenCacMinor)}</td>
                  <td>{ratio(row.planning.breakEvenRoas)}</td>
                  <td>{money(row.actualAdSpendMinor)}</td>
                  <td>{money(row.actual?.actualCacMinor ?? null)}</td>
                  <td>
                    {money(row.actual?.contributionAfterAdsMinor ?? null)}
                  </td>
                  <td>{percent(row.actual?.actualMargin ?? null)}</td>
                  <td>{ratio(row.actual?.actualRoas ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="admin-overview-note">
        Фактические показатели товара используют только явно привязанный
        рекламный расход. Комиссия берётся из фактической записи оплаты, когда
        она указана; иначе будущий заказ использует сохранённую ставку версии и
        остаётся расчётной. Нераспределённый расход виден в разделе «Реклама» и
        не приписывается товару автоматически.
      </p>
    </>
  );
}

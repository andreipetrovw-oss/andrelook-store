import Link from "next/link";

import { recordAdvertisingSpend } from "@/app/(admin)/admin/actions";
import { trafficSourceLabels } from "@/lib/admin/traffic-labels";
import { getAdvertisingReport } from "@/lib/admin/query";
import type { AdvertisingRow } from "@/lib/measurement/reporting";

function date(value: string | undefined, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function isoDay(value: Date) {
  return value.toISOString().slice(0, 10);
}

function money(value: number | null) {
  return value === null ? "—" : `${(value / 100).toFixed(2)} EUR`;
}

function sourceRows(rows: AdvertisingRow[]) {
  const grouped = new Map<string, AdvertisingRow>();
  for (const row of rows) {
    const current = grouped.get(row.source) ?? {
      ...row,
      campaign: null,
      confirmed: 0,
      leads: 0,
      paid: 0,
      revenueMinor: 0,
      spendMinor: 0,
    };
    current.confirmed += row.confirmed;
    current.leads += row.leads;
    current.paid += row.paid;
    current.revenueMinor += row.revenueMinor;
    current.spendMinor += row.spendMinor;
    current.costPerLeadMinor =
      current.leads && current.spendMinor
        ? Math.round(current.spendMinor / current.leads)
        : null;
    current.costPerCustomerMinor =
      current.paid && current.spendMinor
        ? Math.round(current.spendMinor / current.paid)
        : null;
    current.roas = current.spendMinor
      ? Number((current.revenueMinor / current.spendMinor).toFixed(2))
      : null;
    grouped.set(row.source, current);
  }
  return [...grouped.values()].sort(
    (left, right) =>
      right.revenueMinor - left.revenueMinor || right.leads - left.leads,
  );
}

export default async function AdvertisingPage({
  searchParams,
}: {
  searchParams: Promise<{
    campaign?: string;
    from?: string;
    source?: string;
    to?: string;
  }>;
}) {
  const filters = await searchParams;
  const today = new Date();
  const tomorrow = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1,
    ),
  );
  const defaultFrom = new Date(tomorrow.getTime() - 30 * 86_400_000);
  const from = date(filters.from, defaultFrom);
  const toDay = date(filters.to, new Date(tomorrow.getTime() - 86_400_000));
  const to = new Date(toDay.getTime() + 86_400_000);
  const allRows = await getAdvertisingReport({ from, to });
  const rows = allRows.filter(
    (row) =>
      (!filters.source || row.source === filters.source) &&
      (!filters.campaign || row.campaign === filters.campaign),
  );
  const displayRows = filters.source ? rows : sourceRows(rows);
  const totals = rows.reduce(
    (sum, row) => ({
      confirmed: sum.confirmed + row.confirmed,
      leads: sum.leads + row.leads,
      paid: sum.paid + row.paid,
      revenueMinor: sum.revenueMinor + row.revenueMinor,
      spendMinor: sum.spendMinor + row.spendMinor,
    }),
    { confirmed: 0, leads: 0, paid: 0, revenueMinor: 0, spendMinor: 0 },
  );
  const costPerLead =
    totals.leads && totals.spendMinor
      ? Math.round(totals.spendMinor / totals.leads)
      : null;
  const costPerCustomer =
    totals.paid && totals.spendMinor
      ? Math.round(totals.spendMinor / totals.paid)
      : null;
  const roas = totals.spendMinor
    ? (totals.revenueMinor / totals.spendMinor).toFixed(2)
    : "—";
  const conversion = totals.leads
    ? `${((totals.paid / totals.leads) * 100).toFixed(1)}%`
    : "—";
  const calendarToday = new Date(tomorrow.getTime() - 86_400_000);
  const thisMonth = new Date(
    Date.UTC(calendarToday.getUTCFullYear(), calendarToday.getUTCMonth(), 1),
  );
  const previousMonth = new Date(
    Date.UTC(
      calendarToday.getUTCFullYear(),
      calendarToday.getUTCMonth() - 1,
      1,
    ),
  );
  const previousMonthEnd = new Date(thisMonth.getTime() - 86_400_000);
  const rangeHref = (start: Date, end: Date) =>
    `/admin/advertising?from=${isoDay(start)}&to=${isoDay(end)}`;

  return (
    <>
      <span className="eyebrow">Бизнес-аналитика</span>
      <h1>Реклама</h1>
      <p className="admin-overview-note">
        Период лида определяется датой обращения, выручка — датой оплаты, расход
        — датой рекламной записи. Тестовые заказы исключены.
      </p>
      <form className="admin-filters">
        <label>
          <span>С</span>
          <input defaultValue={isoDay(from)} name="from" type="date" />
        </label>
        <label>
          <span>По</span>
          <input defaultValue={isoDay(toDay)} name="to" type="date" />
        </label>
        <button type="submit">Применить</button>
      </form>
      <nav aria-label="Быстрый выбор периода" className="admin-range-links">
        <Link href={rangeHref(calendarToday, calendarToday)}>Сегодня</Link>
        <Link
          href={rangeHref(
            new Date(tomorrow.getTime() - 7 * 86_400_000),
            calendarToday,
          )}
        >
          7 дней
        </Link>
        <Link
          href={rangeHref(
            new Date(tomorrow.getTime() - 30 * 86_400_000),
            calendarToday,
          )}
        >
          30 дней
        </Link>
        <Link href={rangeHref(thisMonth, calendarToday)}>Этот месяц</Link>
        <Link href={rangeHref(previousMonth, previousMonthEnd)}>
          Прошлый месяц
        </Link>
        <Link
          href={rangeHref(new Date("2020-01-01T00:00:00.000Z"), calendarToday)}
        >
          Всё время
        </Link>
      </nav>
      <div className="admin-cards">
        {[
          ["Расход", money(totals.spendMinor)],
          ["Лиды", totals.leads],
          ["Подтверждено", totals.confirmed],
          ["Оплачено", totals.paid],
          ["Выручка", money(totals.revenueMinor)],
          ["Цена лида", money(costPerLead)],
          ["Цена клиента", money(costPerCustomer)],
          ["ROAS", roas],
          ["Конверсия лид → оплата", conversion],
        ].map(([label, value]) => (
          <div className="admin-card" key={label}>
            <strong>{label}</strong>
            <p>{value}</p>
          </div>
        ))}
      </div>
      <section className="admin-panel admin-panel-wide">
        <h2>{filters.source ? "Кампании" : "Источники"}</h2>
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Источник</th>
                <th>Кампания</th>
                <th>Расход</th>
                <th>Лиды</th>
                <th>Подтверждено</th>
                <th>Оплачено</th>
                <th>Выручка</th>
                <th>Цена лида</th>
                <th>Цена клиента</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={`${row.source}:${row.campaign ?? ""}`}>
                  <td>
                    <Link
                      href={`/admin/advertising?from=${isoDay(from)}&to=${isoDay(toDay)}&source=${row.source}`}
                    >
                      {trafficSourceLabels[row.source]}
                    </Link>
                  </td>
                  <td>
                    {row.campaign ? (
                      <Link
                        href={`/admin/advertising?from=${isoDay(from)}&to=${isoDay(toDay)}&source=${row.source}&campaign=${encodeURIComponent(row.campaign)}`}
                      >
                        {row.campaign}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{money(row.spendMinor)}</td>
                  <td>{row.leads}</td>
                  <td>{row.confirmed}</td>
                  <td>{row.paid}</td>
                  <td>{money(row.revenueMinor)}</td>
                  <td>{money(row.costPerLeadMinor)}</td>
                  <td>{money(row.costPerCustomerMinor)}</td>
                  <td>{row.roas ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Добавить рекламный расход</h2>
        <form action={recordAdvertisingSpend} className="admin-stack-form">
          <label>
            <span>Дата</span>
            <input name="date" required type="date" />
          </label>
          <label>
            <span>Источник</span>
            <select name="source">
              <option value="META_ADS">Meta Ads</option>
              <option value="GOOGLE_ADS">Google Ads</option>
            </select>
          </label>
          <label>
            <span>Кампания</span>
            <input maxLength={200} name="campaignName" />
          </label>
          <label>
            <span>Расход, EUR</span>
            <input
              min="0.01"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </label>
          <button type="submit">Сохранить расход</button>
        </form>
      </section>
    </>
  );
}

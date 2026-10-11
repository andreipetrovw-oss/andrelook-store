import Link from "next/link";

import {
  recordAdvertisingSpend,
  recordCampaignChange,
} from "@/app/(admin)/admin/actions";
import { trafficSourceLabels } from "@/lib/admin/traffic-labels";
import {
  getAdvertisingReport,
  getCampaignOperationLog,
  getEconomicsProductOptions,
} from "@/lib/admin/query";
import type { AdvertisingRow } from "@/lib/measurement/reporting";
import { conversionRate } from "@/lib/measurement/reporting";

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

function number(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("ru-RU").format(value);
}

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function sumAvailable(rows: AdvertisingRow[], field: keyof AdvertisingRow) {
  const values = rows.map((row) => row[field]);
  return values.length && values.every((value) => typeof value === "number")
    ? (values as number[]).reduce((sum, value) => sum + value, 0)
    : null;
}

function aggregateRows(rows: AdvertisingRow[], level: "campaign" | "source") {
  const grouped = new Map<string, AdvertisingRow>();
  for (const row of rows) {
    const groupKey =
      level === "source"
        ? row.source
        : `${row.source}\u0000${row.campaign ?? ""}`;
    const current = grouped.get(groupKey) ?? {
      ...row,
      ad: null,
      adSet: null,
      campaign: level === "source" ? null : row.campaign,
      confirmed: 0,
      clickToVisitRate: null,
      clicks: null,
      contributionAfterAdsMinor: 0,
      contributionBeforeAdsMinor: 0,
      cpcMinor: null,
      cpmMinor: null,
      ctr: null,
      frequency: null,
      impressions: null,
      landingPageViews: null,
      leads: 0,
      linkClicks: null,
      outboundClicks: null,
      paid: 0,
      paymentCostEstimated: false,
      revenueMinor: 0,
      reach: null,
      preorderOpens: 0,
      productViews: 0,
      siteVisits: 0,
      spendMinor: 0,
    };
    current.confirmed += row.confirmed;
    current.leads += row.leads;
    current.paid += row.paid;
    current.preorderOpens += row.preorderOpens;
    current.productViews += row.productViews;
    current.siteVisits += row.siteVisits;
    current.revenueMinor += row.revenueMinor;
    current.spendMinor += row.spendMinor;
    current.paymentCostEstimated ||= row.paymentCostEstimated;
    current.contributionBeforeAdsMinor =
      current.contributionBeforeAdsMinor === null ||
      row.contributionBeforeAdsMinor === null
        ? null
        : current.contributionBeforeAdsMinor + row.contributionBeforeAdsMinor;
    current.contributionAfterAdsMinor =
      current.contributionBeforeAdsMinor === null
        ? null
        : current.contributionBeforeAdsMinor - current.spendMinor;
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
    const groupedRows = [...rows].filter((candidate) => {
      if (level === "source") return candidate.source === current.source;
      return (
        candidate.source === current.source &&
        candidate.campaign === current.campaign
      );
    });
    current.impressions = sumAvailable(groupedRows, "impressions");
    current.reach = sumAvailable(groupedRows, "reach");
    current.linkClicks = sumAvailable(groupedRows, "linkClicks");
    current.outboundClicks = sumAvailable(groupedRows, "outboundClicks");
    current.landingPageViews = sumAvailable(groupedRows, "landingPageViews");
    current.clicks = current.outboundClicks ?? current.linkClicks;
    current.ctr = conversionRate(current.clicks ?? 0, current.impressions);
    current.cpcMinor = current.clicks
      ? Math.round(current.spendMinor / current.clicks)
      : null;
    current.cpmMinor = current.impressions
      ? Math.round((current.spendMinor * 1_000) / current.impressions)
      : null;
    current.frequency =
      current.impressions !== null && current.reach
        ? Number((current.impressions / current.reach).toFixed(2))
        : null;
    current.clickToVisitRate = conversionRate(
      current.siteVisits,
      current.clicks,
    );
    grouped.set(groupKey, current);
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
  const [report, operationLog, economicsProducts] = await Promise.all([
    getAdvertisingReport({ from, to }),
    getCampaignOperationLog(),
    getEconomicsProductOptions(),
  ]);
  const allRows = report.rows;
  const rows = allRows.filter(
    (row) =>
      (!filters.source || row.source === filters.source) &&
      (!filters.campaign || row.campaign === filters.campaign),
  );
  const displayRows = !filters.source
    ? aggregateRows(rows, "source")
    : !filters.campaign
      ? aggregateRows(rows, "campaign")
      : rows;
  const totals = rows.reduce(
    (sum, row) => ({
      confirmed: sum.confirmed + row.confirmed,
      preorderOpens: sum.preorderOpens + row.preorderOpens,
      productViews: sum.productViews + row.productViews,
      siteVisits: sum.siteVisits + row.siteVisits,
      leads: sum.leads + row.leads,
      paid: sum.paid + row.paid,
      contributionBeforeAdsMinor:
        sum.contributionBeforeAdsMinor === null ||
        row.contributionBeforeAdsMinor === null
          ? null
          : sum.contributionBeforeAdsMinor + row.contributionBeforeAdsMinor,
      revenueMinor: sum.revenueMinor + row.revenueMinor,
      spendMinor: sum.spendMinor + row.spendMinor,
    }),
    {
      confirmed: 0,
      contributionBeforeAdsMinor: 0 as number | null,
      leads: 0,
      paid: 0,
      preorderOpens: 0,
      productViews: 0,
      revenueMinor: 0,
      spendMinor: 0,
      siteVisits: 0,
    },
  );
  const metaRows = rows.filter((row) => row.source === "META_ADS");
  const impressions = sumAvailable(metaRows, "impressions");
  const reach = sumAvailable(metaRows, "reach");
  const outboundClicks = sumAvailable(metaRows, "outboundClicks");
  const linkClicks = sumAvailable(metaRows, "linkClicks");
  const landingPageViews = sumAvailable(metaRows, "landingPageViews");
  const metaSpendMinor = metaRows.reduce((sum, row) => sum + row.spendMinor, 0);
  const metaSiteVisits = metaRows.reduce((sum, row) => sum + row.siteVisits, 0);
  const clicks = outboundClicks ?? linkClicks;
  const ctr = conversionRate(clicks ?? 0, impressions);
  const cpc = clicks ? Math.round(metaSpendMinor / clicks) : null;
  const cpm = impressions
    ? Math.round((metaSpendMinor * 1_000) / impressions)
    : null;
  const frequency = impressions !== null && reach ? impressions / reach : null;
  const contributionAfterAds =
    totals.contributionBeforeAdsMinor === null
      ? null
      : totals.contributionBeforeAdsMinor - totals.spendMinor;
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
        — датой рекламной записи. Вклад до рекламы вычитает сохранённую landed
        cost и фактическую комиссию оплаты; если комиссия не указана, для нового
        заказа используется сохранённая расчётная ставка. Неполные исторические
        данные отображаются как «—». Тестовые заказы исключены.
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
      <h2>Привлечение</h2>
      <div className="admin-cards">
        {[
          ["Расход", money(totals.spendMinor)],
          ["Показы", number(impressions)],
          ["Охват", number(reach)],
          ["Клики", number(clicks)],
          ["Meta LPV", number(landingPageViews)],
          ["Визиты", totals.siteVisits],
          ["CTR", percent(ctr)],
          ["CPC", money(cpc)],
          ["CPM", money(cpm)],
          ["Частота", frequency === null ? "—" : frequency.toFixed(2)],
        ].map(([label, value]) => (
          <div className="admin-card" key={label}>
            <strong>{label}</strong>
            <p>{value}</p>
          </div>
        ))}
      </div>
      <h2>Воронка сайта</h2>
      <div className="admin-cards">
        {[
          ["Визиты", totals.siteVisits],
          ["Просмотры товаров", totals.productViews],
          ["Открытия предзаказа", totals.preorderOpens],
          ["Лиды", totals.leads],
          ["Подтверждено", totals.confirmed],
          ["Оплачено", totals.paid],
          ["Клик → визит", percent(conversionRate(metaSiteVisits, clicks))],
          [
            "Визит → товар",
            percent(conversionRate(totals.productViews, totals.siteVisits)),
          ],
          [
            "Товар → предзаказ",
            percent(conversionRate(totals.preorderOpens, totals.productViews)),
          ],
          [
            "Предзаказ → лид",
            percent(conversionRate(totals.leads, totals.preorderOpens)),
          ],
          [
            "Лид → подтверждено",
            percent(conversionRate(totals.confirmed, totals.leads)),
          ],
          ["Лид → оплата", percent(conversionRate(totals.paid, totals.leads))],
          [
            "Визит → лид",
            percent(conversionRate(totals.leads, totals.siteVisits)),
          ],
          [
            "Визит → оплата",
            percent(conversionRate(totals.paid, totals.siteVisits)),
          ],
        ].map(([label, value]) => (
          <div className="admin-card" key={label}>
            <strong>{label}</strong>
            <p>{value}</p>
          </div>
        ))}
      </div>
      <h2>Бизнес-результат</h2>
      <div className="admin-cards">
        {[
          ["Выручка", money(totals.revenueMinor)],
          ["Вклад до рекламы", money(totals.contributionBeforeAdsMinor)],
          ["Вклад после рекламы", money(contributionAfterAds)],
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
        <h2>
          {filters.campaign
            ? "Группы и объявления"
            : filters.source
              ? "Кампании"
              : "Источники"}
        </h2>
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Источник</th>
                <th>Кампания</th>
                {filters.campaign ? <th>Группа объявлений</th> : null}
                {filters.campaign ? <th>Объявление</th> : null}
                <th>Расход</th>
                <th>Показы</th>
                <th>Охват</th>
                <th>Клики</th>
                <th>Meta LPV</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>CPM</th>
                <th>Визиты</th>
                <th>Товары</th>
                <th>Предзаказы</th>
                <th>Лиды</th>
                <th>Подтверждено</th>
                <th>Оплачено</th>
                <th>Выручка</th>
                <th>Вклад до рекламы</th>
                <th>Вклад после рекламы</th>
                <th>Цена лида</th>
                <th>Цена клиента</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr
                  key={`${row.source}:${row.campaign ?? ""}:${row.adSet ?? ""}:${row.ad ?? ""}`}
                >
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
                  {filters.campaign ? <td>{row.adSet ?? "—"}</td> : null}
                  {filters.campaign ? <td>{row.ad ?? "—"}</td> : null}
                  <td>{money(row.spendMinor)}</td>
                  <td>{number(row.impressions)}</td>
                  <td>{number(row.reach)}</td>
                  <td>{number(row.clicks)}</td>
                  <td>{number(row.landingPageViews)}</td>
                  <td>{percent(row.ctr)}</td>
                  <td>{money(row.cpcMinor)}</td>
                  <td>{money(row.cpmMinor)}</td>
                  <td>{row.siteVisits}</td>
                  <td>{row.productViews}</td>
                  <td>{row.preorderOpens}</td>
                  <td>{row.leads}</td>
                  <td>{row.confirmed}</td>
                  <td>{row.paid}</td>
                  <td>{money(row.revenueMinor)}</td>
                  <td>{money(row.contributionBeforeAdsMinor)}</td>
                  <td>{money(row.contributionAfterAdsMinor)}</td>
                  <td>{money(row.costPerLeadMinor)}</td>
                  <td>{money(row.costPerCustomerMinor)}</td>
                  <td>{row.roas ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel admin-panel-wide">
        <h2>Посадочные страницы</h2>
        <p className="admin-overview-note">
          Визит относится к первой странице сессии. Лиды и оплаты используют
          сохранённый снимок атрибуции заказа; неизвестные исторические данные
          не восстанавливаются оценками.
        </p>
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Страница</th>
                <th>Визиты</th>
                <th>Лиды</th>
                <th>Оплачено</th>
                <th>Выручка</th>
                <th>Визит → лид</th>
                <th>Визит → оплата</th>
              </tr>
            </thead>
            <tbody>
              {report.landingRows.map((item) => (
                <tr key={item.landingPage}>
                  <td>{item.landingPage}</td>
                  <td>{item.visits}</td>
                  <td>{item.leads}</td>
                  <td>{item.paid}</td>
                  <td>{money(item.revenueMinor)}</td>
                  <td>{percent(item.leadConversionRate)}</td>
                  <td>{percent(item.paidConversionRate)}</td>
                </tr>
              ))}
              {report.landingRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>Надёжных данных за период пока нет.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel admin-panel-wide">
        <h2>Товарная воронка</h2>
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Просмотры</th>
                <th>Открытия предзаказа</th>
                <th>Лиды</th>
                <th>Оплачено</th>
                <th>Выручка</th>
              </tr>
            </thead>
            <tbody>
              {report.productRows.map((item) => (
                <tr key={item.productId}>
                  <td>{item.productName}</td>
                  <td>{item.productViews}</td>
                  <td>{item.preorderOpens}</td>
                  <td>{item.leads}</td>
                  <td>{item.paid}</td>
                  <td>{money(item.revenueMinor)}</td>
                </tr>
              ))}
              {report.productRows.length === 0 ? (
                <tr>
                  <td colSpan={6}>Надёжных данных за период пока нет.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Качество данных</h2>
        <p className="admin-overview-note">
          Meta Insights: {report.diagnostics.metaStatus}. Последняя успешная
          синхронизация:{" "}
          {report.diagnostics.metaLastSuccessAt?.toLocaleString("ru-RU") ?? "—"}
          . Строк импортировано:{" "}
          {report.diagnostics.metaLastImportedRows ?? "—"}. Отчёт рассчитан:{" "}
          {report.diagnostics.generatedAt.toLocaleString("ru-RU")}.
        </p>
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
          <label>
            <span>Товар (только если расход относится к нему напрямую)</span>
            <select name="productId">
              <option value="">Не распределять на товар</option>
              {economicsProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.internalCode} · {product.translations[0]?.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Сохранить расход</button>
        </form>
      </section>
      <section className="admin-panel admin-panel-wide">
        <h2>Журнал изменений кампаний</h2>
        <p className="admin-overview-note">
          Фиксируйте изменение, причину и дату. Это операционный журнал, а не
          замена истории Meta Ads Manager.
        </p>
        <form action={recordCampaignChange} className="admin-stack-form">
          <label>
            <span>Дата</span>
            <input
              defaultValue={isoDay(calendarToday)}
              name="changedAt"
              required
              type="date"
            />
          </label>
          <label>
            <span>Кампания / UTM</span>
            <input maxLength={200} name="campaignName" required />
          </label>
          <label>
            <span>Изменение</span>
            <textarea maxLength={500} name="change" required rows={3} />
          </label>
          <label>
            <span>Причина</span>
            <textarea maxLength={500} name="reason" rows={3} />
          </label>
          <button type="submit">Записать изменение</button>
        </form>
        <div className="admin-table-wrap" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Кампания</th>
                <th>Изменение</th>
                <th>Причина</th>
              </tr>
            </thead>
            <tbody>
              {operationLog.map((entry) => (
                <tr key={entry.id}>
                  <td>{isoDay(entry.changedAt)}</td>
                  <td>{entry.campaign?.utmCampaign ?? entry.campaignName}</td>
                  <td>{entry.change}</td>
                  <td>{entry.reason ?? "—"}</td>
                </tr>
              ))}
              {operationLog.length === 0 ? (
                <tr>
                  <td colSpan={4}>Изменений пока нет.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

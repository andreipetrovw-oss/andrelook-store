import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { getAdvertisingReport } from "@/lib/admin/query";
import { reportingPeriod } from "@/lib/measurement/periods";
import {
  liveCampaignId,
  liveSnapshotSchema,
  unitCost,
} from "@/lib/measurement/meta-metrics";
import { metaSpendSyncAllowedForRuntime } from "@/lib/measurement/meta-spend";
import { refreshMetaCampaign } from "./meta-actions";

const n = (value: number | null, suffix = "") =>
  value === null
    ? "—"
    : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)}${suffix}`;
const money = (value: number | null) =>
  value === null ? "—" : n(value / 100, " EUR");
const time = (value: string | Date) =>
  new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Tallinn",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

async function reportingClock() {
  return Date.now();
}

export default async function LiveMetaCampaign({
  syncResult,
}: {
  syncResult?: string;
}) {
  await requireOwner();
  const now = await reportingClock();
  const prisma = getPrisma();
  const [campaign, source] = await Promise.all([
    prisma.campaign.findFirst({
      where: { source: "META_ADS", externalCampaignId: liveCampaignId },
    }),
    prisma.analyticsDataSourceStatus.findUnique({
      where: { source: "META_INSIGHTS" },
    }),
  ]);
  const parsed = liveSnapshotSchema.safeParse(campaign?.metaSnapshot);
  const snapshot = parsed.success ? parsed.data : null;
  const allowed = metaSpendSyncAllowedForRuntime();
  const stale =
    !source?.lastSuccessAt || now - source.lastSuccessAt.getTime() > 7_200_000;
  const rows = (values: Array<[string, string]>) => (
    <dl className="admin-meta-metrics">
      {values.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
  const report = snapshot
    ? await getAdvertisingReport({
        ...reportingPeriod(snapshot.from, snapshot.through),
        source: "META_ADS",
        campaign: snapshot.utmCampaign,
      })
    : null;
  const m = snapshot?.metrics;
  const web = report?.website;
  const business = report?.business;
  const statuses: Record<string, string> = {
    ACTIVE: "Активна",
    PAUSED: "Приостановлена",
    CAMPAIGN_PAUSED: "Приостановлена",
    ADSET_PAUSED: "Приостановлена",
    PENDING_REVIEW: "На проверке",
    IN_PROCESS: "Подготовка",
    WITH_ISSUES: "Требует внимания",
    DISAPPROVED: "Отклонена",
    ARCHIVED: "В архиве",
    DELETED: "Удалена",
  };
  const delivery =
    snapshot &&
    snapshot.status === "ACTIVE" &&
    snapshot.ads.length &&
    snapshot.ads.every((ad) =>
      ["IN_PROCESS", "PENDING_REVIEW"].includes(ad.status),
    )
      ? "Подготовка"
      : snapshot
        ? (statuses[snapshot.status] ?? "Статус доступен в деталях")
        : "Ещё не синхронизирована";
  const duration =
    snapshot?.startTime && snapshot.endTime
      ? (Date.parse(snapshot.endTime) - Date.parse(snapshot.startTime)) /
        86400000
      : null;
  const elapsed =
    snapshot?.startTime && duration
      ? Math.min(
          duration,
          Math.max(0, (now - Date.parse(snapshot.startTime)) / 86400000),
        )
      : null;
  return (
    <section
      aria-labelledby="live-meta-heading"
      className="admin-panel admin-live-meta"
    >
      <h2 id="live-meta-heading">WINTER VEZERE 30D TEST</h2>
      <p>Meta → сайт Andrelook → реальные заказы. {delivery}.</p>
      <p>
        Последний Meta sync:{" "}
        {source?.lastSuccessAt ? time(source.lastSuccessAt) : "—"}{" "}
        (Europe/Tallinn).
      </p>
      {(stale || source?.status === "ERROR") && (
        <p role="status">
          Данные устарели или синхронизация не завершена. Последний успешный
          снимок сохранён.
        </p>
      )}
      {syncResult && (
        <p role="status">
          {syncResult === "ok"
            ? "Meta обновлена."
            : syncResult === "throttled"
              ? "Обновление уже выполняется или недавно завершилось. Повторите позже."
              : syncResult === "disabled"
                ? "Production sync недоступен в этом окружении."
                : "Не удалось обновить Meta. Последние данные сохранены."}
        </p>
      )}
      <form action={refreshMetaCampaign}>
        <button disabled={!allowed} type="submit">
          Обновить Meta
        </button>
      </form>
      {!allowed && (
        <p>
          Staging: production Meta API отключён. Данные здесь не отправляются в
          Meta.
        </p>
      )}
      {snapshot && m && web && business && (
        <>
          <p>
            Период кампании: {snapshot.from} — {snapshot.through}. Календарь
            Meta: {snapshot.accountTimezone}. Дни: {n(elapsed)} / {n(duration)}.
          </p>
          <p>
            Расход: {money(m.spendMinor)} /{" "}
            {money(snapshot.lifetimeBudgetMinor)} за весь срок. Начало:{" "}
            {snapshot.startTime ? time(snapshot.startTime) : "—"}; окончание:{" "}
            {snapshot.endTime ? time(snapshot.endTime) : "—"}.
          </p>
          <h3>Meta — доставка рекламы</h3>
          {rows([
            ["Показы", n(m.impressions)],
            ["Охват за период (Meta)", n(m.reach)],
            ["Частота", n(m.frequency)],
            ["Клики по ссылке", n(m.linkClicks)],
            ["Исходящие клики", n(m.outboundClicks)],
            ["CTR по ссылке", n(m.ctr, "%")],
            ["CPC по ссылке", money(m.cpcMinor)],
            ["CPM", money(m.cpmMinor)],
            ["Meta LPV", n(m.landingPageViews)],
            ["Цена Meta LPV", money(m.costPerLandingPageMinor)],
            ["Meta-атрибутированные лиды", n(m.metaLeads)],
            ["Цена Meta Lead", money(m.costPerMetaLeadMinor)],
          ])}
          <h3>Видео</h3>
          {rows([
            ["Запуски видео", n(m.videoPlays)],
            ["Среднее время просмотра", n(m.averageWatchSeconds, " с")],
            ["Досмотр 100% / запуски", n(m.completionRate, "%")],
          ])}
          <details>
            <summary>Детали просмотра видео</summary>
            {rows([
              ["Просмотры 3 секунды", n(m.video3SecondViews)],
              ["25%", n(m.watched25)],
              ["50%", n(m.watched50)],
              ["75%", n(m.watched75)],
              ["95%", n(m.watched95)],
              ["100%", n(m.watched100)],
            ])}
          </details>
          <h3>Сайт Andrelook — сессии</h3>
          {rows([
            ["Сессии кампании", n(web.sessions)],
            ["Сессии с товаром", n(web.productViewSessions)],
            ["Сессии с открытием предзаказа", n(web.preorderOpenSessions)],
            ["Заказы сайта с подтверждённой связью", n(web.websiteOrders)],
          ])}
          <h3>CRM — результат и деньги</h3>
          {rows([
            ["Обращения когорты", n(business.leads)],
            ["Контакт установлен", n(business.contacted)],
            ["Подтверждено", n(business.confirmed)],
            ["Полностью оплачено", n(business.fullyPaid)],
            ["Доставлено", n(business.delivered)],
            ["Стоимость действующих заказов", money(business.orderValueMinor)],
            ["Получено денег за период", money(business.cashReceivedMinor)],
            ["Остаток действующей когорты", money(business.outstandingMinor)],
            [
              "Cash ROAS",
              m.spendMinor && business.cashReceivedMinor > 0
                ? n(business.cashReceivedMinor / m.spendMinor)
                : "—",
            ],
          ])}
          <h3>Цена результата</h3>
          {rows([
            ["Цена сессии", money(unitCost(m.spendMinor, web.sessions))],
            [
              "Цена открытия предзаказа",
              money(unitCost(m.spendMinor, web.preorderOpenSessions)),
            ],
            [
              "Цена заказа сайта",
              money(unitCost(m.spendMinor, web.websiteOrders)),
            ],
            [
              "Цена подтверждённого заказа",
              money(unitCost(m.spendMinor, business.confirmed)),
            ],
            [
              "Цена полностью оплаченного заказа",
              money(unitCost(m.spendMinor, business.fullyPaid)),
            ],
          ])}
          <p title="Meta использует собственное окно атрибуции и моделирование. Andrelook учитывает согласие и подтверждённую связь сессии с заказом; ручные/исторические связи не угадываются.">
            Meta Leads и заказы сайта — разные источники; числа не обязаны
            совпадать. Тестовые заказы исключены. Плановые 10% на рекламу здесь
            не используются.
          </p>
          <p>
            <strong>
              {web.sessions < 100 || business.leads < 10
                ? "НЕДОСТАТОЧНО ДАННЫХ"
                : "НАБЛЮДАТЬ"}
            </strong>{" "}
            — ранняя выборка не даёт оснований автоматически менять рекламу.
          </p>
          <details>
            <summary>Кампания → группа → объявление</summary>
            <p>
              {snapshot.campaignName} · {snapshot.campaignId}
            </p>
            {snapshot.ads.map((ad) => {
              const attributed = report.rows.find(
                (row) =>
                  row.source === "META_ADS" &&
                  row.campaign === snapshot.utmCampaign &&
                  row.adSet === ad.utmAdSet &&
                  row.ad === ad.utmAd,
              );
              return (
                <div key={ad.id}>
                  <h4>
                    {ad.adSetName} → {ad.name}
                  </h4>
                  <p>
                    {ad.adSetId} → {ad.id} · {statuses[ad.status] ?? ad.status}
                  </p>
                  {rows([
                    ["Расход", money(ad.metrics.spendMinor)],
                    ["Показы", n(ad.metrics.impressions)],
                    ["Охват объявления за период", n(ad.metrics.reach)],
                    ["Клики", n(ad.metrics.linkClicks)],
                    ["Запуски видео", n(ad.metrics.videoPlays)],
                    ["Среднее время", n(ad.metrics.averageWatchSeconds, " с")],
                    ["Сессии сайта", n(attributed?.siteVisits ?? 0)],
                    ["Сессии с товаром", n(attributed?.productViews ?? 0)],
                    ["Открытия предзаказа", n(attributed?.preorderOpens ?? 0)],
                    ["Обращения CRM", n(attributed?.leads ?? 0)],
                    ["Подтверждено", n(attributed?.confirmed ?? 0)],
                    ["Полностью оплачено", n(attributed?.paid ?? 0)],
                    ["Получено денег", money(attributed?.revenueMinor ?? 0)],
                  ])}
                  <p>
                    UTM: {snapshot.utmCampaign} / {ad.utmAdSet} / {ad.utmAd}
                  </p>
                </div>
              );
            })}
          </details>
        </>
      )}
      {!snapshot && (
        <p>
          Подтверждённого API-снимка этой кампании ещё нет. Нулевые расходы и
          статистика не подставляются.
        </p>
      )}
    </section>
  );
}

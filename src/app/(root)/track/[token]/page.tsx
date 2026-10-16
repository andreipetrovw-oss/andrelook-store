import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicTrackingOrder } from "@/lib/tracking/public";
import { trackingCopy, trackingLocale } from "@/lib/tracking/copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = trackingLocale((await searchParams).lang);
  return {
    robots: { follow: false, index: false, nocache: true },
    title: `${trackingCopy[locale].lookupTitle} · Andrelook`,
  };
}

export default async function TrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { token } = await params;
  const { lang } = await searchParams;
  const requestedLocale = lang ? trackingLocale(lang) : undefined;
  const order = await getPublicTrackingOrder(token, requestedLocale);
  if (!order) notFound();
  const locale = order.locale;
  const labels = trackingCopy[locale];
  const localeCode = locale.toLowerCase();
  const dateTime = new Intl.DateTimeFormat(localeCode, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Tallinn",
  });
  const etaDate = new Intl.DateTimeFormat(localeCode, {
    dateStyle: "medium",
    timeZone: "Europe/Tallinn",
  });
  const etaFrom = order.estimatedDeliveryFrom
    ? new Date(order.estimatedDeliveryFrom)
    : null;
  const etaTo = order.estimatedDeliveryTo
    ? new Date(order.estimatedDeliveryTo)
    : null;
  return (
    <main className="tracking-shell">
      <Link className="tracking-wordmark" href={`/${locale.toLowerCase()}`}>
        ANDRELOOK
      </Link>
      <article className="tracking-card tracking-card-wide">
        <nav aria-label="Language" className="tracking-language">
          {(["ET", "RU", "EN"] as const).map((value) => (
            <Link
              aria-current={value === locale ? "page" : undefined}
              href={`/track/${token}?lang=${value.toLowerCase()}`}
              key={value}
            >
              {value}
            </Link>
          ))}
        </nav>
        <span className="eyebrow">Andrelook</span>
        <h1 className="tracking-order-number">{order.reference}</h1>
        <p className="tracking-current-status">{order.statusLabel}</p>
        <p>{labels.network}</p>
        {order.status === "IN_TRANSIT" ? <p>{labels.note}</p> : null}
        <dl className="tracking-facts">
          <div>
            <dt>{labels.method}</dt>
            <dd>{order.deliveryMethod}</dd>
          </div>
          <div>
            <dt>{labels.last}</dt>
            <dd>
              {order.lastUpdatedAt
                ? dateTime.format(new Date(order.lastUpdatedAt))
                : "—"}
            </dd>
          </div>
          {etaFrom || etaTo ? (
            <div>
              <dt>{labels.eta}</dt>
              <dd>
                {etaFrom && etaTo
                  ? etaDate.formatRange(etaFrom, etaTo)
                  : etaDate.format((etaFrom ?? etaTo)!)}
              </dd>
            </div>
          ) : null}
          {order.carrierName || order.trackingNumber ? (
            <div>
              <dt>{labels.carrier}</dt>
              <dd>
                {[order.carrierName, order.trackingNumber]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
          ) : null}
        </dl>
        <section>
          <h2>{labels.items}</h2>
          <ul className="tracking-items">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                <strong>{item.name}</strong>
                <span>
                  {[item.colour, item.size, `× ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{labels.timeline}</h2>
          <ol className="tracking-timeline">
            {order.timeline.toReversed().map((event, index) => (
              <li key={`${event.status}-${event.occurredAt}-${index}`}>
                <span aria-hidden="true" />
                <div>
                  <strong>{event.label}</strong>
                  {event.occurredAt ? (
                    <time dateTime={event.occurredAt}>
                      {dateTime.format(new Date(event.occurredAt))}
                    </time>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
        <Link
          className="tracking-refresh"
          href={`/track/${token}?lang=${localeCode}`}
          replace
        >
          {labels.refresh}
        </Link>
        <a
          className="tracking-support"
          href="https://t.me/andrelookstore"
          rel="noreferrer"
          target="_blank"
        >
          Telegram ↗
        </a>
      </article>
    </main>
  );
}

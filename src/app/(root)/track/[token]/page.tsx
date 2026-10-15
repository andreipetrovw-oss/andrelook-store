import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicTrackingOrder } from "@/lib/tracking/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Andrelook order tracking",
};

const copy = {
  EN: {
    eta: "Estimated delivery",
    items: "Your order",
    last: "Last confirmed update",
    method: "Delivery method",
    carrier: "Local carrier",
    network:
      "Tracking information is updated automatically from Andrelook’s logistics network.",
    note: "Your shipment is in the logistics network. The next update will appear after a confirmed operational or carrier event.",
    timeline: "Order journey",
  },
  ET: {
    eta: "Eeldatav tarne",
    items: "Sinu tellimus",
    last: "Viimane kinnitatud uuendus",
    method: "Kättesaamisviis",
    carrier: "Kohalik vedaja",
    network:
      "Jälgimisteavet uuendatakse automaatselt Andrelooki logistikavõrgust.",
    note: "Saadetis on logistikavõrgus. Järgmine uuendus ilmub pärast kinnitatud töö- või vedajasündmust.",
    timeline: "Tellimuse teekond",
  },
  RU: {
    eta: "Ожидаемая доставка",
    items: "Ваш заказ",
    last: "Последнее подтверждённое обновление",
    method: "Способ получения",
    carrier: "Местный перевозчик",
    network:
      "Информация обновляется автоматически из логистической сети Andrelook.",
    note: "Отправление находится в логистической сети. Следующее обновление появится после подтверждённого события Andrelook или перевозчика.",
    timeline: "Путь заказа",
  },
} as const;

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getPublicTrackingOrder(token);
  if (!order) notFound();
  const locale = order.locale;
  const labels = copy[locale];
  return (
    <main className="tracking-shell">
      <Link className="tracking-wordmark" href={`/${locale.toLowerCase()}`}>
        ANDRELOOK
      </Link>
      <article className="tracking-card tracking-card-wide">
        <span className="eyebrow">Andrelook order</span>
        <h1>{order.reference}</h1>
        <p className="tracking-current-status">{order.statusLabel}</p>
        <p>{labels.network}</p>
        {order.status === "HANDED_TO_LOGISTICS" ? <p>{labels.note}</p> : null}
        <dl className="tracking-facts">
          <div>
            <dt>{labels.method}</dt>
            <dd>{order.deliveryMethod}</dd>
          </div>
          <div>
            <dt>{labels.last}</dt>
            <dd>
              {order.lastUpdatedAt
                ? new Intl.DateTimeFormat(locale.toLowerCase(), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(order.lastUpdatedAt))
                : "—"}
            </dd>
          </div>
          {order.estimatedDeliveryAt ? (
            <div>
              <dt>{labels.eta}</dt>
              <dd>
                {new Intl.DateTimeFormat(locale.toLowerCase(), {
                  dateStyle: "medium",
                }).format(new Date(order.estimatedDeliveryAt))}
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
                      {new Intl.DateTimeFormat(locale.toLowerCase(), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(event.occurredAt))}
                    </time>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
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

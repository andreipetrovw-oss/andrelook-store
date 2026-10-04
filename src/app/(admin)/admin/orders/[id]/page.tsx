import { OrderStatus, PaymentKind } from "@prisma/client";
import { notFound } from "next/navigation";

import { getAdminOrder } from "@/lib/admin/query";

import {
  recordPayment,
  retryOrderNotification,
  updateOrderStatus,
} from "../../actions";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  return (
    <>
      <span className="eyebrow">{order.displayNumber}</span>
      <h1>{order.customer.name}</h1>
      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Contact</h2>
          <dl>
            <div>
              <dt>Method</dt>
              <dd>{order.customer.preferredContactMethod}</dd>
            </div>
            <div>
              <dt>Value</dt>
              <dd>{order.customer.preferredContactValue}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{order.customer.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.customer.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Locale</dt>
              <dd>{order.requestedLocale}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{order.acquisitionChannel}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Request</h2>
          {order.items.map((item) => (
            <dl key={item.id}>
              <div>
                <dt>Product</dt>
                <dd>{item.productNameSnapshot}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>
                  {item.sizeHelpRequested
                    ? "Sizing help requested"
                    : (item.sizeSnapshot ?? "Pending")}
                </dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{item.quantity}</dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd>{item.colorSnapshot ?? "Pending"}</dd>
              </div>
              <div>
                <dt>Price snapshot</dt>
                <dd>
                  {item.unitPriceMinor === null || !order.currency
                    ? "Pending"
                    : `${(item.unitPriceMinor / 100).toFixed(2)} ${order.currency}`}
                </dd>
              </div>
              <div>
                <dt>Measurements / sizing note</dt>
                <dd>{item.measurementsNote ?? "—"}</dd>
              </div>
            </dl>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Fulfilment & payment</h2>
          <dl>
            <div>
              <dt>Method</dt>
              <dd>{order.fulfilmentMethod?.replaceAll("_", " ") ?? "—"}</dd>
            </div>
            <div>
              <dt>Payment preference</dt>
              <dd>{order.paymentPreference?.replaceAll("_", " ") ?? "—"}</dd>
            </div>
            <div>
              <dt>Country / city</dt>
              <dd>
                {order.countryCode ?? "—"} · {order.city ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                {[order.addressLine1, order.addressLine2, order.postalCode]
                  .filter(Boolean)
                  .join(", ") || "Personal handover"}
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Attribution</h2>
          <dl>
            <div>
              <dt>Channel</dt>
              <dd>{order.acquisitionChannel}</dd>
            </div>
            <div>
              <dt>UTM</dt>
              <dd>
                {[
                  order.utmSource,
                  order.utmMedium,
                  order.utmCampaign,
                  order.utmContent,
                  order.utmTerm,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Direct / none"}
              </dd>
            </div>
            <div>
              <dt>Landing path</dt>
              <dd>{order.landingPath ?? "—"}</dd>
            </div>
            <div>
              <dt>Initial referrer</dt>
              <dd>{order.initialReferrer ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Owner notification</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{order.notification?.status ?? "Not attempted"}</dd>
            </div>
            <div>
              <dt>Recipient</dt>
              <dd>{order.notification?.recipient ?? "—"}</dd>
            </div>
            <div>
              <dt>Attempts</dt>
              <dd>{order.notification?.attempts ?? 0}</dd>
            </div>
            <div>
              <dt>Provider ID</dt>
              <dd>{order.notification?.providerMessageId ?? "—"}</dd>
            </div>
            <div>
              <dt>Last error</dt>
              <dd>{order.notification?.lastError ?? "—"}</dd>
            </div>
          </dl>
          {order.notification?.status !== "SENT" ? (
            <form action={retryOrderNotification} className="admin-stack-form">
              <input name="orderId" type="hidden" value={order.id} />
              <button type="submit">Retry owner notification</button>
            </form>
          ) : null}
        </section>
        <section className="admin-panel">
          <h2>Operations</h2>
          <dl>
            <div>
              <dt>Supplier ordered</dt>
              <dd>
                {order.supplierOrderedAt?.toLocaleDateString("en-GB") ?? "—"}
              </dd>
            </div>
            <div>
              <dt>ETA</dt>
              <dd>
                {order.etaText ??
                  order.etaDate?.toLocaleDateString("en-GB") ??
                  "—"}
              </dd>
            </div>
            <div>
              <dt>Tracking</dt>
              <dd>{order.trackingReference ?? "—"}</dd>
            </div>
            <div>
              <dt>Next action</dt>
              <dd>{order.nextActionAt?.toLocaleString("en-GB") ?? "—"}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{order.internalNotes ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Status</h2>
          <form action={updateOrderStatus} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <select defaultValue={order.status} name="status">
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <input name="note" placeholder="Optional timeline note" />
            <button type="submit">Update status</button>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Payments</h2>
          <p>
            Paid: {(order.paidMinor / 100).toFixed(2)} {order.currency ?? ""}
          </p>
          <p>
            Balance:{" "}
            {order.balanceMinor === null
              ? "Pending confirmed total"
              : `${(order.balanceMinor / 100).toFixed(2)} ${order.currency ?? ""}`}
          </p>
          <form action={recordPayment} className="admin-stack-form">
            <input name="orderId" type="hidden" value={order.id} />
            <select name="kind">
              {Object.values(PaymentKind).map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <input
              inputMode="decimal"
              min="0.01"
              name="amount"
              placeholder="Amount"
              required
              step="0.01"
            />
            <input
              defaultValue={order.currency ?? "EUR"}
              maxLength={3}
              name="currency"
              required
            />
            <input name="reference" placeholder="Reference" />
            <button type="submit">Record payment</button>
          </form>
          <ul className="timeline">
            {order.payments.map((payment) => (
              <li key={payment.id}>
                {payment.kind} · {(payment.amountMinor / 100).toFixed(2)}{" "}
                {payment.currency} ·{" "}
                {payment.receivedAt.toLocaleDateString("en-GB")}
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-panel">
          <h2>Timeline</h2>
          <ol className="timeline">
            {order.statusHistory.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.toStatus.replaceAll("_", " ")}</strong>
                <span>{entry.createdAt.toLocaleString("en-GB")}</span>
                {entry.note ? <p>{entry.note}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { TrackingLookupForm } from "@/components/tracking-lookup-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Track your Andrelook order",
};

export default function TrackingLookupPage() {
  return (
    <main className="tracking-shell">
      <Link className="tracking-wordmark" href="/et">
        ANDRELOOK
      </Link>
      <section className="tracking-card">
        <span className="eyebrow">Andrelook order</span>
        <h1>Track your order</h1>
        <p>
          Enter the order number and customer email used for the order. Tracking
          details are protected and cannot be searched by order number alone.
        </p>
        <TrackingLookupForm />
        <a
          className="tracking-support"
          href="https://t.me/andrelookstore"
          rel="noreferrer"
          target="_blank"
        >
          Need help? Contact Andrelook ↗
        </a>
      </section>
    </main>
  );
}

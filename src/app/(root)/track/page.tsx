import type { Metadata } from "next";
import Link from "next/link";

import { TrackingLookupForm } from "@/components/tracking-lookup-form";
import { trackingCopy, trackingLocale } from "@/lib/tracking/copy";

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

export default async function TrackingLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = trackingLocale(lang);
  const copy = trackingCopy[locale];
  return (
    <main className="tracking-shell">
      <Link className="tracking-wordmark" href={`/${locale.toLowerCase()}`}>
        ANDRELOOK
      </Link>
      <section className="tracking-card">
        <nav aria-label="Language" className="tracking-language">
          {(["ET", "RU", "EN"] as const).map((value) => (
            <Link
              aria-current={value === locale ? "page" : undefined}
              href={`/track?lang=${value.toLowerCase()}`}
              key={value}
            >
              {value}
            </Link>
          ))}
        </nav>
        <span className="eyebrow">Andrelook</span>
        <h1>{copy.lookupTitle}</h1>
        <p>{copy.lookupBody}</p>
        <TrackingLookupForm locale={locale} />
        <a
          className="tracking-support"
          href="https://t.me/andrelookstore"
          rel="noreferrer"
          target="_blank"
        >
          {copy.support}
        </a>
      </section>
    </main>
  );
}

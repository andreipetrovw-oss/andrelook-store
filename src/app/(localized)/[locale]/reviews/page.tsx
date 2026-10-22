import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/config/locales";
import { ReviewCards, ReviewsSummary } from "@/components/reviews";
import { reviewCopy } from "@/lib/reviews/copy";
import { getPublishedReviews } from "@/lib/reviews/service";
import {
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = reviewCopy[locale];
  return {
    title: c.title,
    description: c.provenance,
    alternates: localizedAlternates(locale, "reviews"),
    robots: indexingRobots(),
    openGraph: {
      ...localizedOpenGraph(locale),
      title: `${c.title} · Andrelook`,
      description: c.provenance,
      type: "website",
    },
  };
}
export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const reviews = await getPublishedReviews();
  const c = reviewCopy[locale];
  return (
    <section className="container reviews-page">
      <header className="editorial-heading">
        <span className="eyebrow">ANDRELOOK</span>
        <h1>{c.title}</h1>
        <p>{c.provenance}</p>
        <ReviewsSummary reviews={reviews} locale={locale} />
      </header>
      {reviews.length ? (
        <>
          <p className="reviews-order">
            {c.newest} · {c.language}
          </p>
          <ReviewCards reviews={reviews} locale={locale} />
        </>
      ) : (
        <p className="reviews-empty">{c.empty}</p>
      )}
    </section>
  );
}

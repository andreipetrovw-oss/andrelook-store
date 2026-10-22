import Link from "next/link";
import type { Locale } from "@/config/locales";
import { reviewCopy, reviewCountLabel } from "@/lib/reviews/copy";
import { reviewAggregate, type PublicReview } from "@/lib/reviews/model";
import { getPublishedReviews } from "@/lib/reviews/service";

export function ReviewCards({
  reviews,
  locale,
}: {
  reviews: PublicReview[];
  locale: Locale;
}) {
  const c = reviewCopy[locale];
  return (
    <div className="review-cards">
      {reviews.map((r) => (
        <article
          className="review-card"
          id={`review-${r.publicId}`}
          key={r.publicId}
        >
          <div className="review-card-top">
            <span
              className="review-stars"
              aria-label={`${r.rating} ${c.stars}`}
            >
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </span>
            <time dateTime={r.submittedAt}>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeZone: "Europe/Tallinn",
              }).format(new Date(r.submittedAt))}
            </time>
          </div>
          <strong>{r.displayName}</strong>
          <span className="review-verified">{c.verified}</span>
          <p lang={r.locale.toLowerCase()}>{r.text}</p>
          {r.productName ? <small>{r.productName}</small> : null}
        </article>
      ))}
    </div>
  );
}

export function ReviewsSummary({
  reviews,
  locale,
}: {
  reviews: PublicReview[];
  locale: Locale;
}) {
  const a = reviewAggregate(reviews);
  if (!a.count) return null;
  return (
    <div className="reviews-summary">
      <span className="reviews-average">
        {new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
          a.average!,
        )}{" "}
        <small>/ 5</small>
      </span>
      <span>{reviewCountLabel(locale, a.count)}</span>
    </div>
  );
}

export async function HomeReviews({ locale }: { locale: Locale }) {
  const reviews = await getPublishedReviews();
  const c = reviewCopy[locale];
  return (
    <section className="container home-reviews">
      <header className="editorial-heading split-heading">
        <div>
          <span className="eyebrow">ANDRELOOK</span>
          <h2>{c.title}</h2>
          <ReviewsSummary reviews={reviews} locale={locale} />
        </div>
        <p>{c.provenance}</p>
      </header>
      {reviews.length ? (
        <ReviewCards reviews={reviews.slice(0, 3)} locale={locale} />
      ) : (
        <p className="reviews-empty">{c.empty}</p>
      )}
      <Link className="text-action" href={`/${locale}/reviews`}>
        {c.all} ↗
      </Link>
    </section>
  );
}

export function ProductReviews({
  reviews,
  locale,
}: {
  reviews: PublicReview[];
  locale: Locale;
}) {
  if (!reviews.length) return null;
  return (
    <section className="container product-reviews">
      <header className="editorial-heading">
        <h2>{reviewCopy[locale].title}</h2>
        <ReviewsSummary reviews={reviews} locale={locale} />
      </header>
      <ReviewCards reviews={reviews} locale={locale} />
    </section>
  );
}

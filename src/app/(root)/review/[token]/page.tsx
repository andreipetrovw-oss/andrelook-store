import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { CustomerReviewForm } from "@/components/customer-review-form";
import { isLocale } from "@/config/locales";
import { reviewCopy } from "@/lib/reviews/copy";
import { reviewProductName, safeCustomerNames } from "@/lib/reviews/model";
import {
  consumeReviewAttempt,
  resolveReviewInvitation,
} from "@/lib/reviews/service";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = isLocale(lang ?? "") ? (lang as "et" | "ru" | "en") : "et";
  return {
    title: `${reviewCopy[locale].title} · Andrelook`,
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

export default async function ReviewInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { token } = await params;
  const { lang } = await searchParams;
  const h = await headers();
  const allowed = await consumeReviewAttempt(
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    token,
    "read",
  );
  const invitation = allowed ? await resolveReviewInvitation(token) : null;
  const preferred = invitation?.order.requestedLocale.toLowerCase() ?? "et";
  const locale = isLocale(lang ?? "")
    ? (lang as "et" | "ru" | "en")
    : isLocale(preferred)
      ? preferred
      : "et";
  const c = reviewCopy[locale];
  return (
    <main className="review-invitation-shell" lang={locale}>
      <Link className="tracking-wordmark" href={`/${locale}`}>
        ANDRELOOK
      </Link>
      <article className="review-invitation-card">
        <nav className="tracking-language" aria-label={c.languageLabel}>
          {["et", "ru", "en"].map((l) => (
            <Link
              key={l}
              aria-current={l === locale ? "page" : undefined}
              href={`/review/${token}?lang=${l}`}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
        {!invitation ? (
          <>
            <h1>{c.invalid}</h1>
            <Link href={`/${locale}/contact`}>{c.home}</Link>
          </>
        ) : invitation.review ? (
          <>
            <h1>{c.success}</h1>
            <p>{c.already}</p>
            <Link href={`/${locale}`}>{c.home}</Link>
          </>
        ) : (
          <>
            <span className="eyebrow">ANDRELOOK</span>
            <h1>{c.formTitle}</h1>
            <p className="review-form-intro">{c.intro}</p>
            <CustomerReviewForm
              token={token}
              locale={locale}
              names={safeCustomerNames(invitation.order.customer.name)}
              products={invitation.order.items.map((i) =>
                reviewProductName(i.productNameSnapshot, locale, i.product),
              )}
            />
          </>
        )}
      </article>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WithdrawalForm } from "@/components/withdrawal-form";
import { isLocale, locales } from "@/config/locales";
import { withdrawalCopy } from "@/lib/legal/policy";
import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = withdrawalCopy[locale];
  return {
    alternates: localizedAlternates(locale, "withdrawal"),
    description: copy.formIntro,
    openGraph: {
      description: copy.formIntro,
      ...localizedOpenGraph(locale),
      title: brandedTitle(copy.title),
    },
    robots: indexingRobots(),
    title: copy.title,
  };
}

export default async function WithdrawalPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = withdrawalCopy[locale];
  return (
    <article className="information-page withdrawal-page">
      <header className="information-hero">
        <div className="container narrow-container">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.formIntro}</p>
        </div>
      </header>
      <div className="container narrow-container withdrawal-body">
        <WithdrawalForm locale={locale} />
      </div>
    </article>
  );
}

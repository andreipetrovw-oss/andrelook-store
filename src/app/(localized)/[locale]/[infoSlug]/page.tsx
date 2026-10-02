import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getInfoPage } from "@/i18n/info-content";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ infoSlug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { infoSlug, locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getInfoPage(locale, infoSlug);
  if (!page) return {};
  return {
    alternates: localizedAlternates(locale, infoSlug),
    description: page.introduction,
    openGraph: { description: page.introduction, title: page.title },
    robots: indexingRobots(),
    title: page.title,
    twitter: {
      card: "summary",
      description: page.introduction,
      title: page.title,
    },
  };
}

export default async function InformationPage({ params }: Props) {
  const { infoSlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getInfoPage(locale, infoSlug);
  if (!page) notFound();
  const dictionary = getDictionary(locale);
  return (
    <article className="information-page">
      <header className="information-hero">
        <div className="container narrow-container">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.introduction}</p>
        </div>
      </header>
      <div className="container narrow-container information-body">
        {page.requiresApproval ? (
          <aside className="approval-notice" role="note">
            {dictionary.approvalNotice}
          </aside>
        ) : null}
        <div className="information-sections">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        {infoSlug === "contact" ? (
          <div className="contact-actions">
            <a
              href="https://t.me/andrelookstore"
              rel="noreferrer"
              target="_blank"
            >
              Telegram
            </a>
            <a
              href="https://www.instagram.com/andrelook.store/"
              rel="noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <a href="mailto:info.andrelook@gmail.com">Email</a>
          </div>
        ) : null}
        <Link className="text-action" href={`/${locale}/catalog`}>
          {dictionary.viewCatalog} →
        </Link>
      </div>
    </article>
  );
}

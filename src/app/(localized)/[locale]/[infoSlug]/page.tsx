import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getInfoPage, infoPageSlugs } from "@/i18n/info-content";
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
  const navigation = infoPageSlugs.flatMap((slug) => {
    const item = getInfoPage(locale, slug);
    return item ? [{ slug, title: item.title }] : [];
  });
  return (
    <article className="information-page">
      <header className="information-hero">
        <div className="container narrow-container">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.introduction}</p>
        </div>
      </header>
      <div className="container information-body phase6e-information-body">
        <aside className="information-navigation">
          <span className="eyebrow">{dictionary.footerCustomerCare}</span>
          <nav aria-label={dictionary.footerCustomerCare}>
            {navigation.map((item) => (
              <Link
                aria-current={item.slug === infoSlug ? "page" : undefined}
                href={`/${locale}/${item.slug}`}
                key={item.slug}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="information-content-column">
          <div className="information-sections">
            {page.sections.map((section, index) => (
              <section key={section.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </div>
              </section>
            ))}
          </div>
          {infoSlug === "contact" ? (
            <div className="contact-actions information-contact-actions">
              <a
                href="https://t.me/andrelookstore"
                rel="noreferrer"
                target="_blank"
              >
                Telegram <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://www.instagram.com/andrelook.store/"
                rel="noreferrer"
                target="_blank"
              >
                Instagram <span aria-hidden="true">↗</span>
              </a>
              <a href="mailto:info.andrelook@gmail.com">
                Email <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : null}
          <div className="information-next-step">
            <span className="eyebrow">Andrelook</span>
            <h2>{dictionary.needHelp}</h2>
            <div>
              {infoSlug !== "contact" ? (
                <Link
                  className="primary-action-inline"
                  href={`/${locale}/contact`}
                >
                  {dictionary.contact}
                </Link>
              ) : null}
              <Link className="text-action" href={`/${locale}/catalog`}>
                {dictionary.viewCatalog} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

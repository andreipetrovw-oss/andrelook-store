import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getStorefrontContent } from "@/i18n/storefront-content";
import { formatProductCount } from "@/lib/catalog/presentation";
import {
  getPublicCatalog,
  getPublicCategories,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { getServerConfig, isDatabaseConfigured } from "@/lib/env";
import {
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
  websiteStructuredData,
} from "@/lib/seo";

export const revalidate = 300;

const homeMetadata = {
  en: {
    description:
      "Discover a curated edit of Moncler and Parajumpers jackets, gilets and knitwear, with personal sizing support and European delivery from Tallinn.",
    title: "Andrelook Tallinn — Moncler & Parajumpers pre-order",
  },
  et: {
    description:
      "Avasta Moncleri ja Parajumpersi valitud joped, vestid ning kudumid. Suuruse valiku abi, eeltellimus ja tarne Tallinnast üle Euroopa.",
    title: "Andrelook Tallinn — Moncler ja Parajumpers eeltellimisel",
  },
  ru: {
    description:
      "Отобранные куртки, жилеты и трикотаж Moncler и Parajumpers. Помощь с размером, предзаказ и доставка из Таллинна по Европе.",
    title: "Andrelook Таллинн — Moncler и Parajumpers по предзаказу",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const metadata = homeMetadata[locale];
  return {
    alternates: localizedAlternates(locale, ""),
    description: metadata.description,
    openGraph: {
      description: metadata.description,
      images: [
        {
          alt: "Andrelook",
          height: 1080,
          url: "/brand/hero-bg.jpg",
          width: 1920,
        },
      ],
      ...localizedOpenGraph(locale),
      title: metadata.title,
      type: "website",
    },
    robots: indexingRobots(),
    title: { absolute: metadata.title },
    twitter: {
      card: "summary_large_image",
      description: metadata.description,
      images: ["/brand/hero-bg.jpg"],
      title: metadata.title,
    },
  };
}

function CollectionLoading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="container collection-preview"
    >
      <div aria-hidden="true" className="loading-line" />
      <div aria-hidden="true" className="loading-grid">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

async function HomeProducts({
  dictionary,
  locale,
  scope,
}: {
  dictionary: ReturnType<typeof getDictionary>;
  locale: Parameters<typeof getPublicCatalog>[0];
  scope: ReturnType<typeof storefrontScope>;
}) {
  const copy = getStorefrontContent(locale).home;
  const products = isDatabaseConfigured()
    ? await getPublicCatalog(locale, scope)
    : [];

  return (
    <section className="collection-preview home-product-section">
      <div className="container">
        <header className="editorial-heading split-heading">
          <div>
            <span className="eyebrow">{copy.editorialLabel}</span>
            <h2>{copy.collectionTitle}</h2>
          </div>
          <p>{copy.collectionIntro}</p>
        </header>
        {products.length ? (
          <div className="catalog-grid compact-grid home-product-grid">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                dictionary={dictionary}
                key={product.id}
                locale={locale}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{dictionary.catalogEmpty}</p>
          </div>
        )}
        <div className="section-action section-action-left">
          <Link className="secondary-button" href={`/${locale}/catalog`}>
            {dictionary.viewCatalog}
          </Link>
        </div>
      </div>
    </section>
  );
}

async function HomeCategories({
  dictionary,
  locale,
  scope,
}: {
  dictionary: ReturnType<typeof getDictionary>;
  locale: Parameters<typeof getPublicCategories>[0];
  scope: ReturnType<typeof storefrontScope>;
}) {
  const copy = getStorefrontContent(locale).home;
  const categories = isDatabaseConfigured()
    ? await getPublicCategories(locale, scope)
    : [];
  const categoryLinks = categories.flatMap((category) => category.children);
  return (
    <section className="container home-category-section">
      <header className="editorial-heading split-heading">
        <div>
          <span className="eyebrow">{dictionary.exploreCollection}</span>
          <h2>{copy.categoriesTitle}</h2>
        </div>
        <p>{copy.categoriesIntro}</p>
      </header>
      {categoryLinks.length ? (
        <nav
          aria-label={dictionary.catalog}
          className="category-editorial-grid"
        >
          {categoryLinks.slice(0, 8).map((category, index) => (
            <Link
              href={`/${locale}/catalog/${category.slug}`}
              key={category.slug}
            >
              <span className="category-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{category.name}</strong>
              <small>{formatProductCount(locale, category.productCount)}</small>
              <span aria-hidden="true" className="category-arrow">
                ↗
              </span>
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  );
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const content = getStorefrontContent(locale);
  const scope = storefrontScope();
  const website = websiteStructuredData(getServerConfig().siteUrl);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />
      <section className="hero home-hero">
        <Image
          alt=""
          className="hero-image"
          fetchPriority="high"
          fill
          preload
          sizes="100vw"
          src="/brand/hero-bg.jpg"
        />
        <div aria-hidden="true" className="hero-overlay" />
        <div className="container home-hero-inner">
          <p className="hero-meta">{content.home.heroMeta}</p>
          <div className="hero-brand-block">
            <span className="eyebrow">{content.home.eyebrow}</span>
            <h1>{content.home.heroTitle}</h1>
            <p className="hero-tagline">{dictionary.tagline}</p>
          </div>
          <div className="hero-conversion">
            <p>{content.home.heroBody}</p>
            <div className="hero-actions">
              <Link className="primary-button" href={`/${locale}/catalog`}>
                {dictionary.viewCatalog}
              </Link>
              <Link className="hero-text-link" href={`/${locale}/how-to-order`}>
                {dictionary.howToOrder} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <span className="hero-location">{content.home.locationLabel}</span>
        </div>
      </section>

      <Suspense fallback={<CollectionLoading />}>
        <HomeProducts dictionary={dictionary} locale={locale} scope={scope} />
      </Suspense>

      <section
        aria-label={dictionary.whyAndrelook}
        className="home-trust-strip"
      >
        <div className="container home-trust-strip-inner">
          {content.home.serviceItems.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeCategories dictionary={dictionary} locale={locale} scope={scope} />
      </Suspense>

      <section className="commercial-states-section">
        <div className="container commercial-states-grid">
          <header className="editorial-heading">
            <span className="eyebrow">{dictionary.howItWorks}</span>
            <h2>{content.home.stateTitle}</h2>
            <p>{content.home.stateIntro}</p>
          </header>
          <ol className="ordering-steps preorder-steps">
            {content.home.orderSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            className="primary-action-inline"
            href={`/${locale}/how-to-order`}
          >
            {dictionary.howToOrder}
          </Link>
        </div>
      </section>

      <section className="container sizing-story">
        <div className="sizing-story-mark" aria-hidden="true">
          <span>A</span>
          <i />
          <small>{content.home.sizeMark}</small>
        </div>
        <div className="sizing-story-copy">
          <span className="eyebrow">{dictionary.personalSizing}</span>
          <h2>{content.home.assistanceTitle}</h2>
          <p>{content.home.assistanceBody}</p>
          <ul>
            {content.home.sizingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link className="text-action" href={`/${locale}/faq`}>
            {dictionary.faq} →
          </Link>
        </div>
      </section>

      <section className="faq-preview-section">
        <div className="container faq-preview-grid">
          <header className="editorial-heading">
            <span className="eyebrow">{dictionary.faq}</span>
            <h2>{content.home.faqTitle}</h2>
            <p>{content.home.faqIntro}</p>
            <Link className="text-action" href={`/${locale}/faq`}>
              {dictionary.faq} →
            </Link>
          </header>
          <div className="faq-preview-list">
            {content.home.faq.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-band home-contact-band">
        <div className="container contact-band-inner">
          <div>
            <span className="eyebrow">{dictionary.personalService}</span>
            <h2>{content.home.contactTitle}</h2>
            <p>{content.home.contactBody}</p>
          </div>
          <div className="contact-band-actions">
            <Link className="primary-action-inline" href={`/${locale}/contact`}>
              {dictionary.contact}
            </Link>
            <a
              className="text-action"
              href="https://t.me/andrelookstore"
              rel="noreferrer"
              target="_blank"
            >
              Telegram ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

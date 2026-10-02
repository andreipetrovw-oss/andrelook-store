import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCatalog,
  getPublicCategories,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

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

async function HomeCollection({
  dictionary,
  locale,
  scope,
}: {
  dictionary: ReturnType<typeof getDictionary>;
  locale: Parameters<typeof getPublicCatalog>[0];
  scope: ReturnType<typeof storefrontScope>;
}) {
  const [products, categories] = isDatabaseConfigured()
    ? await Promise.all([
        getPublicCatalog(locale, scope),
        getPublicCategories(locale, scope),
      ])
    : [[], []];

  return (
    <section className="container collection-preview">
      <header className="section-heading">
        <span className="eyebrow">{dictionary.exploreCollection}</span>
        <h2>{dictionary.selectedProducts}</h2>
        <p>{dictionary.catalogIntro}</p>
      </header>
      {categories.length ? (
        <nav aria-label={dictionary.catalog} className="home-categories">
          {categories.flatMap((category) =>
            category.children.map((child) => (
              <Link href={`/${locale}/catalog/${child.slug}`} key={child.slug}>
                <span>{child.name}</span>
                <small>{child.productCount}</small>
              </Link>
            )),
          )}
        </nav>
      ) : null}
      {products.length ? (
        <div className="catalog-grid compact-grid">
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
      <div className="section-action">
        <Link className="secondary-button" href={`/${locale}/catalog`}>
          {dictionary.viewCatalog}
        </Link>
      </div>
    </section>
  );
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const scope = storefrontScope();
  return (
    <>
      {scope === "local-review" ? (
        <p className="review-banner">{dictionary.reviewBanner}</p>
      ) : null}
      <section className="hero">
        <Image
          alt=""
          className="hero-image"
          fill
          priority
          sizes="100vw"
          src="/brand/hero-bg.jpg"
        />
        <div aria-hidden="true" className="hero-overlay" />
        <div className="container hero-content">
          <span className="eyebrow">{dictionary.storefrontKicker}</span>
          <h1>ANDRELOOK</h1>
          <p className="hero-tagline">{dictionary.tagline}</p>
          <Link className="primary-button" href={`/${locale}/catalog`}>
            {dictionary.viewCatalog}
          </Link>
        </div>
      </section>
      <Suspense fallback={<CollectionLoading />}>
        <HomeCollection dictionary={dictionary} locale={locale} scope={scope} />
      </Suspense>
      <section className="service-section">
        <div className="container service-grid">
          <header>
            <span className="eyebrow">{dictionary.personalService}</span>
            <h2>{dictionary.howItWorks}</h2>
          </header>
          {[
            dictionary.howStepOne,
            dictionary.howStepTwo,
            dictionary.howStepThree,
          ].map((step, index) => (
            <article key={step}>
              <span>0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container trust-section">
        <header className="section-heading">
          <span className="eyebrow">Andrelook</span>
          <h2>{dictionary.whyAndrelook}</h2>
        </header>
        <div className="trust-grid">
          {[
            dictionary.trustClarity,
            dictionary.trustSupport,
            dictionary.trustLanguages,
          ].map((item, index) => (
            <article key={item}>
              <span>0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-band">
        <div className="container contact-band-inner">
          <div>
            <span className="eyebrow">{dictionary.personalSizing}</span>
            <h2>{dictionary.needHelp}</h2>
          </div>
          <div className="contact-band-actions">
            <Link className="primary-action-inline" href={`/${locale}/contact`}>
              {dictionary.contact}
            </Link>
            <Link className="text-action" href={`/${locale}/faq`}>
              {dictionary.faq} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

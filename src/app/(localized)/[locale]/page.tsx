import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicCatalog } from "@/lib/catalog/public-query";
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
  const products = isDatabaseConfigured()
    ? (await getPublicCatalog(locale, scope)).slice(0, 3)
    : [];

  return (
    <section className="container collection-preview">
      <header className="section-heading">
        <span className="eyebrow">{dictionary.exploreCollection}</span>
        <h2>{dictionary.catalog}</h2>
        <p>{dictionary.catalogIntro}</p>
      </header>
      {products.length ? (
        <div className="catalog-grid compact-grid">
          {products.map((product) => (
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
    </>
  );
}

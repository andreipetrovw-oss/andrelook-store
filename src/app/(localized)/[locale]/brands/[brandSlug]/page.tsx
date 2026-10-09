import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogExperience } from "@/components/catalog-experience";
import { isLocale, locales } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getBrandContent,
  isPublicBrandSlug,
  publicBrandSlugs,
} from "@/i18n/brand-content";
import { getPublicBrandProducts } from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { getServerConfig, isDatabaseConfigured } from "@/lib/env";
import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ brandSlug: string; locale: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    publicBrandSlugs.map((brandSlug) => ({ brandSlug, locale })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, locale } = await params;
  if (!isLocale(locale) || !isPublicBrandSlug(brandSlug)) return {};
  const content = getBrandContent(locale, brandSlug);
  const path = `brands/${brandSlug}`;
  return {
    alternates: localizedAlternates(locale, path),
    description: content.description,
    openGraph: {
      description: content.description,
      ...localizedOpenGraph(locale),
      title: brandedTitle(content.title),
    },
    robots: indexingRobots(),
    title: content.title,
    twitter: {
      card: "summary_large_image",
      description: content.description,
      title: brandedTitle(content.title),
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brandSlug, locale } = await params;
  if (!isLocale(locale) || !isPublicBrandSlug(brandSlug)) notFound();
  const dictionary = getDictionary(locale);
  const content = getBrandContent(locale, brandSlug);
  const products = isDatabaseConfigured()
    ? await getPublicBrandProducts(locale, brandSlug, storefrontScope())
    : [];
  if (isDatabaseConfigured() && products.length === 0) notFound();
  const brandName = brandSlug === "moncler" ? "Moncler" : "Parajumpers";
  const pageUrl = new URL(
    `/${locale}/brands/${brandSlug}`,
    getServerConfig().siteUrl,
  ).toString();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: new URL(
                  `/${locale}/catalog`,
                  getServerConfig().siteUrl,
                ).toString(),
                name: dictionary.catalog,
                position: 1,
              },
              {
                "@type": "ListItem",
                item: pageUrl,
                name: brandName,
                position: 2,
              },
            ],
          }).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />
      <header className="catalog-hero compact">
        <div className="container">
          <nav aria-label={dictionary.breadcrumb} className="breadcrumb">
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
            <span aria-hidden="true">/</span>
            <span>{brandName}</span>
          </nav>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
      </header>

      <section className="container product-service-grid">
        {content.sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            <Link
              href={
                index === 0
                  ? `/${locale}/catalog`
                  : index === 1
                    ? `/${locale}/pre-order`
                    : `/${locale}/contact`
              }
            >
              {index === 0
                ? dictionary.viewCatalog
                : index === 1
                  ? dictionary.preorder
                  : dictionary.contact}{" "}
              →
            </Link>
          </article>
        ))}
      </section>

      <Suspense
        fallback={<div aria-busy="true" className="container loading-line" />}
      >
        <CatalogExperience
          basePath={`/${locale}/brands/${brandSlug}`}
          dictionary={dictionary}
          locale={locale}
          products={products}
        />
      </Suspense>
    </>
  );
}

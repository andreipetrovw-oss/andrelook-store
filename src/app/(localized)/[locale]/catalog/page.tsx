import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogExperience } from "@/components/catalog-experience";
import { CategoryNavigation } from "@/components/category-navigation";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCatalog,
  getPublicCategories,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { isDatabaseConfigured } from "@/lib/env";
import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const dictionary = getDictionary(locale);
  return {
    alternates: localizedAlternates(locale, "catalog"),
    description: dictionary.catalogIntro,
    openGraph: {
      description: dictionary.catalogIntro,
      ...localizedOpenGraph(locale),
      title: brandedTitle(dictionary.catalog),
    },
    robots: indexingRobots(),
    title: dictionary.catalog,
    twitter: {
      card: "summary_large_image",
      description: dictionary.catalogIntro,
      title: brandedTitle(dictionary.catalog),
    },
  };
}

export default async function CatalogPage({
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
  const [products, categories] = isDatabaseConfigured()
    ? await Promise.all([
        getPublicCatalog(locale, scope),
        getPublicCategories(locale, scope),
      ])
    : [[], []];

  return (
    <>
      <header className="catalog-hero">
        <div className="container">
          <span className="eyebrow">Andrelook</span>
          <h1>{dictionary.catalog}</h1>
          <p>{dictionary.catalogIntro}</p>
        </div>
      </header>
      <div className="container">
        <CategoryNavigation
          categories={categories}
          dictionary={dictionary}
          locale={locale}
        />
      </div>
      <Suspense
        fallback={<div aria-busy="true" className="container loading-line" />}
      >
        <CatalogExperience
          basePath={`/${locale}/catalog`}
          dictionary={dictionary}
          locale={locale}
          products={products}
        />
      </Suspense>
    </>
  );
}

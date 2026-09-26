import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCatalog,
  getPublicCategories,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { isDatabaseConfigured } from "@/lib/env";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  return {
    alternates: localizedAlternates(locale, "catalog"),
    robots: indexingRobots(),
    title: getDictionary(locale).catalog,
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
      <section
        aria-label={dictionary.catalog}
        className="container catalog-grid"
      >
        {products.length ? (
          products.map((product) => (
            <ProductCard
              dictionary={dictionary}
              key={product.id}
              locale={locale}
              product={product}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>{dictionary.catalogEmpty}</p>
          </div>
        )}
      </section>
    </>
  );
}
import { CategoryNavigation } from "@/components/category-navigation";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicCategoryProducts } from "@/lib/catalog/public-query";
import { isDatabaseConfigured } from "@/lib/env";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ categorySlug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  return {
    alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
    robots: indexingRobots(),
    title: getDictionary(locale).catalog,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale) || !isDatabaseConfigured()) {
    notFound();
  }

  const products = await getPublicCategoryProducts(locale, categorySlug);
  if (products.length === 0) {
    notFound();
  }

  return (
    <>
      <header className="catalog-hero">
        <div className="container">
          <span className="eyebrow">{getDictionary(locale).catalog}</span>
          <h1>{products[0]?.category.name}</h1>
        </div>
      </header>
      <section className="container catalog-grid">
        {products.map((product) => (
          <ProductCard key={product.id} locale={locale} product={product} />
        ))}
      </section>
    </>
  );
}

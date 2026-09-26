import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryNavigation } from "@/components/category-navigation";
import { ProductCard } from "@/components/product-card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCategories,
  getPublicCategoryProducts,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { isDatabaseConfigured } from "@/lib/env";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ categorySlug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  if (isDatabaseConfigured()) {
    const categories = await getPublicCategories(locale, storefrontScope());
    const category = categories
      .flatMap((parent) => parent.children)
      .find((item) => item.slug === categorySlug);
    if (!category) notFound();
    return {
      alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
      robots: indexingRobots(),
      title: category.name,
    };
  }
  return {
    alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
    robots: indexingRobots(),
    title: categorySlug.replaceAll("-", " "),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const scope = storefrontScope();
  const [products, categories] = isDatabaseConfigured()
    ? await Promise.all([
        getPublicCategoryProducts(locale, categorySlug, scope),
        getPublicCategories(locale, scope),
      ])
    : [[], []];
  const category = categories
    .flatMap((parent) => parent.children)
    .find((item) => item.slug === categorySlug);
  if (!category && isDatabaseConfigured()) notFound();

  return (
    <>
      <header className="catalog-hero compact">
        <div className="container">
          <span className="eyebrow">{dictionary.catalog}</span>
          <h1>{category?.name ?? categorySlug}</h1>
        </div>
      </header>
      <div className="container">
        <CategoryNavigation
          activeSlug={categorySlug}
          categories={categories}
          dictionary={dictionary}
          locale={locale}
        />
      </div>
      <section aria-label={category?.name} className="container catalog-grid">
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
            <p>{dictionary.noProductsInCategory}</p>
          </div>
        )}
      </section>
    </>
  );
}

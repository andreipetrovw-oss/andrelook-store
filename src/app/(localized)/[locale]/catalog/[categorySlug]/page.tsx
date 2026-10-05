import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryNavigation } from "@/components/category-navigation";
import {
  CatalogExperience,
  type CatalogParams,
} from "@/components/catalog-experience";
import Link from "next/link";
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
  searchParams: Promise<CatalogParams>;
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
      description: getDictionary(locale).categoryContext,
      openGraph: {
        description: getDictionary(locale).categoryContext,
        title: category.name,
      },
      robots: indexingRobots(),
      title: category.name,
      twitter: {
        card: "summary_large_image",
        description: getDictionary(locale).categoryContext,
        title: category.name,
      },
    };
  }
  return {
    alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
    robots: indexingRobots(),
    title: categorySlug.replaceAll("-", " "),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const filters = await searchParams;
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
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
            <span aria-hidden="true">/</span>
            <span>{category?.name ?? categorySlug}</span>
          </nav>
          <span className="eyebrow">{dictionary.catalog}</span>
          <h1>{category?.name ?? categorySlug}</h1>
          <p>{dictionary.categoryContext}</p>
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
      <CatalogExperience
        basePath={`/${locale}/catalog/${categorySlug}`}
        dictionary={dictionary}
        locale={locale}
        params={filters}
        products={products}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import { getStorefrontContent } from "@/i18n/storefront-content";
import type { PublicProductDto } from "@/lib/catalog/public-dto";
import { formatProductCount } from "@/lib/catalog/presentation";

import { ProductCard } from "./product-card";

export type CatalogParams = {
  availability?: string;
  q?: string;
  sort?: string;
};

export function filterAndSortProducts(
  products: PublicProductDto[],
  params: CatalogParams,
): PublicProductDto[] {
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const filtered = products.filter((product) => {
    const searchText = [
      product.name,
      product.category.name,
      product.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return !query || searchText.includes(query);
  });
  if (params.sort === "name") {
    return filtered.toSorted((left, right) =>
      left.name.localeCompare(right.name),
    );
  }
  return filtered;
}

export function CatalogExperience({
  basePath,
  dictionary,
  locale,
  products,
}: {
  basePath: string;
  dictionary: Dictionary;
  locale: Locale;
  products: PublicProductDto[];
}) {
  const searchParams = useSearchParams();
  const params = {
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  } satisfies CatalogParams;
  const content = getStorefrontContent(locale);
  const visibleProducts = filterAndSortProducts(products, params);
  const hasFilters = Boolean(params.q || params.sort);
  return (
    <section aria-label={dictionary.catalog} className="catalog-results">
      <div className="catalog-discovery" id="catalog-controls">
        <div className="container catalog-discovery-inner">
          <div className="catalog-filter-heading">
            <span className="eyebrow">{content.catalog.filterHint}</span>
            <p>{content.catalog.discoveryNote}</p>
          </div>
          <span className="catalog-preorder-note">
            {dictionary.availabilityPreOrder} · 2–3{" "}
            {locale === "ru" ? "недели" : locale === "et" ? "nädalat" : "weeks"}
          </span>
        </div>
      </div>
      <div className="container catalog-toolbar">
        <form action={basePath} className="catalog-controls" method="get">
          <label className="search-control">
            <span>{dictionary.search}</span>
            <span className="search-input-wrap">
              <input
                defaultValue={params.q}
                name="q"
                placeholder={dictionary.catalogSearch}
                type="search"
              />
              <span aria-hidden="true">⌕</span>
            </span>
          </label>
          <label>
            <span>{dictionary.sort}</span>
            <select defaultValue={params.sort ?? ""} name="sort">
              <option value="">{dictionary.sortCurated}</option>
              <option value="name">{dictionary.sortName}</option>
            </select>
          </label>
          <button type="submit">{dictionary.search}</button>
          {hasFilters ? (
            <Link className="clear-action" href={basePath}>
              {dictionary.clearFilters}
            </Link>
          ) : null}
        </form>
        <p aria-live="polite" className="result-count">
          {formatProductCount(locale, visibleProducts.length)}
        </p>
      </div>
      <div className="container catalog-grid">
        {visibleProducts.length ? (
          visibleProducts.map((product) => (
            <ProductCard
              dictionary={dictionary}
              key={product.id}
              locale={locale}
              product={product}
            />
          ))
        ) : (
          <div className="empty-state">
            <span className="eyebrow">Andrelook</span>
            <p>
              {hasFilters
                ? dictionary.noSearchResults
                : dictionary.catalogEmpty}
            </p>
            {hasFilters ? (
              <Link className="secondary-button" href={basePath}>
                {dictionary.clearFilters}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

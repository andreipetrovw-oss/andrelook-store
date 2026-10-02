import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import { getStorefrontContent } from "@/i18n/storefront-content";
import type { PublicProductDto } from "@/lib/catalog/public-dto";

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
  const availability = ["IN_STOCK", "PRE_ORDER", "UNAVAILABLE"].includes(
    params.availability ?? "",
  )
    ? params.availability
    : undefined;
  const filtered = products.filter((product) => {
    const searchText = [
      product.name,
      product.category.name,
      product.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return (
      (!query || searchText.includes(query)) &&
      (!availability || product.availability === availability)
    );
  });
  if (params.sort === "name") {
    return filtered.toSorted((left, right) =>
      left.name.localeCompare(right.name),
    );
  }
  if (params.sort === "price-asc" || params.sort === "price-desc") {
    const direction = params.sort === "price-asc" ? 1 : -1;
    return filtered.toSorted((left, right) => {
      if (left.retailPriceMinor === null) return 1;
      if (right.retailPriceMinor === null) return -1;
      return (left.retailPriceMinor - right.retailPriceMinor) * direction;
    });
  }
  return filtered;
}

export function CatalogExperience({
  basePath,
  dictionary,
  locale,
  params,
  products,
}: {
  basePath: string;
  dictionary: Dictionary;
  locale: Locale;
  params: CatalogParams;
  products: PublicProductDto[];
}) {
  const content = getStorefrontContent(locale);
  const visibleProducts = filterAndSortProducts(products, params);
  const hasFilters = Boolean(params.q || params.availability || params.sort);
  const availabilityOptions = [
    { label: dictionary.filterAll, value: "" },
    { label: dictionary.availabilityInStock, value: "IN_STOCK" },
    { label: dictionary.availabilityPreOrder, value: "PRE_ORDER" },
    { label: dictionary.availabilityUnavailable, value: "UNAVAILABLE" },
  ];
  const availabilityHref = (value: string) => {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.sort) next.set("sort", params.sort);
    if (value) next.set("availability", value);
    const query = next.toString();
    return query ? `${basePath}?${query}` : basePath;
  };
  return (
    <section aria-label={dictionary.catalog} className="catalog-results">
      <div className="catalog-discovery" id="catalog-controls">
        <div className="container catalog-discovery-inner">
          <div className="catalog-filter-heading">
            <span className="eyebrow">{content.catalog.filterHint}</span>
            <p>{content.catalog.discoveryNote}</p>
          </div>
          <nav
            aria-label={dictionary.filterAvailability}
            className="availability-filters"
          >
            {availabilityOptions.map((option) => (
              <Link
                aria-current={
                  (params.availability ?? "") === option.value
                    ? "page"
                    : undefined
                }
                href={availabilityHref(option.value)}
                key={option.value || "all"}
              >
                {option.label}
              </Link>
            ))}
          </nav>
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
              <option value="price-asc">{dictionary.sortPriceAscending}</option>
              <option value="price-desc">
                {dictionary.sortPriceDescending}
              </option>
            </select>
          </label>
          {params.availability ? (
            <input
              name="availability"
              type="hidden"
              value={params.availability}
            />
          ) : null}
          <button type="submit">{dictionary.search}</button>
          {hasFilters ? (
            <Link className="clear-action" href={basePath}>
              {dictionary.clearFilters}
            </Link>
          ) : null}
        </form>
        <p aria-live="polite" className="result-count">
          <span>{visibleProducts.length}</span> {content.catalog.resultsLabel}
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

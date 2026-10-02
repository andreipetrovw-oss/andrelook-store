import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
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
  const visibleProducts = filterAndSortProducts(products, params);
  const hasFilters = Boolean(params.q || params.availability || params.sort);
  return (
    <section aria-label={dictionary.catalog} className="catalog-results">
      <div className="container catalog-toolbar" id="catalog-controls">
        <form action={basePath} className="catalog-controls" method="get">
          <label className="search-control">
            <span>{dictionary.search}</span>
            <input
              defaultValue={params.q}
              name="q"
              placeholder={dictionary.catalogSearch}
              type="search"
            />
          </label>
          <label>
            <span>{dictionary.filterAvailability}</span>
            <select
              defaultValue={params.availability ?? ""}
              name="availability"
            >
              <option value="">{dictionary.filterAll}</option>
              <option value="IN_STOCK">{dictionary.availabilityInStock}</option>
              <option value="PRE_ORDER">
                {dictionary.availabilityPreOrder}
              </option>
              <option value="UNAVAILABLE">
                {dictionary.availabilityUnavailable}
              </option>
            </select>
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
          <button type="submit">{dictionary.search}</button>
          {hasFilters ? (
            <Link className="clear-action" href={basePath}>
              {dictionary.clearFilters}
            </Link>
          ) : null}
        </form>
        <p aria-live="polite" className="result-count">
          {visibleProducts.length} {dictionary.catalogResults}
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

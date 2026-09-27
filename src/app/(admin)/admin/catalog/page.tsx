import Image from "next/image";
import Link from "next/link";

import {
  availabilityLabel,
  formatMoney,
  publicationLabel,
} from "@/lib/admin/presentation";
import { getAdminCatalog } from "@/lib/admin/query";

const filters = [
  ["", "Все"],
  ["incomplete", "Требуют заполнения"],
  ["review", "На проверке"],
  ["ready", "Готовы"],
  ["published", "Опубликованы"],
] as const;

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const params = await searchParams;
  const products = await getAdminCatalog(params);

  return (
    <>
      <header className="admin-page-header catalog-heading">
        <div>
          <span className="eyebrow">Рабочее пространство</span>
          <h1>Каталог</h1>
          <p>
            Заполните данные, проверьте изображения и подготовьте товар к
            публикации.
          </p>
        </div>
        <span className="catalog-count">{products.length} товаров</span>
      </header>

      <form className="catalog-search">
        <label>
          <span className="sr-only">Поиск по каталогу</span>
          <input
            defaultValue={params.q}
            name="q"
            placeholder="Найти товар по названию или коду"
          />
        </label>
        {params.state ? (
          <input name="state" type="hidden" value={params.state} />
        ) : null}
        <button type="submit">Найти</button>
      </form>

      <nav aria-label="Фильтр каталога" className="catalog-filter-tabs">
        {filters.map(([value, label]) => {
          const active = (params.state ?? "") === value;
          const query = new URLSearchParams();
          if (value) query.set("state", value);
          if (params.q) query.set("q", params.q);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : undefined}
              href={`/admin/catalog${query.size ? `?${query}` : ""}`}
              key={value || "all"}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="owner-catalog-grid">
        {products.map((product) => {
          const ruName = product.translations.find(
            (item) => item.locale === "RU",
          )?.name;
          const fallbackName =
            ruName ??
            product.translations.find((item) => item.locale === "EN")?.name ??
            product.translations.find((item) => item.locale === "ET")?.name;
          const identityConfirmed = product.identityReady;
          const category =
            product.category?.translations.find((item) => item.locale === "RU")
              ?.name ??
            product.category?.slug ??
            "Категория не указана";
          const imageUrl = product.images[0]?.url;

          return (
            <article className="owner-product-card" key={product.id}>
              <Link
                aria-label={`Открыть товар ${identityConfirmed ? fallbackName : product.internalCode}`}
                className="owner-product-image"
                href={`/admin/catalog/${product.id}`}
              >
                {imageUrl ? (
                  <Image
                    alt={fallbackName ?? "Товар Andrelook"}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
                    src={imageUrl}
                  />
                ) : (
                  <span
                    className="product-image-placeholder"
                    aria-hidden="true"
                  >
                    A
                  </span>
                )}
              </Link>
              <div className="owner-product-body">
                <div className="owner-product-state-row">
                  <span
                    className={`status-pill publication-${product.publicationStatus.toLowerCase()}`}
                  >
                    {publicationLabel[product.publicationStatus]}
                  </span>
                  <span>{product.completedGates} из 6</span>
                </div>
                <h2>
                  {identityConfirmed && fallbackName
                    ? fallbackName
                    : "Название требует подтверждения"}
                </h2>
                {!identityConfirmed && fallbackName ? (
                  <p className="source-name">
                    Исходное название: {fallbackName}
                  </p>
                ) : null}
                <p>{category}</p>
                <dl>
                  <div>
                    <dt>Цена</dt>
                    <dd>
                      {formatMoney(product.retailPriceMinor, product.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt>Наличие</dt>
                    <dd>
                      {product.availabilityType
                        ? availabilityLabel[product.availabilityType]
                        : "Не указано"}
                    </dd>
                  </div>
                </dl>
                <div
                  className="readiness-meter"
                  aria-label={`Готовность ${product.completedGates} из 6`}
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <span
                      className={
                        index < product.completedGates ? "complete" : undefined
                      }
                      key={index}
                    />
                  ))}
                </div>
                <div className="owner-product-footer">
                  <small>{product.internalCode}</small>
                  <Link href={`/admin/catalog/${product.id}`}>Открыть →</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!products.length ? (
        <div className="admin-empty">
          <strong>Товары не найдены</strong>
          <p>Измените поиск или выберите другой фильтр.</p>
        </div>
      ) : null}
    </>
  );
}

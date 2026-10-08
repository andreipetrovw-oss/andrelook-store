import Link from "next/link";

import {
  getAdminCatalogOverview,
  getAdminCatalogView,
  type AdminCatalogView,
} from "@/lib/admin/catalog-segmentation";
import {
  availabilityTypeLabels,
  publicationStatusLabels,
  sourceReviewStatusLabels,
} from "@/lib/admin/labels";
import { getAdminCatalog } from "@/lib/admin/query";
import { getServerConfig } from "@/lib/env";

const catalogViews: Array<{
  href: string;
  key: AdminCatalogView;
  label: string;
}> = [
  { href: "/admin/catalog", key: "published", label: "Опубликованные" },
  {
    href: "/admin/catalog?view=drafts",
    key: "drafts",
    label: "Черновики",
  },
  {
    href: "/admin/catalog?view=research",
    key: "research",
    label: "Исследовательская база",
  },
];

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [products, filters] = await Promise.all([
    getAdminCatalog(),
    searchParams,
  ]);
  const view = getAdminCatalogView(filters.view);
  const overview = getAdminCatalogOverview(products, {
    includeReady: getServerConfig().storefrontReviewMode,
  });
  const visibleProducts = overview[view];
  const publicTotal = overview.published.length;

  return (
    <>
      <span className="eyebrow">Закрытый каталог</span>
      <h1>Каталог</h1>
      <section aria-labelledby="catalog-readiness-title">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">Готовность к работе</span>
            <h2 id="catalog-readiness-title">Публичный каталог</h2>
          </div>
          <strong className="admin-readiness-total">
            {overview.ready}/{publicTotal} готовы
          </strong>
        </div>
        <div className="admin-cards admin-cards-catalog">
          <article className="admin-card admin-card-primary">
            <span>Публичный каталог</span>
            <p>
              {overview.ready}/{publicTotal}
            </p>
            <small>готовы к продаже</small>
          </article>
          <article className="admin-card">
            <span>Карточки и контент</span>
            <p>
              {overview.metrics.content}/{publicTotal}
            </p>
          </article>
          <article className="admin-card">
            <span>Розничные цены</span>
            <p>
              {overview.metrics.prices}/{publicTotal}
            </p>
          </article>
          <article className="admin-card">
            <span>Таблицы размеров</span>
            <p>
              {overview.metrics.charts}/{publicTotal}
            </p>
          </article>
          <article className="admin-card">
            <span>Публичные изображения</span>
            <p>
              {overview.metrics.images}/{publicTotal}
            </p>
          </article>
          <article className="admin-card">
            <span>Наличие</span>
            <p>
              {overview.metrics.availability}/{publicTotal}
            </p>
          </article>
        </div>
      </section>

      <div className="admin-catalog-groups">
        <article className="admin-card">
          <strong>Исследовательская база</strong>
          <p>{overview.research.length}</p>
          <small>записей</small>
        </article>
        <article className="admin-card">
          <strong>Приватные / архивные</strong>
          <p>{overview.drafts.length}</p>
          <small>запись (Tibb сохранён)</small>
        </article>
      </div>

      <nav aria-label="Разделы каталога" className="admin-tabs">
        {catalogViews.map((item) => (
          <Link
            aria-current={view === item.key ? "page" : undefined}
            href={item.href}
            key={item.key}
          >
            {item.label}
            <span>
              {item.key === "published"
                ? overview.published.length
                : item.key === "drafts"
                  ? overview.drafts.length
                  : overview.research.length}
            </span>
          </Link>
        ))}
      </nav>

      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <caption className="sr-only">
            {catalogViews.find((item) => item.key === view)?.label}
          </caption>
          <thead>
            <tr>
              <th>Товар</th>
              <th>Публикация</th>
              <th>Контент</th>
              <th>Публичное изображение</th>
              <th>Таблица размеров</th>
              <th>Наличие</th>
              <th>Цена</th>
              <th>Закрытый источник</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>
                    <Link href={`/admin/catalog/${product.id}`}>
                      {product.translations.find((item) => item.locale === "EN")
                        ?.name ?? product.internalCode}
                    </Link>
                  </strong>
                  <small>{product.internalCode}</small>
                </td>
                <td>{publicationStatusLabels[product.publicationStatus]}</td>
                <td>{product.contentComplete ? "Готов" : "Не готов"}</td>
                <td>{product.imageReady ? "Готово" : "Не готово"}</td>
                <td>
                  {product.sizeReady
                    ? "Опубликована"
                    : product.sizeChart
                      ? sourceReviewStatusLabels[product.sizeChart.reviewStatus]
                      : "Отсутствует"}
                </td>
                <td>
                  {product.availabilityType
                    ? availabilityTypeLabels[product.availabilityType]
                    : "Не подтверждено"}
                </td>
                <td>
                  {product.retailPriceMinor !== null && product.currency
                    ? `${(product.retailPriceMinor / 100).toFixed(2)} ${product.currency}`
                    : "Не подтверждена"}
                </td>
                <td>
                  <span>{product.privateData?.supplierName ?? "—"}</span>
                  {product.privateData?.supplierAlbumUrl ? (
                    <a
                      href={product.privateData.supplierAlbumUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Открыть источник
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visibleProducts.length ? (
        <p className="admin-empty">В этом разделе пока нет записей.</p>
      ) : null}
    </>
  );
}

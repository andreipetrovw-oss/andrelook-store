import { getAdminCatalog } from "@/lib/admin/query";
import {
  availabilityTypeLabels,
  publicationStatusLabels,
  sourceReviewStatusLabels,
} from "@/lib/admin/labels";
import Link from "next/link";

export default async function AdminCatalogPage() {
  const products = await getAdminCatalog();
  const summary = {
    availability: products.filter((product) => product.availabilityType).length,
    charts: products.filter(
      (product) => product.sizeChart?.reviewStatus === "APPROVED",
    ).length,
    content: products.filter(
      (product) => product.contentComplete && product.slug,
    ).length,
    images: products.filter((product) => product.imageReady).length,
    prices: products.filter(
      (product) => product.retailPriceMinor !== null && product.currency,
    ).length,
  };
  return (
    <>
      <span className="eyebrow">Закрытый каталог</span>
      <h1>Готовность каталога</h1>
      <div className="admin-cards admin-cards-catalog">
        <article className="admin-card">
          <span>Заполненные карточки</span>
          <p>
            {summary.content}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Проверенные таблицы размеров</span>
          <p>
            {summary.charts}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Розничные цены</span>
          <p>
            {summary.prices}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Статусы наличия</span>
          <p>
            {summary.availability}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Одобренные изображения</span>
          <p>
            {summary.images}/{products.length}
          </p>
        </article>
      </div>
      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
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
            {products.map((product) => (
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
    </>
  );
}

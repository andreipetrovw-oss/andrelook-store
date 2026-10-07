import { notFound } from "next/navigation";

import { getPrivateCatalogProduct } from "@/lib/catalog/private-query";
import { updateProductCommercialState } from "@/app/(admin)/admin/actions";
import {
  availabilityTypeLabels,
  publicationStatusLabels,
  russianDate,
  sourceReviewStatusLabels,
} from "@/lib/admin/labels";

export default async function AdminCatalogProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPrivateCatalogProduct(id);
  if (!product) notFound();
  return (
    <>
      <span className="eyebrow">{product.internalCode}</span>
      <h1>
        {product.translations.find((item) => item.locale === "EN")?.name ??
          "Карточка товара"}
      </h1>
      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Публикация и коммерческие данные</h2>
          <dl>
            <div>
              <dt>Статус</dt>
              <dd>{publicationStatusLabels[product.publicationStatus]}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>{product.slug ?? "Не заполнен"}</dd>
            </div>
            <div>
              <dt>Наличие</dt>
              <dd>
                {product.availabilityType
                  ? availabilityTypeLabels[product.availabilityType]
                  : "Не подтверждено"}
              </dd>
            </div>
            <div>
              <dt>Розничная цена</dt>
              <dd>
                {product.retailPriceMinor === null || !product.currency
                  ? "Не подтверждена"
                  : `${(product.retailPriceMinor / 100).toFixed(2)} ${product.currency}`}
              </dd>
            </div>
          </dl>
          <form
            action={updateProductCommercialState}
            className="admin-stack-form"
          >
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Статус публикации</span>
              <select
                defaultValue={product.publicationStatus}
                name="publicationStatus"
              >
                <option value="DRAFT">Черновик</option>
                <option value="READY">Готов к закрытой проверке</option>
                <option value="PUBLISHED">Опубликован</option>
                <option value="ARCHIVED">Архив</option>
              </select>
            </label>
            <label>
              <span>Наличие</span>
              <select
                defaultValue={product.availabilityType ?? ""}
                name="availabilityType"
              >
                <option value="">Не подтверждено</option>
                <option value="IN_STOCK">В наличии</option>
                <option value="PRE_ORDER">Предзаказ</option>
                <option value="UNAVAILABLE">Недоступен</option>
              </select>
            </label>
            <label>
              <span>Розничная цена</span>
              <input
                defaultValue={
                  product.retailPriceMinor === null
                    ? ""
                    : (product.retailPriceMinor / 100).toFixed(2)
                }
                inputMode="decimal"
                name="retailPrice"
                placeholder="Оставьте пустым до одобрения"
              />
            </label>
            <label>
              <span>Валюта</span>
              <input
                defaultValue={product.currency ?? ""}
                maxLength={3}
                name="currency"
                placeholder="EUR"
              />
            </label>
            <label>
              <span>Срок предзаказа</span>
              <input
                defaultValue={product.preorderEstimateText ?? ""}
                name="preorderEstimateText"
                placeholder="Только после одобрения владельцем"
              />
            </label>
            <button type="submit">Сохранить</button>
          </form>
          <p className="admin-readiness-note">
            Публикация недоступна, пока не заполнены slug, три перевода,
            переводы категории, одобренное главное изображение, наличие, цена и
            валюта.
          </p>
        </section>
        <section className="admin-panel">
          <h2>Закрытый источник</h2>
          <dl>
            <div>
              <dt>Поставщик</dt>
              <dd>{product.privateData?.supplierName ?? "—"}</dd>
            </div>
            <div>
              <dt>Статус проверки</dt>
              <dd>
                {product.privateData
                  ? sourceReviewStatusLabels[
                      product.privateData.sourceReviewStatus
                    ]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Стоимость поставщика</dt>
              <dd>
                {product.privateData?.supplierCostMinor === null ||
                !product.privateData?.supplierCurrency
                  ? "—"
                  : `${(product.privateData.supplierCostMinor / 100).toFixed(2)} ${product.privateData.supplierCurrency}`}
              </dd>
            </div>
          </dl>
          {product.privateData?.supplierAlbumUrl ? (
            <a
              href={product.privateData.supplierAlbumUrl}
              rel="noreferrer"
              target="_blank"
            >
              Открыть закрытый источник
            </a>
          ) : null}
        </section>
        <section className="admin-panel">
          <h2>Готовность витрины</h2>
          <dl>
            <div>
              <dt>Локализованная карточка</dt>
              <dd>{product.translations.length}/3</dd>
            </div>
            <div>
              <dt>Одобренные публичные изображения</dt>
              <dd>
                {
                  product.images.filter(
                    (image) =>
                      image.reviewStatus === "APPROVED" && image.approvedAt,
                  ).length
                }
              </dd>
            </div>
            <div>
              <dt>Одобренные цвета</dt>
              <dd>
                {
                  product.colors.filter(
                    (colour) => colour.reviewStatus === "APPROVED",
                  ).length
                }
              </dd>
            </div>
            <div>
              <dt>Доступные варианты</dt>
              <dd>
                {product.variants.filter((variant) => variant.isEnabled).length}
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Доказательства таблицы размеров</h2>
          <dl>
            <div>
              <dt>Статус проверки</dt>
              <dd>
                {product.sizeChart
                  ? sourceReviewStatusLabels[product.sizeChart.reviewStatus]
                  : "Отсутствует"}
              </dd>
            </div>
            <div>
              <dt>Публичная</dt>
              <dd>{product.sizeChart?.isPublished ? "Да" : "Нет"}</dd>
            </div>
            <div>
              <dt>Проверка</dt>
              <dd>{product.sizeChart?.evidence?.verification ?? "—"}</dd>
            </div>
            <div>
              <dt>Дата проверки</dt>
              <dd>
                {product.sizeChart?.evidence?.verificationDate
                  ? russianDate.format(
                      product.sizeChart.evidence.verificationDate,
                    )
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel admin-panel-wide">
          <h2>
            Закрытые ссылки на исходные изображения (
            {product.sourceImages.length})
          </h2>
          <div className="admin-table-wrap" tabIndex={0}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Позиция</th>
                  <th>Роль</th>
                  <th>Проверка</th>
                  <th>Размеры</th>
                  <th>Ссылка</th>
                </tr>
              </thead>
              <tbody>
                {product.sourceImages.map((image) => (
                  <tr key={image.id}>
                    <td>{image.sourcePosition}</td>
                    <td>{image.assignedSourceRole ?? "—"}</td>
                    <td>{sourceReviewStatusLabels[image.reviewStatus]}</td>
                    <td>
                      {image.width && image.height
                        ? `${image.width}×${image.height}`
                        : "—"}
                    </td>
                    <td>
                      <a
                        href={image.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Открыть источник
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

import {
  AvailabilityType,
  ImageRole,
  ReviewDecision,
  SourceReviewStatus,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrivateSourceImage } from "@/components/private-source-image";
import {
  availabilityLabel,
  formatDateTime,
  imageRoleLabel,
  publicationLabel,
  reviewDecisionLabel,
  sourceReviewLabel,
} from "@/lib/admin/presentation";
import { getProductReadiness } from "@/lib/catalog/owner-control";
import { getPrivateCatalogProduct } from "@/lib/catalog/private-query";

import {
  saveCommercialFields,
  saveLocalizedContent,
  saveOwnerReview,
  saveProductOptions,
  saveSourceImageReview,
  storeApprovedPublicImage,
} from "../actions";

const languageNames = { RU: "Русский", ET: "Eesti", EN: "English" } as const;

const readinessReason: Record<string, string> = {
  category: "категория не подтверждена",
  commercial: "цена или наличие не подтверждены",
  content: "контент на трёх языках не подтверждён",
  identity: "название и адрес товара не подтверждены",
  imagery: "нет одобренного главного изображения",
  noBlockingIssues: "есть нерешённые замечания",
  options: "размеры и цвета не подтверждены",
  ownerApproval: "нет финального решения владельца",
  size: "размерная сетка не подтверждена",
  visual: "визуальное соответствие не подтверждено",
};

const auditLabel: Record<string, string> = {
  COMMERCIAL_FIELDS_UPDATED: "Обновлены цена и наличие",
  LOCALIZED_CONTENT_UPDATED: "Обновлён текст для витрины",
  CUSTOMER_OPTIONS_UPDATED: "Обновлены размеры и цвета",
  SOURCE_IMAGE_REVIEWED: "Проверен исходник",
  PUBLIC_IMAGE_FIDELITY_APPROVED: "Одобрена версия Andrelook",
  OWNER_REVIEW_UPDATED: "Обновлена проверка товара",
};

function translation(
  items: Array<{ description: string | null; locale: string; name: string }>,
  locale: string,
) {
  return items.find((item) => item.locale === locale);
}

function chartSizes(chartData: unknown): string[] {
  if (!chartData || Array.isArray(chartData) || typeof chartData !== "object") {
    return [];
  }
  const sizes = (chartData as { sizes?: unknown }).sizes;
  return Array.isArray(sizes)
    ? sizes.filter((item): item is string => typeof item === "string")
    : [];
}

function decisionSelect(name: string, current?: string) {
  return (
    <select defaultValue={current ?? "PENDING"} name={name}>
      {Object.values(ReviewDecision).map((decision) => (
        <option key={decision} value={decision}>
          {reviewDecisionLabel[decision]}
        </option>
      ))}
    </select>
  );
}

export default async function AdminCatalogProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPrivateCatalogProduct(id);
  if (!product) notFound();

  const readiness = await getProductReadiness(id);
  const ru = translation(product.translations, "RU");
  const et = translation(product.translations, "ET");
  const en = translation(product.translations, "EN");
  const title = ru?.name ?? en?.name ?? et?.name;
  const identityConfirmed =
    product.review?.identityDecision === "APPROVED" && Boolean(title);
  const categoryName =
    product.category?.translations.find((item) => item.locale === "RU")?.name ??
    product.category?.slug;
  const approvedPrimary = product.images.find(
    (image) => image.role === "PRIMARY" && image.reviewStatus === "APPROVED",
  );
  const sizes = chartSizes(product.sizeChart?.chartData);
  const approvedSizes = [
    ...new Set(
      product.variants
        .filter((item) => item.isEnabled)
        .map((item) => item.sizeLabel)
        .filter((item): item is string => Boolean(item)),
    ),
  ];
  const optionsColors = product.colors
    .map((color) => {
      const names = Object.fromEntries(
        color.translations.map((item) => [item.locale, item.name]),
      );
      return [
        color.code,
        names.RU ?? "",
        names.ET ?? "",
        names.EN ?? "",
        color.swatchHex ?? "",
      ].join("|");
    })
    .join("\n");
  const issues = Array.isArray(product.review?.blockingIssues)
    ? product.review.blockingIssues.filter(
        (issue): issue is string => typeof issue === "string",
      )
    : [];

  const sectionGates = [
    Boolean(
      product.review?.identityDecision === "APPROVED" &&
      product.review.categoryDecision === "APPROVED",
    ),
    Boolean(
      product.retailPriceMinor && product.currency && product.availabilityType,
    ),
    product.colors.length > 0 && approvedSizes.length > 0,
    [ru, et, en].every((item) =>
      Boolean(item?.name.trim() && item.description?.trim()),
    ),
    Boolean(approvedPrimary),
    product.review?.ownerPublicationApproved === true,
  ];
  const completedGates = sectionGates.filter(Boolean).length;

  return (
    <>
      <Link className="admin-back-link" href="/admin/catalog">
        ← Назад в каталог
      </Link>

      <header className="product-editor-hero">
        <div className="product-editor-thumb">
          {approvedPrimary ? (
            <Image
              alt={ru?.name ?? "Товар Andrelook"}
              fill
              sizes="160px"
              src={approvedPrimary.url}
            />
          ) : (
            <span aria-hidden="true">A</span>
          )}
        </div>
        <div className="product-editor-identity">
          <span className="eyebrow">{product.internalCode}</span>
          <h1>
            {identityConfirmed ? title : "Название требует подтверждения"}
          </h1>
          {!identityConfirmed && title ? (
            <p>Исходное название: {title}</p>
          ) : null}
          <div className="product-editor-meta">
            <span>{categoryName ?? "Категория не указана"}</span>
            <span>
              {product.privateData?.supplierName ?? "Поставщик не указан"}
            </span>
            <span>{publicationLabel[product.publicationStatus]}</span>
          </div>
        </div>
        <div className="product-readiness-score">
          <span>Готовность товара</span>
          <strong>{completedGates} из 6</strong>
          <div className="readiness-meter" aria-hidden="true">
            {sectionGates.map((ready, index) => (
              <span className={ready ? "complete" : undefined} key={index} />
            ))}
          </div>
        </div>
      </header>

      <nav aria-label="Разделы карточки товара" className="product-editor-nav">
        <a href="#main">Основное</a>
        <a href="#commercial">Цена и наличие</a>
        <a href="#options">Размеры и цвета</a>
        <a href="#content">Описание</a>
        <a href="#photos">Фото</a>
        <a href="#publication">Проверка и публикация</a>
      </nav>

      <p
        className={`readiness-summary ${readiness.ready ? "ready" : "blocked"}`}
      >
        {readiness.ready
          ? "Все обязательные проверки пройдены. Товар ещё не опубликован автоматически."
          : `До публикации: ${readiness.reasons
              .map((reason) => readinessReason[reason] ?? reason)
              .join("; ")}.`}
      </p>

      <div className="product-editor-sections">
        <section className="admin-panel editor-section" id="main">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">Раздел 1</span>
              <h2>Основное</h2>
            </div>
            <span className={sectionGates[0] ? "gate-pass" : "gate-pending"}>
              {sectionGates[0] ? "Заполнено" : "Требует решения"}
            </span>
          </div>
          <div className="editor-two-column">
            <dl>
              <div>
                <dt>Название</dt>
                <dd>{title ?? "Требует подтверждения"}</dd>
              </div>
              <div>
                <dt>Категория</dt>
                <dd>{categoryName ?? "Не указана"}</dd>
              </div>
              <div>
                <dt>Внутренний код</dt>
                <dd>{product.internalCode}</dd>
              </div>
              <div>
                <dt>Публикация</dt>
                <dd>{publicationLabel[product.publicationStatus]}</dd>
              </div>
            </dl>
            <details className="source-details">
              <summary>Исходные данные</summary>
              <dl>
                <div>
                  <dt>Поставщик</dt>
                  <dd>{product.privateData?.supplierName ?? "Не указан"}</dd>
                </div>
                <div>
                  <dt>Код поставщика</dt>
                  <dd>
                    {product.privateData?.supplierProductCode ?? "Не указан"}
                  </dd>
                </div>
                <div>
                  <dt>Проверка источника</dt>
                  <dd>
                    {product.privateData?.sourceReviewStatus
                      ? sourceReviewLabel[
                          product.privateData.sourceReviewStatus
                        ]
                      : "Не указана"}
                  </dd>
                </div>
              </dl>
              {product.privateData?.supplierAlbumUrl ? (
                <a
                  className="text-link"
                  href={product.privateData.supplierAlbumUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Открыть закрытый альбом ↗
                </a>
              ) : null}
            </details>
          </div>
        </section>

        <section className="admin-panel editor-section" id="commercial">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">
                Раздел 2 · решение владельца
              </span>
              <h2>Цена и наличие</h2>
            </div>
            <span className={sectionGates[1] ? "gate-pass" : "gate-pending"}>
              {sectionGates[1] ? "Заполнено" : "Не заполнено"}
            </span>
          </div>
          <p>Сохраняйте только подтверждённые коммерческие данные.</p>
          <form action={saveCommercialFields} className="admin-form-grid">
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Розничная цена</span>
              <input
                defaultValue={
                  product.retailPriceMinor === null
                    ? ""
                    : product.retailPriceMinor / 100
                }
                inputMode="decimal"
                min="0.01"
                name="retailPrice"
                placeholder="Не указана"
                required
                step="0.01"
              />
            </label>
            <label>
              <span>Валюта</span>
              <input
                defaultValue={product.currency ?? ""}
                maxLength={3}
                name="currency"
                placeholder="EUR"
                required
              />
            </label>
            <label>
              <span>Наличие</span>
              <select
                defaultValue={product.availabilityType ?? ""}
                name="availabilityType"
                required
              >
                <option disabled value="">
                  Выберите
                </option>
                {Object.values(AvailabilityType).map((value) => (
                  <option key={value} value={value}>
                    {availabilityLabel[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              <span>Условия предзаказа / срок</span>
              <input
                defaultValue={product.preorderEstimateText ?? ""}
                name="preorderEstimateText"
                placeholder="Только если срок подтверждён"
              />
            </label>
            <button type="submit">Сохранить цену и наличие</button>
          </form>
        </section>

        <section className="admin-panel editor-section" id="options">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">
                Раздел 3 · решение владельца
              </span>
              <h2>Размеры и цвета</h2>
            </div>
            <span className={sectionGates[2] ? "gate-pass" : "gate-pending"}>
              {sectionGates[2] ? "Заполнено" : "Требует решения"}
            </span>
          </div>
          {sizes.length ? (
            <p className="evidence-note">
              В исходной размерной сетке найдены размеры: {sizes.join(", ")}.
              Это справка, а не автоматическое одобрение.
            </p>
          ) : null}
          <form
            action={saveProductOptions}
            className="admin-form-grid option-editor"
          >
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Размеры для выбора</span>
              <textarea
                defaultValue={approvedSizes.join(", ")}
                name="sizes"
                placeholder="Например: S, M, L"
                required
                rows={5}
              />
            </label>
            <label className="wide">
              <span>Цвета</span>
              <textarea
                defaultValue={optionsColors}
                name="colors"
                placeholder="BLACK | Чёрный | Must | Black | #111111"
                required
                rows={5}
              />
              <small>Один цвет на строку: код | RU | ET | EN | #HEX.</small>
            </label>
            <button type="submit">Сохранить размеры и цвета</button>
          </form>
        </section>

        <section className="admin-panel editor-section" id="content">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">Раздел 4 · витрина</span>
              <h2>Описание</h2>
            </div>
            <span className={sectionGates[3] ? "gate-pass" : "gate-pending"}>
              {sectionGates[3]
                ? "Три языка заполнены"
                : "Есть незаполненные языки"}
            </span>
          </div>
          <p>
            Русский, эстонский и английский хранятся отдельно. Используйте
            только подтверждённые факты о товаре.
          </p>
          <form
            action={saveLocalizedContent}
            className="localized-content-form"
          >
            <input name="productId" type="hidden" value={product.id} />
            {[
              ["RU", ru],
              ["ET", et],
              ["EN", en],
            ].map(([locale, item], index) => {
              const code = locale as keyof typeof languageNames;
              const record = item as typeof ru;
              return (
                <details
                  className="language-editor"
                  key={code}
                  open={index === 0}
                >
                  <summary>
                    <span>{languageNames[code]}</span>
                    <small>
                      {record?.name && record.description
                        ? "Заполнено"
                        : "Не заполнено"}
                    </small>
                  </summary>
                  <fieldset>
                    <legend className="sr-only">{languageNames[code]}</legend>
                    <label>
                      <span>Название</span>
                      <input
                        defaultValue={record?.name ?? ""}
                        name={`name${code}`}
                        required
                      />
                    </label>
                    <label>
                      <span>Описание</span>
                      <textarea
                        defaultValue={record?.description ?? ""}
                        name={`description${code}`}
                        required
                        rows={7}
                      />
                    </label>
                  </fieldset>
                </details>
              );
            })}
            <button type="submit">Сохранить тексты</button>
          </form>
        </section>

        <section className="admin-panel editor-section" id="photos">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">
                Раздел 5 · закрытые материалы
              </span>
              <h2>Фото</h2>
            </div>
            <span className={sectionGates[4] ? "gate-pass" : "gate-pending"}>
              {sectionGates[4]
                ? "Главное фото одобрено"
                : "Нет публичного главного фото"}
            </span>
          </div>

          <details className="source-image-workspace" open>
            <summary>
              Исходники поставщика <span>{product.sourceImages.length}</span>
            </summary>
            <p>
              Исходники доступны только владельцу. Выбирайте роль исключительно
              по видимому ракурсу. Одобрение исходника ещё не публикует его.
            </p>
            <div className="source-review-grid">
              {product.sourceImages.map((image) => (
                <article className="source-review-card" key={image.id}>
                  <PrivateSourceImage
                    alt={`Исходник товара, позиция ${image.sourcePosition}`}
                    imageId={image.id}
                  />
                  <div className="source-card-meta">
                    <strong>Позиция {image.sourcePosition}</strong>
                    <span>
                      {image.width && image.height
                        ? `${image.width}×${image.height}`
                        : "Размер не указан"}
                    </span>
                  </div>
                  <form
                    action={saveSourceImageReview}
                    className="admin-stack-form"
                  >
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="imageId" type="hidden" value={image.id} />
                    <label>
                      <span>Роль изображения</span>
                      <select
                        defaultValue={
                          image.assignedSourceRole ??
                          (image.isSizeChart ? "SIZE_CHART" : "ADDITIONAL")
                        }
                        name="assignedSourceRole"
                      >
                        {Object.values(ImageRole).map((role) => (
                          <option key={role} value={role}>
                            {imageRoleLabel[role]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Решение</span>
                      <select
                        defaultValue={image.reviewStatus}
                        name="reviewStatus"
                      >
                        {Object.values(SourceReviewStatus).map((state) => (
                          <option key={state} value={state}>
                            {sourceReviewLabel[state]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit">Сохранить решение</button>
                  </form>
                </article>
              ))}
            </div>
          </details>

          <section
            className="studio-workspace"
            aria-labelledby="studio-heading"
          >
            <div>
              <span className="admin-section-label">Andrelook Studio</span>
              <h3 id="studio-heading">Сравнение перед публикацией</h3>
              <p>
                Исходник → выбранный исходник → версия Andrelook → сравнение →
                решение владельца → публичное изображение.
              </p>
            </div>

            {product.images.length ? (
              <div className="studio-comparisons">
                {product.images.map((image) => (
                  <article className="studio-comparison" key={image.id}>
                    <figure>
                      {image.sourceImage ? (
                        <PrivateSourceImage
                          alt={`Исходник для ${imageRoleLabel[image.role]}`}
                          imageId={image.sourceImage.id}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          Нет исходника
                        </div>
                      )}
                      <figcaption>Исходник</figcaption>
                    </figure>
                    <figure>
                      <Image
                        alt={
                          image.translations.find(
                            (item) => item.locale === "RU",
                          )?.altText ?? imageRoleLabel[image.role]
                        }
                        height={500}
                        sizes="(max-width: 768px) 100vw, 40vw"
                        src={image.url}
                        width={400}
                      />
                      <figcaption>
                        Версия Andrelook · {imageRoleLabel[image.role]} ·{" "}
                        {sourceReviewLabel[image.reviewStatus]}
                      </figcaption>
                    </figure>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>Версий Andrelook пока нет</strong>
                <p>
                  Сначала владелец должен выбрать и одобрить подходящий
                  исходник.
                </p>
              </div>
            )}

            <details className="studio-upload">
              <summary>Добавить проверенную версию Andrelook</summary>
              <p>
                Загружайте файл только после сравнения силуэта, цвета, логотипа,
                фурнитуры, швов, карманов, пропорций и материала.
              </p>
              <form
                action={storeApprovedPublicImage}
                className="admin-form-grid"
              >
                <input name="productId" type="hidden" value={product.id} />
                <label>
                  <span>Одобренный исходник</span>
                  <select name="sourceImageId" required>
                    <option value="">Выберите</option>
                    {product.sourceImages
                      .filter(
                        (image) =>
                          image.reviewStatus === "APPROVED" &&
                          !image.isSizeChart,
                      )
                      .map((image) => (
                        <option key={image.id} value={image.id}>
                          Позиция {image.sourcePosition} ·{" "}
                          {image.assignedSourceRole
                            ? imageRoleLabel[
                                image.assignedSourceRole as ImageRole
                              ]
                            : "роль не выбрана"}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Роль на витрине</span>
                  <select name="role">
                    {Object.values(ImageRole)
                      .filter((role) => role !== "SIZE_CHART")
                      .map((role) => (
                        <option key={role} value={role}>
                          {imageRoleLabel[role]}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Файл Studio</span>
                  <input
                    accept="image/avif,image/jpeg,image/png,image/webp"
                    name="candidate"
                    required
                    type="file"
                  />
                </label>
                <label>
                  <span>Alt-текст RU</span>
                  <input name="altRU" required />
                </label>
                <label>
                  <span>Alt-текст ET</span>
                  <input name="altET" required />
                </label>
                <label>
                  <span>Alt-текст EN</span>
                  <input name="altEN" required />
                </label>
                <label className="checkbox-row wide">
                  <input
                    name="fidelityApproved"
                    required
                    type="checkbox"
                    value="yes"
                  />
                  <span>
                    Я сравнил(а) исходник и версию Andrelook и подтверждаю
                    точное визуальное соответствие.
                  </span>
                </label>
                <button type="submit">Одобрить и сохранить</button>
              </form>
            </details>
          </section>
        </section>

        <section className="admin-panel editor-section" id="publication">
          <div className="section-heading-row">
            <div>
              <span className="admin-section-label">
                Раздел 6 · финальный контроль
              </span>
              <h2>Проверка и публикация</h2>
            </div>
            <span className={sectionGates[5] ? "gate-pass" : "gate-pending"}>
              {sectionGates[5]
                ? "Одобрено владельцем"
                : "Не готово к публикации"}
            </span>
          </div>
          <form action={saveOwnerReview} className="review-checklist">
            <input name="productId" type="hidden" value={product.id} />
            {[
              [
                "identityDecision",
                "Название и модель",
                product.review?.identityDecision,
              ],
              [
                "categoryDecision",
                "Категория",
                product.review?.categoryDecision,
              ],
              [
                "visualDecision",
                "Визуальное соответствие",
                product.review?.visualDecision,
              ],
              ["sizeDecision", "Размерная сетка", product.review?.sizeDecision],
              [
                "contentDecision",
                "Тексты на трёх языках",
                product.review?.contentDecision,
              ],
              [
                "commercialDecision",
                "Цена и наличие",
                product.review?.commercialDecision,
              ],
              [
                "optionsDecision",
                "Размеры и цвета",
                product.review?.optionsDecision,
              ],
              [
                "imageDecision",
                "Публичные изображения",
                product.review?.imageDecision,
              ],
            ].map(([name, label, current]) => (
              <label key={String(name)}>
                <span>{label}</span>
                {decisionSelect(
                  String(name),
                  current ? String(current) : undefined,
                )}
              </label>
            ))}
            <label className="wide">
              <span>Что ещё нужно исправить — по одному пункту на строку</span>
              <textarea
                defaultValue={issues.join("\n")}
                name="blockingIssues"
                rows={5}
              />
            </label>
            <label className="checkbox-row wide publication-approval">
              <input
                defaultChecked={product.review?.ownerPublicationApproved}
                name="ownerPublicationApproved"
                type="checkbox"
                value="yes"
              />
              <span>
                Подтверждаю готовность товара к публикации. Сервер не примет это
                решение, пока обязательные проверки не пройдены.
              </span>
            </label>
            <button type="submit">Сохранить проверку</button>
          </form>

          <details className="audit-history">
            <summary>История решений ({product.reviewEvents.length})</summary>
            {product.reviewEvents.length ? (
              <ol className="timeline">
                {product.reviewEvents.map((event) => (
                  <li key={event.id}>
                    <strong>
                      {auditLabel[event.action] ?? "Обновлены данные товара"}
                    </strong>
                    <span>
                      {formatDateTime(event.createdAt)} ·{" "}
                      {event.changedByAdmin.email}
                    </span>
                    {event.note ? <p>{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="pending-note">Решений владельца пока нет.</p>
            )}
          </details>
        </section>
      </div>
    </>
  );
}

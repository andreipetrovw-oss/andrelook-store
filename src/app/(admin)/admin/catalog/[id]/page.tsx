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
import { PrivateStudioCandidateImage } from "@/components/private-studio-candidate-image";
import {
  availabilityLabel,
  formatDateTime,
  imageRoleLabel,
  presentBlockingIssue,
  publicationLabel,
  reviewDecisionLabel,
  sourceReviewLabel,
} from "@/lib/admin/presentation";
import { getPrivateCatalogProductWorkspace } from "@/lib/catalog/private-query";
import { getGoldenWorkspace } from "@/lib/catalog/golden-workspace";
import { studioFidelityChecklist } from "@/lib/studio/fidelity";

import {
  saveCommercialFields,
  saveLocalizedContent,
  saveOwnerReview,
  saveProductOptions,
  saveSourceImageReview,
  saveStudioCandidateReview,
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
  STUDIO_CANDIDATE_REVIEWED: "Проверена версия Andrelook Studio",
  OWNER_REVIEW_UPDATED: "Обновлена проверка товара",
};

const studioStatusLabel: Record<string, string> = {
  NEEDS_REVIEW: "Ждёт решения владельца",
  NEEDS_REVISION: "Нужна доработка",
  OWNER_APPROVED: "Одобрено владельцем",
  REJECTED: "Отклонено",
};

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numberList(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number")
    : [];
}

function jsonRecord(value: unknown): Record<string, unknown> {
  return value && !Array.isArray(value) && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function invariantList(value: unknown): Array<{
  area: string;
  evidencePositions: number[];
  requirement: string;
}> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = jsonRecord(item);
    if (
      typeof record.area !== "string" ||
      typeof record.requirement !== "string"
    ) {
      return [];
    }
    return [
      {
        area: record.area,
        evidencePositions: numberList(record.evidencePositions),
        requirement: record.requirement,
      },
    ];
  });
}

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

function evidenceNotes(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function sourceRoleValue(image: SourceImageCardProps["image"]): ImageRole {
  return Object.values(ImageRole).includes(
    image.assignedSourceRole as ImageRole,
  )
    ? (image.assignedSourceRole as ImageRole)
    : image.isSizeChart
      ? ImageRole.SIZE_CHART
      : ImageRole.ADDITIONAL;
}

type SourceImageCardProps = {
  image: {
    assignedSourceRole: string | null;
    height: number | null;
    id: string;
    isSizeChart: boolean;
    reviewStatus: SourceReviewStatus;
    sourcePosition: number;
    width: number | null;
  };
  productId: string;
  shortlistReason?: string;
};

function SourceImageReviewCard({
  image,
  productId,
  shortlistReason,
}: SourceImageCardProps) {
  return (
    <article className="source-review-card">
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
        {shortlistReason ? (
          <span className="shortlist-badge">
            Подборка Studio · {shortlistReason}
          </span>
        ) : null}
      </div>
      <form action={saveSourceImageReview} className="admin-stack-form">
        <input name="productId" type="hidden" value={productId} />
        <input name="imageId" type="hidden" value={image.id} />
        <label>
          <span>Роль изображения</span>
          <select
            defaultValue={sourceRoleValue(image)}
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
          <select defaultValue={image.reviewStatus} name="reviewStatus">
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
  );
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
  const workspace = await getPrivateCatalogProductWorkspace(id);
  if (!workspace) notFound();
  const { product, readiness } = workspace;
  const goldenWorkspace = getGoldenWorkspace(product.internalCode);
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
  const shortlistByPosition = new Map(
    goldenWorkspace?.shortlist.map((item) => [item.position, item]) ?? [],
  );
  const shortlistedSources = product.sourceImages.filter((image) =>
    shortlistByPosition.has(image.sourcePosition),
  );
  const remainingSources = product.sourceImages.filter(
    (image) => !shortlistByPosition.has(image.sourcePosition),
  );
  const activeStudioCandidates = product.studioCandidates.filter(
    (candidate) => candidate.status !== "REJECTED",
  );
  const archivedStudioCandidates = product.studioCandidates.filter(
    (candidate) => candidate.status === "REJECTED",
  );
  const primaryStudioCandidate = activeStudioCandidates.find(
    (candidate) => candidate.role === "PRIMARY",
  );
  const sizeEvidenceNotes = evidenceNotes(product.sizeChart?.evidence?.notes);
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
    ? product.review.blockingIssues
        .filter((issue): issue is string => typeof issue === "string")
        .map(presentBlockingIssue)
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

      {goldenWorkspace ? (
        <section
          aria-labelledby="owner-decisions"
          className="owner-decision-brief"
        >
          <div>
            <span className="admin-section-label">
              Золотой товар · решение владельца
            </span>
            <h2 id="owner-decisions">Что нужно решить</h2>
            <p>
              Источник, предложения и решения владельца показаны отдельно.
              Ничего ниже не считается одобренным автоматически.
            </p>
          </div>
          <ul>
            {goldenWorkspace.decisionPrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </section>
      ) : null}

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
              {product.sizeChart?.units
                ? ` Единицы источника: ${product.sizeChart.units}.`
                : " Единицы в источнике не указаны — они не были выведены автоматически."}
              {product.sizeChart?.evidence?.sourceImagePosition
                ? ` Источник: позиция ${product.sizeChart.evidence.sourceImagePosition}.`
                : ""}
              Это справка, а не автоматическое одобрение.
            </p>
          ) : null}
          {sizeEvidenceNotes.length ? (
            <ul className="evidence-details">
              {sizeEvidenceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
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
          {goldenWorkspace ? (
            <details className="content-suggestions" open>
              <summary>Предложения на основе источника · не одобрены</summary>
              <p>
                Это черновики для проверки владельцем. Они не сохранены как
                одобренный контент и не меняют готовность товара.
              </p>
              <div className="suggestion-grid">
                {(["RU", "ET", "EN"] as const).map((locale) => (
                  <article key={locale}>
                    <span>{languageNames[locale]}</span>
                    <strong>{goldenWorkspace.content[locale].name}</strong>
                    <p>{goldenWorkspace.content[locale].description}</p>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
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
              Подборка для решения <span>{shortlistedSources.length}</span>
            </summary>
            <p>
              Это 3–6 наиболее полезных исходников, отобранных по видимому
              ракурсу. Они остаются закрытыми и неодобренными, пока владелец не
              сохранит своё решение.
            </p>
            <div className="source-review-grid">
              {shortlistedSources.map((image) => (
                <SourceImageReviewCard
                  image={image}
                  key={image.id}
                  productId={product.id}
                  shortlistReason={
                    shortlistByPosition.get(image.sourcePosition)?.reason
                  }
                />
              ))}
            </div>
          </details>

          <details className="source-image-workspace">
            <summary>
              Остальные закрытые исходники{" "}
              <span>{remainingSources.length}</span>
            </summary>
            <p>
              Полный источник сохранён для аудита. Эти изображения не выбраны в
              компактную подборку, но остаются доступны владельцу.
            </p>
            <div className="source-review-grid">
              {remainingSources.map((image) => (
                <SourceImageReviewCard
                  image={image}
                  key={image.id}
                  productId={product.id}
                />
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
                Исходник → закрытая версия Andrelook → сравнение → решение
                владельца. Одобрение кандидата само по себе не публикует фото.
              </p>
            </div>

            {activeStudioCandidates.length ? (
              <div className="studio-candidate-list">
                {activeStudioCandidates.map((candidate) => {
                  const primarySource = candidate.sources.find(
                    (source) => source.isPrimary,
                  )?.sourceImage;
                  const reference = jsonRecord(candidate.referencePack);
                  const checked = new Set(
                    stringList(jsonRecord(candidate.fidelityChecklist).checked),
                  );
                  const supporting = numberList(
                    reference.supportingSourcePositions,
                  );
                  const invariants = invariantList(reference.invariantMap);
                  return (
                    <article className="studio-candidate" key={candidate.id}>
                      <header className="studio-candidate-heading">
                        <div>
                          <span className="admin-section-label">
                            {imageRoleLabel[candidate.role]} · версия{" "}
                            {candidate.version}
                          </span>
                          <h4>{studioStatusLabel[candidate.status]}</h4>
                        </div>
                        <span
                          className={`studio-status is-${candidate.status.toLowerCase()}`}
                        >
                          {candidate.width}×{candidate.height} ·{" "}
                          {candidate.format.toUpperCase()}
                        </span>
                      </header>

                      <div className="studio-comparison">
                        <figure>
                          {primarySource ? (
                            <PrivateSourceImage
                              alt={`Основной исходник, позиция ${primarySource.sourcePosition}`}
                              imageId={primarySource.id}
                            />
                          ) : (
                            <div className="product-image-placeholder">
                              Нет исходника
                            </div>
                          )}
                          <figcaption>
                            Слева · исходник, позиция{" "}
                            {primarySource?.sourcePosition ?? "—"}
                            {supporting.length
                              ? ` · сверка: ${supporting.join(", ")}`
                              : ""}
                          </figcaption>
                        </figure>
                        <figure>
                          <PrivateStudioCandidateImage
                            alt={`Версия Andrelook Studio: ${imageRoleLabel[candidate.role]}`}
                            candidateId={candidate.id}
                          />
                          <figcaption>
                            Справа · Andrelook Studio · не опубликовано
                            {candidate.engineeringNotes
                              ? ` · ${candidate.engineeringNotes}`
                              : ""}
                          </figcaption>
                        </figure>
                      </div>

                      <div className="studio-evidence-summary">
                        <strong>
                          Почему этот ракурс считается подтверждённым
                        </strong>
                        <p>
                          {String(
                            reference.purpose ??
                              "Источник зафиксирован в пакете проверки.",
                          )}
                        </p>
                        {stringList(reference.uncertaintyNotes).map((note) => (
                          <small key={note}>{note}</small>
                        ))}
                        <small>Метод: {candidate.method}</small>
                        {invariants.length ? (
                          <details className="studio-invariants">
                            <summary>
                              Карта инвариантов · {invariants.length}
                            </summary>
                            <ul>
                              {invariants.map((item) => (
                                <li key={item.area}>
                                  <strong>{item.area}</strong>
                                  <span>{item.requirement}</span>
                                  <small>
                                    Источники:{" "}
                                    {item.evidencePositions.join(", ")}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                        {stringList(reference.iterationHistory).length ? (
                          <details className="studio-invariants">
                            <summary>История генерации и ревизий</summary>
                            <ol>
                              {stringList(reference.iterationHistory).map(
                                (item) => (
                                  <li key={item}>{item}</li>
                                ),
                              )}
                            </ol>
                          </details>
                        ) : null}
                        <a
                          href={`/admin/studio-candidates/${encodeURIComponent(candidate.id)}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Открыть версию Studio в полном размере
                        </a>
                      </div>

                      <form
                        action={saveStudioCandidateReview}
                        className="studio-review-form"
                      >
                        <input
                          name="candidateId"
                          type="hidden"
                          value={candidate.id}
                        />
                        <input
                          name="productId"
                          type="hidden"
                          value={product.id}
                        />
                        <fieldset className="studio-fidelity-list">
                          <legend>Проверка соответствия источнику</legend>
                          {studioFidelityChecklist.map(([checkId, label]) => (
                            <label key={checkId}>
                              <input
                                defaultChecked={checked.has(checkId)}
                                name="checks"
                                type="checkbox"
                                value={checkId}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </fieldset>
                        <label className="studio-owner-note">
                          <span>Комментарий владельца</span>
                          <textarea
                            defaultValue={candidate.ownerNote ?? ""}
                            name="ownerNote"
                            placeholder="Например: молния отличается от исходника"
                            rows={3}
                          />
                        </label>
                        <div className="studio-owner-actions">
                          <button
                            name="decision"
                            type="submit"
                            value="OWNER_APPROVED"
                          >
                            Одобрить
                          </button>
                          <button
                            name="decision"
                            type="submit"
                            value="NEEDS_REVISION"
                          >
                            На доработку
                          </button>
                          <button
                            name="decision"
                            type="submit"
                            value="REJECTED"
                          >
                            Отклонить
                          </button>
                        </div>
                      </form>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>Версии Studio ещё не подготовлены</strong>
                <p>Публичные изображения не создаются автоматически.</p>
              </div>
            )}

            {archivedStudioCandidates.length ? (
              <details className="studio-archive">
                <summary>
                  Архив отклонённых экспериментов Phase 6D.3 ·{" "}
                  {archivedStudioCandidates.length}
                </summary>
                <p>
                  Эти source-pixel cutout версии сохранены только для аудита.
                  Они отклонены, не участвуют в активном выборе и не могут быть
                  показаны в preview витрины.
                </p>
                <ul>
                  {archivedStudioCandidates.map((candidate) => (
                    <li key={candidate.id}>
                      <span>
                        {imageRoleLabel[candidate.role]} · версия{" "}
                        {candidate.version} · {candidate.method}
                      </span>
                      <a
                        href={`/admin/studio-candidates/${encodeURIComponent(candidate.id)}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Открыть архивную версию
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}

            {primaryStudioCandidate ? (
              <section
                className="studio-private-preview"
                aria-labelledby="studio-preview-heading"
              >
                <header>
                  <span className="admin-section-label">
                    Preview / не опубликовано
                  </span>
                  <h4 id="studio-preview-heading">
                    Проверка в масштабе витрины
                  </h4>
                  <p>
                    Закрытый макет. Он не публикует Dillon и не создаёт
                    ProductImage.
                  </p>
                </header>
                {(() => {
                  const primary = primaryStudioCandidate;
                  return (
                    <div className="studio-preview-grid">
                      <article className="studio-card-preview">
                        <span>Карточка товара</span>
                        <PrivateStudioCandidateImage
                          alt="Закрытый preview главного изображения Dillon"
                          candidateId={primary.id}
                        />
                        <strong>
                          {title ?? "Dillon — название на проверке"}
                        </strong>
                        <small>PREVIEW · НЕ ОПУБЛИКОВАНО</small>
                      </article>
                      <article className="studio-product-preview">
                        <span>Страница товара</span>
                        <PrivateStudioCandidateImage
                          alt="Закрытый крупный preview изображения Dillon"
                          candidateId={primary.id}
                        />
                        <div>
                          <strong>
                            {title ?? "Dillon — название на проверке"}
                          </strong>
                          <p>
                            Только визуальная проверка масштаба и кадрирования.
                          </p>
                          <small>PREVIEW · НЕ ОПУБЛИКОВАНО</small>
                        </div>
                      </article>
                    </div>
                  );
                })()}
              </section>
            ) : null}
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

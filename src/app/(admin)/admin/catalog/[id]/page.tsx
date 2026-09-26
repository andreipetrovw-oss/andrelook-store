import {
  AvailabilityType,
  ImageRole,
  ReviewDecision,
  SourceReviewStatus,
} from "@prisma/client";
import { notFound } from "next/navigation";

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
          {decision.replaceAll("_", " ")}
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
  const sizes = chartSizes(product.sizeChart?.chartData);
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

  return (
    <>
      <span className="eyebrow">{product.internalCode}</span>
      <h1>{en?.name ?? "Catalog record"}</h1>
      <p
        className={`readiness-summary ${readiness.ready ? "ready" : "blocked"}`}
      >
        {readiness.ready
          ? "All publication gates pass. This does not publish the product."
          : `Publication blocked: ${readiness.reasons.join(", ")}.`}
      </p>

      <div className="order-detail-grid">
        <section className="admin-panel">
          <span className="admin-section-label">Source-derived facts</span>
          <h2>Identity and category</h2>
          <dl>
            <div>
              <dt>Source identity</dt>
              <dd>
                {product.privateData?.supplierProductCode ??
                  product.internalCode}
              </dd>
            </div>
            <div>
              <dt>Model/name</dt>
              <dd>{en?.name ?? "Pending"}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{product.category?.slug ?? "Pending"}</dd>
            </div>
            <div>
              <dt>Source review</dt>
              <dd>{product.privateData?.sourceReviewStatus ?? "—"}</dd>
            </div>
          </dl>
          {product.privateData?.supplierAlbumUrl ? (
            <a
              href={product.privateData.supplierAlbumUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open private source album
            </a>
          ) : null}
        </section>

        <section className="admin-panel">
          <span className="admin-section-label">Source-derived facts</span>
          <h2>Verified size evidence</h2>
          <dl>
            <div>
              <dt>Review state</dt>
              <dd>{product.sizeChart?.reviewStatus ?? "Missing"}</dd>
            </div>
            <div>
              <dt>Units</dt>
              <dd>{product.sizeChart?.units ?? "Not stated"}</dd>
            </div>
            <div>
              <dt>Customer labels</dt>
              <dd>{sizes.join(", ") || "Missing"}</dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>{product.sizeChart?.evidence?.verification ?? "—"}</dd>
            </div>
            <div>
              <dt>Source position</dt>
              <dd>{product.sizeChart?.evidence?.sourceImagePosition ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Owner decision · audited</span>
          <h2>Commercial fields</h2>
          <form action={saveCommercialFields} className="admin-form-grid">
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Retail price</span>
              <input
                defaultValue={
                  product.retailPriceMinor === null
                    ? ""
                    : product.retailPriceMinor / 100
                }
                inputMode="decimal"
                min="0.01"
                name="retailPrice"
                required
                step="0.01"
              />
            </label>
            <label>
              <span>Currency</span>
              <input
                defaultValue={product.currency ?? "EUR"}
                maxLength={3}
                name="currency"
                required
              />
            </label>
            <label>
              <span>Availability</span>
              <select
                defaultValue={product.availabilityType ?? "PRE_ORDER"}
                name="availabilityType"
              >
                {Object.values(AvailabilityType).map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              <span>Concise preorder/delivery explanation</span>
              <input
                defaultValue={product.preorderEstimateText ?? ""}
                name="preorderEstimateText"
              />
            </label>
            <button type="submit">Save commercial decision</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Owner decision · audited</span>
          <h2>RU / ET / EN customer content</h2>
          <p>
            Use only source-supported facts. Saving content resets approval.
          </p>
          <form action={saveLocalizedContent} className="locale-editor-grid">
            <input name="productId" type="hidden" value={product.id} />
            {[
              ["RU", ru],
              ["ET", et],
              ["EN", en],
            ].map(([locale, item]) => {
              const record = item as typeof ru;
              return (
                <fieldset key={String(locale)}>
                  <legend>{String(locale)}</legend>
                  <label>
                    <span>Name</span>
                    <input
                      defaultValue={record?.name ?? ""}
                      name={`name${locale}`}
                      required
                    />
                  </label>
                  <label>
                    <span>Description</span>
                    <textarea
                      defaultValue={record?.description ?? ""}
                      name={`description${locale}`}
                      required
                      rows={6}
                    />
                  </label>
                </fieldset>
              );
            })}
            <button type="submit">Save localized content</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Owner decision · audited</span>
          <h2>Customer-selectable options</h2>
          <p>
            One colour per line: CODE | RU | ET | EN | optional #HEX. Sizes are
            comma or line separated.
          </p>
          <form action={saveProductOptions} className="admin-form-grid">
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Sizes</span>
              <textarea
                defaultValue={
                  product.variants.length
                    ? [
                        ...new Set(
                          product.variants
                            .map((item) => item.sizeLabel)
                            .filter(Boolean),
                        ),
                      ].join(", ")
                    : sizes.join(", ")
                }
                name="sizes"
                required
                rows={5}
              />
            </label>
            <label>
              <span>Colours</span>
              <textarea
                defaultValue={optionsColors}
                name="colors"
                placeholder="BLACK | Чёрный | Must | Black | #111111"
                required
                rows={5}
              />
            </label>
            <button type="submit">Replace approved options</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Private source evidence</span>
          <h2>Source-image review ({product.sourceImages.length})</h2>
          <p>
            Assign only an angle visible in the source. APPROVED here means
            source selection only; it does not make the image public.
          </p>
          <div className="source-review-grid">
            {product.sourceImages.map((image) => (
              <article className="source-review-card" key={image.id}>
                {/* Supplier imagery is intentionally shown only in this protected route. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`Private source reference ${image.sourcePosition}`}
                  loading="lazy"
                  src={image.previewUrl ?? image.sourceUrl}
                />
                <p>
                  Position {image.sourcePosition} ·{" "}
                  {image.width && image.height
                    ? `${image.width}×${image.height}`
                    : "dimensions unknown"}
                </p>
                <form
                  action={saveSourceImageReview}
                  className="admin-stack-form"
                >
                  <input name="productId" type="hidden" value={product.id} />
                  <input name="imageId" type="hidden" value={image.id} />
                  <label>
                    <span>Supported role</span>
                    <select
                      defaultValue={
                        image.assignedSourceRole ??
                        (image.isSizeChart ? "SIZE_CHART" : "ADDITIONAL")
                      }
                      name="assignedSourceRole"
                    >
                      {Object.values(ImageRole).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Source decision</span>
                    <select
                      defaultValue={image.reviewStatus}
                      name="reviewStatus"
                    >
                      {Object.values(SourceReviewStatus).map((state) => (
                        <option key={state} value={state}>
                          {state.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">Save source review</button>
                </form>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">Human fidelity gate</span>
          <h2>Approve Studio candidate into public Blob</h2>
          <p>
            The source must already be APPROVED. Upload only after side-by-side
            review of silhouette, colour, branding, hardware, seams, pockets,
            labels, proportions, and material appearance.
          </p>
          <form action={storeApprovedPublicImage} className="admin-form-grid">
            <input name="productId" type="hidden" value={product.id} />
            <label>
              <span>Approved source reference</span>
              <select name="sourceImageId" required>
                <option value="">Select</option>
                {product.sourceImages
                  .filter(
                    (image) =>
                      image.reviewStatus === "APPROVED" && !image.isSizeChart,
                  )
                  .map((image) => (
                    <option key={image.id} value={image.id}>
                      Position {image.sourcePosition} ·{" "}
                      {image.assignedSourceRole ?? "unassigned"}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Public role</span>
              <select name="role">
                {Object.values(ImageRole)
                  .filter((role) => role !== "SIZE_CHART")
                  .map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Studio candidate</span>
              <input
                accept="image/avif,image/jpeg,image/png,image/webp"
                name="candidate"
                required
                type="file"
              />
            </label>
            <label>
              <span>RU alt text</span>
              <input name="altRU" required />
            </label>
            <label>
              <span>ET alt text</span>
              <input name="altET" required />
            </label>
            <label>
              <span>EN alt text</span>
              <input name="altEN" required />
            </label>
            <label className="checkbox-row">
              <input
                name="fidelityApproved"
                required
                type="checkbox"
                value="yes"
              />
              <span>I compared SOURCE vs STUDIO and approve fidelity.</span>
            </label>
            <button type="submit">Approve and store public asset</button>
          </form>
          {product.images.length ? (
            <div className="approved-image-grid">
              {product.images.map((image) => (
                <figure key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={
                      image.translations.find((item) => item.locale === "EN")
                        ?.altText ?? image.role
                    }
                    src={image.url}
                  />
                  <figcaption>
                    {image.role} · {image.reviewStatus} · source{" "}
                    {image.sourceImage?.sourcePosition ?? "—"}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="pending-note">No public assets approved.</p>
          )}
        </section>

        <section className="admin-panel admin-panel-wide">
          <span className="admin-section-label">
            Owner publication decision
          </span>
          <h2>Structured readiness checklist</h2>
          <form action={saveOwnerReview} className="review-checklist">
            <input name="productId" type="hidden" value={product.id} />
            {[
              [
                "identityDecision",
                "Identity",
                product.review?.identityDecision,
              ],
              [
                "categoryDecision",
                "Category",
                product.review?.categoryDecision,
              ],
              [
                "visualDecision",
                "Visual fidelity",
                product.review?.visualDecision,
              ],
              ["sizeDecision", "Size evidence", product.review?.sizeDecision],
              [
                "contentDecision",
                "Localized content",
                product.review?.contentDecision,
              ],
              [
                "commercialDecision",
                "Commercial fields",
                product.review?.commercialDecision,
              ],
              [
                "optionsDecision",
                "Customer options",
                product.review?.optionsDecision,
              ],
              [
                "imageDecision",
                "Public imagery",
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
              <span>Blocking issues (one per line)</span>
              <textarea
                defaultValue={issues.join("\n")}
                name="blockingIssues"
                rows={5}
              />
            </label>
            <label className="checkbox-row wide">
              <input
                defaultChecked={product.review?.ownerPublicationApproved}
                name="ownerPublicationApproved"
                type="checkbox"
                value="yes"
              />
              <span>
                Explicitly approve publication readiness. The server rejects
                this unless every gate passes.
              </span>
            </label>
            <button type="submit">Save owner review</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <h2>Audit history</h2>
          {product.reviewEvents.length ? (
            <ol className="timeline">
              {product.reviewEvents.map((event) => (
                <li key={event.id}>
                  <strong>{event.action.replaceAll("_", " ")}</strong>
                  <span>
                    {event.createdAt.toLocaleString("en-GB")} ·{" "}
                    {event.changedByAdmin.email}
                  </span>
                  {event.note ? <p>{event.note}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="pending-note">No owner decisions recorded yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

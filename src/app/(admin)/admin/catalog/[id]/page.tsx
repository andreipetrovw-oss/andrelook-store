import { notFound } from "next/navigation";

import { getPrivateCatalogProduct } from "@/lib/catalog/private-query";
import { updateProductCommercialState } from "@/app/(admin)/admin/actions";

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
          "Catalog record"}
      </h1>
      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Publication review</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{product.publicationStatus}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>{product.slug ?? "Pending"}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{product.availabilityType ?? "Pending"}</dd>
            </div>
            <div>
              <dt>Retail price</dt>
              <dd>
                {product.retailPriceMinor === null || !product.currency
                  ? "Pending"
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
              <span>Publication state</span>
              <select
                defaultValue={product.publicationStatus}
                name="publicationStatus"
              >
                <option value="DRAFT">Draft</option>
                <option value="READY">Ready for protected review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label>
              <span>Availability</span>
              <select
                defaultValue={product.availabilityType ?? ""}
                name="availabilityType"
              >
                <option value="">Not confirmed</option>
                <option value="IN_STOCK">In stock</option>
                <option value="PRE_ORDER">Pre-order</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </label>
            <label>
              <span>Retail price</span>
              <input
                defaultValue={
                  product.retailPriceMinor === null
                    ? ""
                    : (product.retailPriceMinor / 100).toFixed(2)
                }
                inputMode="decimal"
                name="retailPrice"
                placeholder="Leave empty until approved"
              />
            </label>
            <label>
              <span>Currency</span>
              <input
                defaultValue={product.currency ?? ""}
                maxLength={3}
                name="currency"
                placeholder="EUR"
              />
            </label>
            <label>
              <span>Pre-order estimate</span>
              <input
                defaultValue={product.preorderEstimateText ?? ""}
                name="preorderEstimateText"
                placeholder="Only when owner-approved"
              />
            </label>
            <button type="submit">Save commercial state</button>
          </form>
          <p className="admin-readiness-note">
            Publishing is fail-closed until a slug, three translations, category
            translations, approved primary image, availability, retail price and
            currency are present.
          </p>
        </section>
        <section className="admin-panel">
          <h2>Private source</h2>
          <dl>
            <div>
              <dt>Supplier</dt>
              <dd>{product.privateData?.supplierName ?? "—"}</dd>
            </div>
            <div>
              <dt>Review state</dt>
              <dd>{product.privateData?.sourceReviewStatus ?? "—"}</dd>
            </div>
            <div>
              <dt>Supplier cost</dt>
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
              Open private source album
            </a>
          ) : null}
        </section>
        <section className="admin-panel">
          <h2>Storefront readiness</h2>
          <dl>
            <div>
              <dt>Localized identity</dt>
              <dd>{product.translations.length}/3</dd>
            </div>
            <div>
              <dt>Approved public images</dt>
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
              <dt>Approved colours</dt>
              <dd>
                {
                  product.colors.filter(
                    (colour) => colour.reviewStatus === "APPROVED",
                  ).length
                }
              </dd>
            </div>
            <div>
              <dt>Enabled variants</dt>
              <dd>
                {product.variants.filter((variant) => variant.isEnabled).length}
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Size evidence</h2>
          <dl>
            <div>
              <dt>Review state</dt>
              <dd>{product.sizeChart?.reviewStatus ?? "Missing"}</dd>
            </div>
            <div>
              <dt>Public</dt>
              <dd>{product.sizeChart?.isPublished ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>{product.sizeChart?.evidence?.verification ?? "—"}</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd>
                {product.sizeChart?.evidence?.verificationDate?.toLocaleDateString(
                  "en-GB",
                ) ?? "—"}
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel admin-panel-wide">
          <h2>
            Private source-image references ({product.sourceImages.length})
          </h2>
          <div className="admin-table-wrap" tabIndex={0}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Assigned role</th>
                  <th>Review</th>
                  <th>Dimensions</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {product.sourceImages.map((image) => (
                  <tr key={image.id}>
                    <td>{image.sourcePosition}</td>
                    <td>{image.assignedSourceRole ?? "—"}</td>
                    <td>{image.reviewStatus}</td>
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
                        Open source
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

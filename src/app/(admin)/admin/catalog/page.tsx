import { getAdminCatalog } from "@/lib/admin/query";
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
      <span className="eyebrow">Private catalog</span>
      <h1>Catalog readiness</h1>
      <div className="admin-cards admin-cards-catalog">
        <article className="admin-card">
          <span>Prepared identities</span>
          <p>
            {summary.content}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Verified charts</span>
          <p>
            {summary.charts}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Retail prices</span>
          <p>
            {summary.prices}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Availability states</span>
          <p>
            {summary.availability}/{products.length}
          </p>
        </article>
        <article className="admin-card">
          <span>Approved photography</span>
          <p>
            {summary.images}/{products.length}
          </p>
        </article>
      </div>
      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>State</th>
              <th>Content</th>
              <th>Public image</th>
              <th>Size chart</th>
              <th>Availability</th>
              <th>Retail</th>
              <th>Private source</th>
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
                <td>{product.publicationStatus}</td>
                <td>{product.contentComplete ? "Ready" : "Pending"}</td>
                <td>{product.imageReady ? "Ready" : "Pending"}</td>
                <td>
                  {product.sizeReady
                    ? "Published"
                    : (product.sizeChart?.reviewStatus ?? "Missing")}
                </td>
                <td>{product.availabilityType ?? "Pending"}</td>
                <td>
                  {product.retailPriceMinor !== null && product.currency
                    ? `${(product.retailPriceMinor / 100).toFixed(2)} ${product.currency}`
                    : "Pending"}
                </td>
                <td>
                  <span>{product.privateData?.supplierName ?? "—"}</span>
                  {product.privateData?.supplierAlbumUrl ? (
                    <a
                      href={product.privateData.supplierAlbumUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Source album
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

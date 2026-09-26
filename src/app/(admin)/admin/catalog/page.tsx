import { getAdminCatalog } from "@/lib/admin/query";
import Link from "next/link";

export default async function AdminCatalogPage() {
  const products = await getAdminCatalog();
  return (
    <>
      <span className="eyebrow">Private catalog</span>
      <h1>Catalog readiness</h1>
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
              <th>Owner gate</th>
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
                <td>{product.ownerApproved ? "Approved" : "Blocked"}</td>
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

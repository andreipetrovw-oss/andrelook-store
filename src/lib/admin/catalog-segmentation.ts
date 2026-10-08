export const adminCatalogViews = ["published", "drafts", "research"] as const;

export type AdminCatalogView = (typeof adminCatalogViews)[number];

type CatalogProductReadiness = {
  availabilityType: string | null;
  contentComplete: boolean;
  currency: string | null;
  imageReady: boolean;
  internalCode: string;
  publicationStatus: string;
  retailPriceMinor: number | null;
  sizeReady: boolean;
};

export function getAdminCatalogView(value?: string): AdminCatalogView {
  return adminCatalogViews.includes(value as AdminCatalogView)
    ? (value as AdminCatalogView)
    : "published";
}

export function getAdminCatalogSection(
  product: Pick<CatalogProductReadiness, "internalCode" | "publicationStatus">,
): AdminCatalogView {
  if (product.internalCode.startsWith("AL-SRC-")) return "research";
  return product.publicationStatus === "PUBLISHED" ? "published" : "drafts";
}

export function getAdminCatalogOverview<T extends CatalogProductReadiness>(
  products: T[],
) {
  const published = products.filter(
    (product) => getAdminCatalogSection(product) === "published",
  );
  const drafts = products.filter(
    (product) => getAdminCatalogSection(product) === "drafts",
  );
  const research = products.filter(
    (product) => getAdminCatalogSection(product) === "research",
  );

  const metrics = {
    availability: published.filter((product) => product.availabilityType)
      .length,
    charts: published.filter((product) => product.sizeReady).length,
    content: published.filter((product) => product.contentComplete).length,
    images: published.filter((product) => product.imageReady).length,
    prices: published.filter(
      (product) =>
        product.retailPriceMinor !== null && Boolean(product.currency),
    ).length,
  };
  const ready = published.filter(
    (product) =>
      product.availabilityType &&
      product.contentComplete &&
      product.imageReady &&
      product.retailPriceMinor !== null &&
      product.currency &&
      product.sizeReady,
  ).length;

  return { drafts, metrics, published, ready, research };
}

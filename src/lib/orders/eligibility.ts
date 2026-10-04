export type RequestEligibilityProduct = {
  availability: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE" | null;
  colours: string[];
  currency: string | null;
  publicationStatus: "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
  retailPriceMinor: number | null;
  sizes: string[];
  version: string;
};

export function assessRequestEligibility(
  product: RequestEligibilityProduct | null,
  request: {
    colour: string;
    productVersion: string;
    size: string;
    sizeHelpRequested?: boolean;
  },
  reviewMode: boolean,
): "not-found" | "unavailable" | "selection" | null {
  if (
    !product ||
    (product.publicationStatus !== "PUBLISHED" &&
      !(reviewMode && product.publicationStatus === "READY"))
  ) {
    return "not-found";
  }
  if (
    product.publicationStatus === "PUBLISHED" &&
    (!product.availability ||
      !product.currency ||
      product.retailPriceMinor === null)
  ) {
    return "not-found";
  }
  if (product.version !== request.productVersion) return "selection";
  if (product.availability === "UNAVAILABLE") return "unavailable";
  if (
    product.sizes.length &&
    !request.sizeHelpRequested &&
    !product.sizes.includes(request.size)
  ) {
    return "selection";
  }
  if (
    product.colours.length &&
    (!request.colour || !product.colours.includes(request.colour))
  ) {
    return "selection";
  }
  return null;
}

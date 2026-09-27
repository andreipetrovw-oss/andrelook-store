import type {
  AvailabilityType,
  ReviewDecision,
  SourceReviewStatus,
} from "@prisma/client";

const requiredLocales = ["RU", "ET", "EN"] as const;

export type PublicationReadinessInput = {
  availabilityType: AvailabilityType | null;
  categoryId: string | null;
  currency: string | null;
  enabledVariantCount: number;
  primaryImages: Array<{
    approvedAt: Date | null;
    reviewStatus: SourceReviewStatus;
  }>;
  retailPriceMinor: number | null;
  review: null | {
    blockingIssues: unknown;
    categoryDecision: ReviewDecision;
    commercialDecision: ReviewDecision;
    contentDecision: ReviewDecision;
    identityDecision: ReviewDecision;
    imageDecision: ReviewDecision;
    optionsDecision: ReviewDecision;
    ownerPublicationApproved: boolean;
    sizeDecision: ReviewDecision;
    visualDecision: ReviewDecision;
  };
  sizeChart: null | {
    isPublished: boolean;
    reviewStatus: SourceReviewStatus;
  };
  slug: string | null;
  translations: Array<{
    description: string | null;
    locale: string;
    name: string;
  }>;
};

function hasBlockingIssues(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function evaluatePublicationReadiness(
  product: PublicationReadinessInput,
) {
  const review = product.review;
  const localizedContent = requiredLocales.every((locale) => {
    const translation = product.translations.find(
      (entry) => entry.locale === locale,
    );
    return Boolean(translation?.name.trim() && translation.description?.trim());
  });
  const checks = {
    category:
      Boolean(product.categoryId) && review?.categoryDecision === "APPROVED",
    commercial:
      product.retailPriceMinor !== null &&
      product.retailPriceMinor > 0 &&
      Boolean(product.currency?.match(/^[A-Z]{3}$/)) &&
      Boolean(product.availabilityType) &&
      review?.commercialDecision === "APPROVED",
    content: localizedContent && review?.contentDecision === "APPROVED",
    identity: Boolean(product.slug) && review?.identityDecision === "APPROVED",
    imagery:
      product.primaryImages.some(
        (image) =>
          image.reviewStatus === "APPROVED" && image.approvedAt !== null,
      ) && review?.imageDecision === "APPROVED",
    noBlockingIssues: !hasBlockingIssues(review?.blockingIssues),
    options:
      product.enabledVariantCount > 0 && review?.optionsDecision === "APPROVED",
    ownerApproval: review?.ownerPublicationApproved === true,
    size:
      product.sizeChart?.reviewStatus === "APPROVED" &&
      product.sizeChart.isPublished &&
      review?.sizeDecision === "APPROVED",
    visual: review?.visualDecision === "APPROVED",
  };
  const reasons = Object.entries(checks)
    .filter(([, ready]) => !ready)
    .map(([name]) => name);
  return { checks, ready: reasons.length === 0, reasons };
}

export function assertPublicationReady(product: PublicationReadinessInput) {
  const result = evaluatePublicationReadiness(product);
  if (!result.ready) {
    throw new Error(
      `Товар пока не готов к публикации: ${result.reasons.join(", ")}`,
    );
  }
  return result;
}

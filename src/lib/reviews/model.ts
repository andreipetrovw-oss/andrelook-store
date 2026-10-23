import { z } from "zod";

import { isInternalTestOrder } from "@/lib/admin/test-orders";

export function reviewEligible(order: {
  status: string;
  displayNumber: string;
  customer: {
    name: string;
    email?: string | null;
    preferredContactValue?: string;
  };
}) {
  // A disposable, unmistakably labelled fixture is permitted only in the
  // existing isolated staging project's Preview environment, never production.
  if (order.displayNumber === "TEST-UAT-REVIEWS-V1") {
    return (
      order.status === "DELIVERED" &&
      process.env.VERCEL_ENV === "preview" &&
      process.env.VERCEL_PROJECT_ID === "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m"
    );
  }
  return (
    order.status === "DELIVERED" &&
    !isInternalTestOrder(order.displayNumber) &&
    !/\b(test|uat|demo|development|тест)\b/i.test(
      `${order.displayNumber} ${order.customer.name} ${order.customer.email ?? ""} ${order.customer.preferredContactValue ?? ""}`,
    )
  );
}

const optionalRating = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1).max(5).optional(),
);

export const reviewSubmissionSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(10)
    .max(3000)
    .refine(
      (value) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value),
    ),
  nameStyle: z.enum(["FIRST", "INITIAL", "ANONYMOUS"]),
  productIndex: z.string().regex(/^(|\d{1,3})$/),
  consent: z.literal("yes"),
  locale: z.enum(["et", "ru", "en"]),
  quality: optionalRating,
  communication: optionalRating,
  delivery: optionalRating,
});

export function safeCustomerNames(name: string) {
  const parts = name.trim().split(/\s+/);
  const valid = (value: string) => /^[\p{L}][\p{L}'’-]{0,30}$/u.test(value);
  if (!parts[0] || !valid(parts[0])) return { first: null, initial: null };
  return {
    first: parts[0],
    initial:
      parts[1] && valid(parts[1]) ? `${parts[0]} ${parts[1][0]}.` : parts[0],
  };
}

export function containsContactData(text: string) {
  return /[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\/|www\.|(?:\+?\d[\s().-]*){7,}|@[\p{L}\d_]{3,}|AL-\d{8}-[A-Z\d]+/iu.test(
    text,
  );
}

export type PublicReview = {
  publicId: string;
  rating: number;
  text: string;
  displayName: string;
  locale: string;
  submittedAt: string;
  productName: string | null;
  productId: string | null;
  kind: "PRODUCT" | "SERVICE";
};

type ReviewProduct = {
  publicationStatus: string;
  translations: Array<{ locale: string; name: string }>;
};

export function reviewProductName(
  snapshot: string | null,
  locale: string,
  product?: ReviewProduct | null,
) {
  const safe = (value: string | null | undefined) =>
    value?.trim() &&
    !/\bAL-[A-Z0-9_-]+\b/i.test(value) &&
    !containsContactData(value)
      ? value.trim()
      : null;
  const translations =
    product?.publicationStatus === "PUBLISHED" ? product.translations : [];
  return (
    safe(
      translations.find((t) => t.locale.toLowerCase() === locale.toLowerCase())
        ?.name,
    ) ??
    safe(snapshot) ??
    { et: "Ostetud toode", ru: "Приобретённый товар", en: "Purchased item" }[
      locale.toLowerCase() as "et" | "ru" | "en"
    ] ??
    "Purchased item"
  );
}

export function publicReviewDTO(review: {
  publicId: string;
  rating: number;
  publicText: string;
  displayName: string;
  locale: string;
  submittedAt: Date;
  productNameSnapshot: string | null;
  productId: string | null;
  kind: "PRODUCT" | "SERVICE";
  product?: ReviewProduct | null;
}): PublicReview {
  return {
    publicId: review.publicId,
    rating: review.rating,
    text: review.publicText,
    displayName: review.displayName,
    locale: review.locale,
    submittedAt: review.submittedAt.toISOString(),
    productName:
      review.kind === "PRODUCT"
        ? reviewProductName(
            review.productNameSnapshot,
            review.locale,
            review.product,
          )
        : null,
    productId: review.productId,
    kind: review.kind,
  };
}

export function reviewAggregate(reviews: Pick<PublicReview, "rating">[]) {
  const count = reviews.length;
  const distribution = [1, 2, 3, 4, 5].map(
    (rating) => reviews.filter((r) => r.rating === rating).length,
  );
  return {
    count,
    average: count
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 100,
        ) / 100
      : null,
    distribution,
  };
}

export function productReviewSchema(reviews: PublicReview[]) {
  const productReviews = reviews.filter((r) => r.kind === "PRODUCT");
  const aggregate = reviewAggregate(productReviews);
  if (!aggregate.count) return {};
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: productReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.displayName },
      datePublished: r.submittedAt.slice(0, 10),
      inLanguage: r.locale.toLowerCase(),
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

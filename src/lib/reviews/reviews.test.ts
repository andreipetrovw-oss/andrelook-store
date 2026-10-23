import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
vi.mock("server-only", () => ({}));
const notification = vi.hoisted(() => vi.fn().mockResolvedValue("sent"));
vi.mock("./owner-notification", () => ({ notifyReviewOwner: notification }));
vi.mock("@/lib/env", () => ({ isDatabaseConfigured: () => true }));
const db = vi.hoisted(() => ({
  order: { findUnique: vi.fn() },
  reviewInvitation: { findUnique: vi.fn(), upsert: vi.fn() },
  customerReview: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  reviewModerationHistory: { create: vi.fn() },
  reviewRateLimit: { upsert: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ getPrisma: () => db }));
import {
  containsContactData,
  publicReviewDTO,
  productReviewSchema,
  reviewAggregate,
  reviewEligible,
  reviewSubmissionSchema,
  safeCustomerNames,
} from "./model";
import {
  invitationToken,
  newReviewCredentials,
  reviewHash,
  validReviewToken,
} from "./security";
import {
  consumeReviewAttempt,
  ensureReviewInvitation,
  getPublishedReviews,
  moderateReview,
  resolveReviewInvitation,
  submitCustomerReview,
} from "./service";
import { reviewCopy, reviewRequestMessage } from "./copy";
import {
  ReviewCards,
  ReviewsSummary,
  ProductReviews,
} from "@/components/reviews";

const order = {
  id: "order-private",
  status: "DELIVERED",
  displayNumber: "AL-REAL",
  requestedLocale: "ET",
  customer: {
    name: "Henri Kuusk",
    email: "private@example.com",
    preferredContactValue: "private-contact",
  },
  items: [
    {
      id: "item-private",
      productId: "product-1",
      productNameSnapshot: "Moncler Maya",
    },
  ],
};
const data = {
  rating: "4",
  text: "The communication was clear and helpful.",
  nameStyle: "INITIAL",
  productIndex: "",
  consent: "yes",
  locale: "en",
  quality: "",
  communication: "5",
  delivery: "",
};
const review = {
  id: "private-review",
  publicId: "public-review",
  rating: 4,
  publicText: "Clear communication and thoughtful service.",
  originalText: "original privately retained",
  displayName: "Henri K.",
  locale: "EN",
  submittedAt: new Date("2026-10-22T08:00:00Z"),
  productNameSnapshot: null,
  productId: null,
  kind: "SERVICE" as const,
  status: "SUBMITTED",
  publishedAt: null,
};
const token = "A".repeat(43);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TRACKING_ACCESS_CODE_SECRET =
    "review-test-encryption-secret-1234567890";
  db.$transaction.mockImplementation(async (cb) => cb(db));
  db.order.findUnique.mockResolvedValue(order);
  db.reviewInvitation.findUnique.mockResolvedValue({
    id: "inv-1",
    order,
    review: null,
    revokedAt: null,
  });
  db.customerReview.create.mockResolvedValue(review);
  db.reviewRateLimit.upsert.mockResolvedValue({ attempts: 1 });
  Object.assign(db.reviewInvitation, {
    findUniqueOrThrow: db.reviewInvitation.findUnique,
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("review eligibility and credentials", () => {
  it("limits the explicitly marked UAT fixture to isolated staging Preview", () => {
    const fixture = {
      ...order,
      displayNumber: "TEST-UAT-REVIEWS-V1",
      customer: { name: "TEST UAT Reviews" },
    };
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(reviewEligible(fixture)).toBe(false);
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m");
    expect(reviewEligible(fixture)).toBe(false);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(reviewEligible(fixture)).toBe(true);
  });
  it("permits real delivered orders only", () => {
    expect(reviewEligible(order)).toBe(true);
    for (const status of [
      "NEW",
      "CONFIRMED",
      "PAID",
      "IN_TRANSIT",
      "CANCELLED",
    ])
      expect(reviewEligible({ ...order, status })).toBe(false);
    expect(
      reviewEligible({ ...order, displayNumber: "AL-20261007-3C7477" }),
    ).toBe(false);
    expect(reviewEligible({ ...order, customer: { name: "TEST UAT" } })).toBe(
      false,
    );
  });
  it("generates independent 256-bit encrypted tokens with no plaintext storage", () => {
    const a = newReviewCredentials(),
      b = newReviewCredentials();
    const raw = invitationToken(a.tokenEncrypted);
    expect(validReviewToken(raw)).toBe(true);
    expect(raw).toHaveLength(43);
    expect(a.tokenHash).toBe(reviewHash(raw));
    expect(JSON.stringify(a)).not.toContain(raw);
    expect(b.tokenHash).not.toBe(a.tokenHash);
    expect(() => invitationToken(`${a.tokenEncrypted}bad`)).toThrow();
  });
  it("fails closed without a server encryption secret", () => {
    delete process.env.TRACKING_ACCESS_CODE_SECRET;
    expect(newReviewCredentials).toThrow("unavailable");
  });
  it("does not issue an entitlement to an ineligible order", async () => {
    db.order.findUnique.mockResolvedValue({ ...order, status: "NEW" });
    expect(await ensureReviewInvitation(order.id)).toBeNull();
    expect(db.reviewInvitation.upsert).not.toHaveBeenCalled();
  });
  it("reuses existing entitlement without marking requested", async () => {
    await ensureReviewInvitation(order.id);
    expect(db.reviewInvitation.upsert).not.toHaveBeenCalled();
  });
  it("revoked and old regenerated tokens cannot resolve", async () => {
    db.reviewInvitation.findUnique.mockResolvedValue({
      order,
      revokedAt: new Date(),
    });
    expect(await resolveReviewInvitation(token)).toBeNull();
    db.reviewInvitation.findUnique.mockResolvedValue(null);
    expect(await resolveReviewInvitation(token)).toBeNull();
  });
  it("invalid tokens never query an order", async () => {
    expect(await resolveReviewInvitation("guess")).toBeNull();
    expect(db.reviewInvitation.findUnique).not.toHaveBeenCalled();
  });
});

describe("customer review submission", () => {
  it("validates ratings, text limits, consent and plain text", () => {
    expect(reviewSubmissionSchema.safeParse(data).success).toBe(true);
    for (const change of [
      { rating: "0" },
      { rating: "6" },
      { rating: "1.5" },
      { text: "short" },
      { text: "x".repeat(3001) },
      { text: "<script>alert(1)</script>" },
      { consent: "no" },
    ])
      expect(
        reviewSubmissionSchema.safeParse({ ...data, ...change }).success,
      ).toBe(false);
  });
  it("submits privately with an automatically derived customer and entitlement", async () => {
    expect(await submitCustomerReview(token, data)).toBe(true);
    const saved = db.customerReview.create.mock.calls[0]![0].data;
    expect(saved).toMatchObject({
      invitationId: "inv-1",
      status: "SUBMITTED",
      displayName: "Henri K.",
      kind: "SERVICE",
      locale: "EN",
      rating: 4,
    });
    expect(saved).not.toHaveProperty("customerId");
  });
  it("links product review only to a purchased item", async () => {
    expect(
      await submitCustomerReview(token, { ...data, productIndex: "0" }),
    ).toBe(true);
    expect(db.customerReview.create.mock.calls[0]![0].data).toMatchObject({
      kind: "PRODUCT",
      productId: "product-1",
      orderItemId: "item-private",
      productNameSnapshot: "Moncler Maya",
    });
    db.customerReview.create.mockClear();
    expect(
      await submitCustomerReview(token, { ...data, productIndex: "99" }),
    ).toBe(false);
    expect(db.customerReview.create).not.toHaveBeenCalled();
  });
  it("allows an honest one-star review without special moderation", async () => {
    expect(await submitCustomerReview(token, { ...data, rating: "1" })).toBe(
      true,
    );
    expect(db.customerReview.create.mock.calls[0]![0].data.status).toBe(
      "SUBMITTED",
    );
  });
  it("returns success on replay without a second review", async () => {
    db.reviewInvitation.findUnique.mockResolvedValue({
      id: "inv-1",
      order,
      review,
      revokedAt: null,
    });
    expect(await submitCustomerReview(token, data)).toBe(true);
    expect(db.customerReview.create).not.toHaveBeenCalled();
    expect(notification).not.toHaveBeenCalled();
  });
  it("notifies only after a successful original submission", async () => {
    expect(await submitCustomerReview(token, data)).toBe(true);
    expect(notification).toHaveBeenCalledTimes(1);
    expect(notification.mock.calls[0]![0]).not.toHaveProperty("token");
  });
  it("email failure leaves submission successful", async () => {
    notification.mockResolvedValueOnce("failed");
    expect(await submitCustomerReview(token, data)).toBe(true);
    expect(db.customerReview.create).toHaveBeenCalledTimes(1);
  });
  it("rejects changed eligibility and revoked tokens at write time", async () => {
    for (const state of [
      { order: { ...order, status: "CANCELLED" }, revokedAt: null },
      { order, revokedAt: new Date() },
    ]) {
      db.reviewInvitation.findUnique.mockResolvedValue({
        ...state,
        review: null,
      });
      expect(await submitCustomerReview(token, data)).toBe(false);
    }
    expect(db.customerReview.create).not.toHaveBeenCalled();
  });
  it("uses safe names or anonymous choices instead of handles", () => {
    expect(safeCustomerNames("Henri Kuusk")).toEqual({
      first: "Henri",
      initial: "Henri K.",
    });
    expect(safeCustomerNames("@private_handle").first).toBeNull();
    expect(safeCustomerNames("private@example.com").first).toBeNull();
  });
});

describe("moderation and public boundary", () => {
  function setReview(changes = {}) {
    db.reviewInvitation.findUnique.mockResolvedValue({
      id: "inv-1",
      order,
      review: { ...review, ...changes },
    });
  }
  it("publishes with a real eligible relationship and records audit", async () => {
    setReview();
    await moderateReview({
      orderId: order.id,
      action: "PUBLISH",
      reason: "",
      actorEmail: "owner@example.com",
    });
    expect(db.customerReview.update.mock.calls[0]![0].data.status).toBe(
      "PUBLISHED",
    );
    expect(
      db.reviewModerationHistory.create.mock.calls[0]![0].data.action,
    ).toBe("PUBLISH");
  });
  it("unpublishes without deleting the original or changing rating", async () => {
    setReview({ status: "PUBLISHED" });
    await moderateReview({
      orderId: order.id,
      action: "UNPUBLISH",
      reason: "Customer requested removal",
      actorEmail: "owner@example.com",
    });
    expect(db.customerReview.update.mock.calls[0]![0].data).not.toHaveProperty(
      "originalText",
    );
    expect(db.customerReview.update.mock.calls[0]![0].data).not.toHaveProperty(
      "rating",
    );
  });
  it("preserves originals and logs privacy edits", async () => {
    setReview();
    await moderateReview({
      orderId: order.id,
      action: "REDACT",
      reason: "Remove personal address",
      text: "Helpful service and clear communication.",
      actorEmail: "owner@example.com",
    });
    expect(db.customerReview.update.mock.calls[0]![0].data.status).toBe(
      "SUBMITTED",
    );
    expect(
      db.reviewModerationHistory.create.mock.calls[0]![0].data.previousText,
    ).toBe(review.publicText);
  });
  it("blocks contact data from publication", async () => {
    setReview({ publicText: "Please email me at private@example.com" });
    await expect(
      moderateReview({
        orderId: order.id,
        action: "PUBLISH",
        reason: "",
        actorEmail: "owner@example.com",
      }),
    ).rejects.toThrow();
    expect(db.customerReview.update).not.toHaveBeenCalled();
  });
  it("requires reasons for moderation other than publication", async () => {
    setReview();
    await expect(
      moderateReview({
        orderId: order.id,
        action: "REJECT",
        reason: "",
        actorEmail: "owner@example.com",
      }),
    ).rejects.toThrow();
  });
  it("public DTO contains no invitation/order/contact/credential fields", () => {
    const dto = publicReviewDTO({
      ...review,
      orderNumber: "secret",
      email: "private@example.com",
      trackingToken: "secret",
    } as typeof review);
    expect(Object.keys(dto).sort()).toEqual(
      [
        "displayName",
        "kind",
        "locale",
        "productId",
        "productName",
        "publicId",
        "rating",
        "submittedAt",
        "text",
      ].sort(),
    );
    expect(JSON.stringify(dto)).not.toMatch(
      /private@example|original privately|private-review/,
    );
  });
  it("public reads exclude hidden and test reviews", async () => {
    db.customerReview.findMany.mockResolvedValue([
      { ...review, invitation: { order } },
      {
        ...review,
        invitation: {
          order: { ...order, displayNumber: "AL-20261007-3C7477" },
        },
      },
    ]);
    expect(await getPublishedReviews()).toHaveLength(1);
    expect(db.customerReview.findMany.mock.calls[0]![0].where.status).toBe(
      "PUBLISHED",
    );
  });
  it("retains historical product context if a product was removed", () => {
    expect(
      publicReviewDTO({
        ...review,
        productId: null,
        kind: "PRODUCT",
        productNameSnapshot: "Historical purchased model",
      }).productName,
    ).toBe("Historical purchased model");
  });
  it("recognizes private contact data without suppressing ordinary prose", () => {
    for (const text of [
      "me@example.com",
      "+372 555 12345",
      "@privatehandle",
      "AL-20261015-3D0AA1",
    ])
      expect(containsContactData(text)).toBe(true);
    expect(containsContactData("The fit and communication were good.")).toBe(
      false,
    );
  });
});

describe("localized public surfaces and schema", () => {
  it("calculates real aggregates including low ratings and no zero-review score", () => {
    expect(reviewAggregate([])).toMatchObject({ average: null, count: 0 });
    expect(
      reviewAggregate([{ rating: 1 }, { rating: 5 }, { rating: 3 }]),
    ).toEqual({ average: 3, count: 3, distribution: [1, 0, 1, 0, 1] });
  });
  it("only adds product schema for visible product reviews", () => {
    expect(productReviewSchema([publicReviewDTO(review)])).toEqual({});
    const schema = productReviewSchema([
      publicReviewDTO({ ...review, kind: "PRODUCT", productId: "product-1" }),
    ]);
    expect(schema.aggregateRating?.reviewCount).toBe(1);
    expect(
      JSON.parse(JSON.stringify(schema)).review[0].reviewRating.ratingValue,
    ).toBe(4);
  });
  it.each(["et", "ru", "en"] as const)(
    "renders localized cards and request copy in %s",
    (locale) => {
      const dto = publicReviewDTO(review);
      const html = renderToStaticMarkup(
        createElement(ReviewCards, { reviews: [dto], locale }),
      );
      expect(html).toContain(reviewCopy[locale].verified);
      expect(html).not.toContain(order.displayNumber);
      const message = reviewRequestMessage(
        locale,
        "https://www.andrelook.store/review/safe",
      );
      expect(message).toContain("/review/safe");
      expect(message).not.toMatch(/5-star|5 звёзд|viis tärni/);
    },
  );
  it("does not fabricate empty homepage/PDP ratings", () => {
    expect(
      renderToStaticMarkup(
        createElement(ReviewsSummary, { reviews: [], locale: "et" }),
      ),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        createElement(ProductReviews, { reviews: [], locale: "et" }),
      ),
    ).toBe("");
  });
  it("safely renders text rather than HTML", () => {
    const dto = { ...publicReviewDTO(review), text: "<script>bad()</script>" };
    const html = renderToStaticMarkup(
      createElement(ReviewCards, { reviews: [dto], locale: "en" }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("rate limits by address and token and stores hashed buckets only", async () => {
    expect(await consumeReviewAttempt("private-ip", token, "submit")).toBe(
      true,
    );
    db.reviewRateLimit.upsert.mockResolvedValue({ attempts: 100 });
    expect(await consumeReviewAttempt("private-ip", token, "submit")).toBe(
      false,
    );
    expect(JSON.stringify(db.reviewRateLimit.upsert.mock.calls)).not.toContain(
      "private-ip",
    );
    expect(JSON.stringify(db.reviewRateLimit.upsert.mock.calls)).not.toContain(
      token,
    );
  });
});

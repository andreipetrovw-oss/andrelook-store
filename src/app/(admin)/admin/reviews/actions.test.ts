import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  ensure: vi.fn(),
  moderate: vi.fn(),
  transaction: vi.fn(),
  order: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({ requireOwner: mocks.owner }));
vi.mock("@/lib/reviews/service", () => ({
  ensureReviewInvitation: mocks.ensure,
  moderateReview: mocks.moderate,
}));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    $transaction: mocks.transaction,
    order: { findUniqueOrThrow: mocks.order },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import {
  copyReviewRequest,
  moderateOrderReview,
  revokeReviewInvitation,
  rotateReviewInvitation,
} from "./actions";
beforeEach(() => vi.clearAllMocks());
it("authorizes every owner action before reading or changing review data", async () => {
  mocks.owner.mockRejectedValue(new Error("forbidden"));
  for (const action of [
    () => copyReviewRequest("private-order"),
    () => moderateOrderReview(new FormData()),
    () => revokeReviewInvitation(new FormData()),
    () => rotateReviewInvitation(new FormData()),
  ])
    await expect(action()).rejects.toThrow("forbidden");
  expect(mocks.ensure).not.toHaveBeenCalled();
  expect(mocks.moderate).not.toHaveBeenCalled();
  expect(mocks.transaction).not.toHaveBeenCalled();
});
it("passes authenticated identity to the audited moderator", async () => {
  mocks.owner.mockResolvedValue({ email: "owner@example.com" });
  const form = new FormData();
  form.set("orderId", "order-1");
  form.set("action", "PUBLISH");
  form.set("reason", "");
  await moderateOrderReview(form);
  expect(mocks.moderate).toHaveBeenCalledWith({
    orderId: "order-1",
    action: "PUBLISH",
    reason: "",
    actorEmail: "owner@example.com",
  });
  expect(mocks.revalidate).toHaveBeenCalledWith(
    "/(localized)/[locale]",
    "layout",
  );
  expect(mocks.revalidate).toHaveBeenCalledWith(
    "/(localized)/[locale]/catalog/[categorySlug]/[productSlug]",
    "page",
  );
});

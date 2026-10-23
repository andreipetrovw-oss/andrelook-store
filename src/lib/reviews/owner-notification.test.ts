import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ send: vi.fn(), config: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("@/lib/env", () => ({ getServerConfig: mocks.config }));
vi.mock("./urls", () => ({
  reviewSiteUrl: () => new URL("https://staging.example"),
}));
import { notifyReviewOwner, ownerReviewMessage } from "./owner-notification";
const review = {
  id: "review-1",
  orderId: "order-1",
  orderNumber: "AL-REAL",
  displayName: "Henri K.",
  rating: 4,
  text: "Helpful and friendly service.",
  locale: "ET",
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VERCEL_ENV", "production");
  mocks.config.mockReturnValue({
    resendApiKey: "secret",
    orderNotificationFrom: "orders@andrelook.store",
    orderNotificationTo: "info.andrelook@gmail.com",
    siteUrl: new URL("https://www.andrelook.store"),
    crmUrl: new URL("https://crm.andrelook.store"),
  });
  mocks.send.mockResolvedValue({ data: { id: "sent" }, error: null });
});
describe("owner review email", () => {
  it("uses existing owner settings and deterministic provider idempotency", async () => {
    expect(await notifyReviewOwner(review)).toBe("sent");
    const [message, options] = mocks.send.mock.calls[0]!;
    expect(message.to).toEqual(["info.andrelook@gmail.com"]);
    expect(message.subject).toBe("New verified review received — Andrelook");
    expect(message.text).toContain(
      "https://crm.andrelook.store/admin/orders/order-1",
    );
    expect(options.idempotencyKey).toBe("andrelook-review-review-1");
    expect(JSON.stringify(message)).not.toMatch(
      /secret|token|payment|address/i,
    );
  });
  it("never exposes contact details from free-text preview", () => {
    const message = ownerReviewMessage(
      { ...review, text: "Please contact private@example.com" },
      new URL("https://crm.andrelook.store"),
    );
    expect(message).not.toContain("private@example.com");
  });
  it("isolates provider failures and never logs raw errors", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.send.mockRejectedValueOnce(new Error("private token raw payload"));
    expect(await notifyReviewOwner(review)).toBe("failed");
    expect(JSON.stringify(log.mock.calls)).not.toContain("raw payload");
    log.mockRestore();
  });
  it("does not send on arbitrary preview environments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_ID", "unrelated-project");
    expect(await notifyReviewOwner(review)).toBe("disabled");
    expect(mocks.send).not.toHaveBeenCalled();
  });
});

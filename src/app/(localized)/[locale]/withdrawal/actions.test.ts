import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  consume: vi.fn(),
  headers: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/legal/withdrawal", () => ({
  createWithdrawalRequest: mocks.create,
  consumeWithdrawalAttempt: mocks.consume,
}));
import { submitWithdrawal } from "./actions";

function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    consumerName: "Test Person",
    confirmationEmail: "test@example.com",
    orderReference: "Unmatched purchase",
    locale: "en",
    requestKey: "11111111-1111-4111-8111-111111111111",
    statementConfirmed: "accepted",
  }))
    data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("VERCEL_PROJECT_ID", "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH");
  mocks.headers.mockResolvedValue(
    new Headers({
      host: "www.andrelook.store",
      origin: "https://www.andrelook.store",
      "x-forwarded-for": "203.0.113.4",
    }),
  );
  mocks.consume.mockResolvedValue(true);
  mocks.create.mockResolvedValue({
    confirmationStatus: "SENT",
    ownerEmailStatus: "SENT",
    publicId: "public-id",
    submittedAt: new Date("2026-10-28T01:00:00Z"),
  });
});
afterEach(() => vi.unstubAllEnvs());
describe("public withdrawal action", () => {
  it("returns only receipt data, not customer or order records", async () => {
    const result = await submitWithdrawal({ status: "idle" }, form());
    expect(result).toEqual({
      status: "success",
      notificationIssue: false,
      publicId: "public-id",
      submittedAt: "2026-10-28T01:00:00.000Z",
    });
    expect(JSON.stringify(result)).not.toMatch(/test@example|Person|Unmatched/);
  });
  it("does not write for invalid or oversized fields", async () => {
    const data = form();
    data.set("consumerName", "x".repeat(1001));
    expect((await submitWithdrawal({ status: "idle" }, data)).status).toBe(
      "error",
    );
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects duplicate fields and file uploads", async () => {
    const data = form();
    data.append("consumerName", "Another");
    expect((await submitWithdrawal({ status: "idle" }, data)).status).toBe(
      "error",
    );
    const file = form();
    file.set("consumerName", new Blob(["test"]));
    expect((await submitWithdrawal({ status: "idle" }, file)).status).toBe(
      "error",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });
  for (const origin of ["https://evil.test", ""])
    it(`rejects unsafe origin: ${origin || "missing"}`, async () => {
      mocks.headers.mockResolvedValue(
        new Headers({
          host: "www.andrelook.store",
          ...(origin ? { origin } : {}),
        }),
      );
      expect((await submitWithdrawal({ status: "idle" }, form())).status).toBe(
        "error",
      );
      expect(mocks.create).not.toHaveBeenCalled();
    });
  it("fails safely for rate limiting and database/provider failures", async () => {
    mocks.consume.mockResolvedValueOnce(false);
    expect((await submitWithdrawal({ status: "idle" }, form())).status).toBe(
      "error",
    );
    expect(mocks.create).not.toHaveBeenCalled();
    mocks.consume.mockRejectedValueOnce(new Error("credential=do-not-expose"));
    expect(await submitWithdrawal({ status: "idle" }, form())).toEqual({
      status: "error",
    });
  });
  it("reports recorded receipt despite email failure, permitting idempotent acknowledgement retry", async () => {
    mocks.create.mockResolvedValueOnce({
      confirmationStatus: "FAILED",
      ownerEmailStatus: "SENT",
      publicId: "receipt",
      submittedAt: new Date(),
    });
    expect(await submitWithdrawal({ status: "idle" }, form())).toMatchObject({
      status: "success",
      notificationIssue: true,
    });
  });
});

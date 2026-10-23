import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const db = vi.hoisted(() => ({
  order: { findUnique: vi.fn() },
  withdrawalRateLimit: { upsert: vi.fn() },
  withdrawalRequest: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
}));
const send = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ getPrisma: () => db }));
vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({
    orderNotificationFrom: "Andrelook <orders@andrelook.store>",
    resendApiKey: "server-secret-not-for-output",
  }),
}));
vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send } };
  }),
}));

import {
  consumeWithdrawalAttempt,
  createWithdrawalRequest,
} from "./withdrawal";

const submittedAt = new Date("2026-10-23T09:30:00.000Z");
const request = {
  confirmationEmail: "customer@example.com",
  consumerName: "Customer Name",
  locale: "en" as const,
  orderReference: "al-real-1",
  requestKey: "11111111-1111-4111-8111-111111111111",
};

describe("online withdrawal declarations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.order.findUnique.mockResolvedValue({ id: "order-1" });
    db.withdrawalRequest.create.mockResolvedValue({ id: "withdrawal-1" });
    db.withdrawalRequest.findUniqueOrThrow.mockResolvedValue({
      confirmationEmail: "customer@example.com",
      confirmationStatus: "PENDING",
      consumerName: "Customer Name",
      id: "withdrawal-1",
      locale: "EN",
      orderReference: "AL-REAL-1",
      policyVersion: "andrelook-legal-2026-10-v1",
      publicId: "public-reference",
      statementText:
        "I hereby give notice that I withdraw from the distance sales contract identified above.",
      submittedAt,
    });
    db.withdrawalRequest.update.mockImplementation(({ data }) =>
      Promise.resolve({
        confirmationStatus: data.confirmationStatus,
        publicId: "public-reference",
        submittedAt,
      }),
    );
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("stores the declaration, links a matching order and sends an immediate confirmation", async () => {
    await expect(createWithdrawalRequest(request)).resolves.toEqual({
      confirmationStatus: "SENT",
      publicId: "public-reference",
      submittedAt,
    });
    expect(db.withdrawalRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        confirmationEmail: "customer@example.com",
        locale: "EN",
        orderId: "order-1",
        orderReference: "AL-REAL-1",
        policyVersion: "andrelook-legal-2026-10-v1",
        requestKey: request.requestKey,
      }),
    });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]![1]).toEqual({
      idempotencyKey: "andrelook-withdrawal-public-reference",
    });
    expect(JSON.stringify(send.mock.calls[0])).not.toContain(
      "server-secret-not-for-output",
    );
  });

  it("records an unmatched declaration without disclosing whether the order matched", async () => {
    db.order.findUnique.mockResolvedValue(null);
    const result = await createWithdrawalRequest({
      ...request,
      orderReference: "unknown-reference",
    });
    expect(result).toEqual({
      confirmationStatus: "SENT",
      publicId: "public-reference",
      submittedAt,
    });
    expect(db.withdrawalRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: null,
        orderReference: "UNKNOWN-REFERENCE",
      }),
    });
  });

  it("rate-limits hashed buckets without storing raw lookup data", async () => {
    db.withdrawalRateLimit.upsert
      .mockResolvedValueOnce({ attempts: 1 })
      .mockResolvedValueOnce({ attempts: 6 });
    await expect(
      consumeWithdrawalAttempt("203.0.113.5", request),
    ).resolves.toBe(false);
    for (const call of db.withdrawalRateLimit.upsert.mock.calls) {
      const keyHash = call[0].where.keyHash as string;
      expect(keyHash).toMatch(/^[a-f0-9]{64}$/);
      expect(keyHash).not.toContain("203.0.113.5");
      expect(keyHash).not.toContain("customer@example.com");
      expect(keyHash).not.toContain("AL-REAL-1");
    }
  });
});

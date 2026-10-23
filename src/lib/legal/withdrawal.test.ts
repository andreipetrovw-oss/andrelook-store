import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const db = vi.hoisted(() => ({
  reviewRateLimit: { upsert: vi.fn() },
  withdrawalRequest: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}));
const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ getPrisma: () => db }));
vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({
    orderNotificationFrom: "Andrelook <orders@andrelook.store>",
    orderNotificationTo: "info.andrelook@gmail.com",
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
const input = {
  confirmationEmail: "customer@example.com",
  consumerName: "Customer Name",
  locale: "en" as const,
  orderReference: "al-real-1",
  requestKey: "11111111-1111-4111-8111-111111111111",
};
const saved = {
  confirmationEmail: "customer@example.com",
  consumerName: "Customer Name",
  customerEmailStatus: "PENDING",
  id: "withdrawal-1",
  locale: "EN",
  orderReference: "al-real-1",
  ownerEmailStatus: "PENDING",
  publicId: "public-reference",
  statementText: "I withdraw from the contract.",
  submittedAt,
};

describe("minimal online withdrawal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let current = { ...saved };
    db.withdrawalRequest.create.mockResolvedValue(saved);
    db.withdrawalRequest.update.mockImplementation(({ data }) => {
      current = { ...current, ...data };
      return Promise.resolve(current);
    });
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("records a declaration independently of order matching and emails owner and customer", async () => {
    const result = await createWithdrawalRequest(input);
    expect(result).toMatchObject({
      confirmationStatus: "SENT",
      ownerEmailStatus: "SENT",
      publicId: "public-reference",
    });
    expect(db.withdrawalRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderReference: "al-real-1",
        requestKey: input.requestKey,
      }),
    });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls.map((call) => call[0].to)).toEqual([
      ["info.andrelook@gmail.com"],
      ["customer@example.com"],
    ]);
    expect(send.mock.calls[0]![1].idempotencyKey).not.toBe(
      send.mock.calls[1]![1].idempotencyKey,
    );
    expect(JSON.stringify(send.mock.calls)).not.toContain(
      "server-secret-not-for-output",
    );
  });

  it("keeps the declaration when an email fails and records delivery failure", async () => {
    send.mockRejectedValueOnce(new Error("provider unavailable"));
    const result = await createWithdrawalRequest(input);
    expect(result).toMatchObject({
      ownerEmailStatus: "FAILED",
      confirmationStatus: "SENT",
    });
    expect(db.withdrawalRequest.create).toHaveBeenCalledOnce();
  });

  it("replays the same declaration without resending successful notifications", async () => {
    db.withdrawalRequest.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("duplicate request key", {
        code: "P2002",
        clientVersion: "6.12.0",
      }),
    );
    db.withdrawalRequest.findUnique.mockResolvedValueOnce({
      ...saved,
      customerEmailStatus: "SENT",
      ownerEmailStatus: "SENT",
    });
    const result = await createWithdrawalRequest(input);
    expect(result).toMatchObject({
      confirmationStatus: "SENT",
      ownerEmailStatus: "SENT",
    });
    expect(send).not.toHaveBeenCalled();
    expect(db.withdrawalRequest.update).not.toHaveBeenCalled();
  });

  it("rate limits with the existing hashed persistent bucket", async () => {
    db.reviewRateLimit.upsert.mockResolvedValue({ attempts: 11 });
    expect(await consumeWithdrawalAttempt("203.0.113.5")).toBe(false);
    const keyHash = db.reviewRateLimit.upsert.mock.calls[0]![0].where.keyHash;
    expect(keyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(keyHash).not.toContain("203.0.113.5");
  });
});

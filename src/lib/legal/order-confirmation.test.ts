import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  order: { findUniqueOrThrow: vi.fn() },
  orderLegalAcceptance: { updateMany: vi.fn() },
}));
const createAcceptance = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ getPrisma: () => db }));
vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({
    orderNotificationFrom: null,
    resendApiKey: null,
    siteUrl: new URL("https://www.andrelook.store"),
  }),
}));
vi.mock("resend", () => ({ Resend: vi.fn() }));

import { documentPreorderConfirmation } from "./order-confirmation";

describe("owner-documented preorder confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.order.findUniqueOrThrow.mockResolvedValue({
      currency: "EUR",
      customer: { email: null, name: "Real customer" },
      displayNumber: "AL-REAL-ORDER",
      etaDate: null,
      etaText: "2–3 weeks",
      id: "order-1",
      items: [
        {
          availabilityTypeSnapshot: "PRE_ORDER",
          colorSnapshot: "Black",
          product: {
            sizeChart: {
              chartData: { rows: [{ size: "M", width: "52" }] },
              isPublished: true,
              reviewStatus: "APPROVED",
              units: "cm",
            },
          },
          productInternalCodeSnapshot: "AL-001",
          productNameSnapshot: "Jacket",
          quantity: 1,
          sizeHelpRequested: false,
          sizeSnapshot: "M",
          unitPriceMinor: 21900,
        },
      ],
      requestedLocale: "EN",
    });
    db.$transaction.mockImplementation(async (callback) =>
      callback({
        orderLegalAcceptance: {
          create: createAcceptance,
        },
      }),
    );
    createAcceptance.mockResolvedValue({ id: "acceptance-1" });
  });

  it("writes an append-only snapshot only after the owner records real evidence", async () => {
    const acceptedAt = new Date("2026-10-23T08:00:00.000Z");
    await expect(
      documentPreorderConfirmation({
        acceptedAt,
        adminId: "admin-1",
        evidenceNote: "Customer confirmed in Telegram on 23 October.",
        orderId: "order-1",
        sendEmail: false,
        source: "CUSTOMER_MESSAGE",
      }),
    ).resolves.toEqual(["acceptance-1"]);

    expect(createAcceptance).toHaveBeenCalledWith({
      data: expect.objectContaining({
        acceptedAt,
        colorSnapshot: "Black",
        confirmationStatus: "SKIPPED",
        createdByAdminId: "admin-1",
        evidenceNote: "Customer confirmed in Telegram on 23 October.",
        kind: "PREORDER_CONFIRMED",
        orderId: "order-1",
        policyVersion: "andrelook-legal-2026-10-v1",
        productInternalCodeSnapshot: "AL-001",
        productNameSnapshot: "Jacket",
        sizeGuideAvailable: true,
        sizeGuideVersion: expect.stringMatching(/^[a-f0-9]{64}$/),
        sizeSnapshot: "M",
        source: "CUSTOMER_MESSAGE",
        unitPriceMinorSnapshot: 21900,
      }),
      select: { id: true },
    });
  });

  it("refuses to claim email delivery when the customer has no email", async () => {
    await expect(
      documentPreorderConfirmation({
        acceptedAt: new Date(),
        adminId: "admin-1",
        evidenceNote: "Customer confirmation evidence.",
        orderId: "order-1",
        sendEmail: true,
        source: "OWNER_DOCUMENTED",
      }),
    ).rejects.toThrow("Customer email is required");
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

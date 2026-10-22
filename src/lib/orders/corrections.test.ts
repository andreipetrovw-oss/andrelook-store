import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  correctionCreate: vi.fn(),
  correctionFind: vi.fn(),
  eventUpdateMany: vi.fn(),
  eventUpsert: vi.fn(),
  itemFind: vi.fn(),
  itemUpdate: vi.fn(),
  orderFind: vi.fn(),
  orderUpdate: vi.fn(),
  paymentFind: vi.fn(),
  paymentCreate: vi.fn(),
  paymentUnique: vi.fn(),
  paymentUpdate: vi.fn(),
  productFind: vi.fn(),
}));

const tx = {
  order: {
    findUniqueOrThrow: mocks.orderFind,
    update: mocks.orderUpdate,
  },
  orderBusinessEvent: {
    updateMany: mocks.eventUpdateMany,
    upsert: mocks.eventUpsert,
  },
  orderCorrectionHistory: {
    create: mocks.correctionCreate,
    findFirst: mocks.correctionFind,
  },
  orderItem: {
    findFirstOrThrow: mocks.itemFind,
    update: mocks.itemUpdate,
  },
  payment: {
    create: mocks.paymentCreate,
    findUniqueOrThrow: mocks.paymentUnique,
    findFirstOrThrow: mocks.paymentFind,
    update: mocks.paymentUpdate,
  },
  product: { findUniqueOrThrow: mocks.productFind },
};

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
  }),
}));

import {
  addPaymentRecord,
  correctAgreedPrice,
  correctOrderDetails,
  correctOrderItem,
  editPaymentRecord,
  voidPaymentRecord,
} from "./corrections";

const financialOrder = {
  agreedTotalMinor: null,
  confirmedTotalMinor: 20_000,
  currency: "EUR",
  items: [{ quantity: 1, unitPriceMinor: 20_000 }],
  paymentPreference: "FULL_ADVANCE",
  payments: [],
  status: "CONFIRMED",
};

describe("owner order corrections", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.correctionFind.mockResolvedValue(null);
    mocks.paymentCreate.mockImplementation(async ({ data }) => ({
      id: "payment-new",
      ...data,
    }));
    mocks.correctionCreate.mockResolvedValue({});
    mocks.eventUpdateMany.mockResolvedValue({ count: 0 });
    mocks.eventUpsert.mockResolvedValue({});
    mocks.itemUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.paymentUpdate.mockResolvedValue({});
  });

  it("edits confirmed order details without touching shipment links", async () => {
    mocks.orderFind.mockResolvedValue({
      customerNotes: null,
      deliveryMode: "PERSONAL_HANDOVER",
      fulfilmentMethod: "PERSONAL_HANDOVER",
      internalNotes: "old",
      shipmentLinks: [{ id: "link-1" }],
      status: "CONFIRMED",
    });

    await expect(
      correctOrderDetails({
        actorId: "owner",
        customerNotes: "call first",
        deliveryMode: "ESTONIA_DELIVERY",
        fulfilmentMethod: "DELIVERY",
        internalNotes: "new",
        orderId: "order-1",
      }),
    ).resolves.toEqual({ shipmentLinked: true });

    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      data: {
        customerNotes: "call first",
        deliveryMode: "ESTONIA_DELIVERY",
        fulfilmentMethod: "DELIVERY",
        internalNotes: "new",
      },
      where: { id: "order-1" },
    });
    expect(JSON.stringify(mocks.orderUpdate.mock.calls)).not.toMatch(
      /shipment|tracking|publicTrackingToken/,
    );
    expect(mocks.correctionCreate).toHaveBeenCalledTimes(4);
  });

  it("corrects an item snapshot and writes field-level audit rows", async () => {
    mocks.itemFind.mockResolvedValue({
      colorSnapshot: "black",
      measurementsNote: null,
      order: { shipmentLinks: [{ id: "link-1" }], status: "READY" },
      productId: "product-old",
      productNameSnapshot: "Old model",
      quantity: 1,
      sizeSnapshot: "S",
    });
    mocks.productFind.mockResolvedValue({
      availabilityType: "PRE_ORDER",
      internalCode: "AL-NEW",
      slug: "new-model",
    });

    await correctOrderItem({
      actorId: "owner",
      color: "navy",
      itemId: "item-1",
      measurementsNote: "owner verified",
      orderId: "order-1",
      productId: "product-new",
      productName: "New model",
      quantity: 2,
      size: "M",
    });

    expect(mocks.itemUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          colorSnapshot: "navy",
          productId: "product-new",
          quantity: 2,
          sizeSnapshot: "M",
        }),
      }),
    );
    expect(mocks.correctionCreate).toHaveBeenCalledTimes(6);
  });

  it("requires explicit acknowledgement before changing a paid order price", async () => {
    mocks.orderFind.mockResolvedValueOnce({
      agreedTotalMinor: null,
      confirmedTotalMinor: 20_000,
      items: [{ quantity: 1, unitPriceMinor: 20_000 }],
      payments: [{ id: "payment-1" }],
      status: "CONFIRMED",
    });

    await expect(
      correctAgreedPrice({
        actorId: "owner",
        agreedTotalMinor: 18_000,
        existingPaymentsAcknowledged: false,
        orderId: "order-1",
      }),
    ).rejects.toThrow("Confirm the price correction");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("stores an agreed price separately and recalculates only commercial state", async () => {
    mocks.orderFind
      .mockResolvedValueOnce({
        agreedTotalMinor: null,
        confirmedTotalMinor: 20_000,
        items: [{ quantity: 1, unitPriceMinor: 20_000 }],
        payments: [],
        status: "READY",
      })
      .mockResolvedValueOnce({
        ...financialOrder,
        agreedTotalMinor: 18_000,
        status: "READY",
      });

    await correctAgreedPrice({
      actorId: "owner",
      agreedTotalMinor: 18_000,
      existingPaymentsAcknowledged: false,
      orderId: "order-1",
    });

    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      data: { agreedTotalMinor: 18_000 },
      where: { id: "order-1" },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.eventUpdateMany).toHaveBeenCalledWith({
      data: { isActive: false },
      where: { eventKey: "paid:order-1", isActive: true },
    });
  });

  it("changes and removes agreed price while preserving the original snapshot", async () => {
    mocks.orderFind
      .mockResolvedValueOnce({
        agreedTotalMinor: 18_000,
        confirmedTotalMinor: 20_000,
        items: [{ quantity: 1, unitPriceMinor: 20_000 }],
        payments: [],
        status: "CONFIRMED",
      })
      .mockResolvedValueOnce({ ...financialOrder, agreedTotalMinor: 17_500 })
      .mockResolvedValueOnce({
        agreedTotalMinor: 17_500,
        confirmedTotalMinor: 20_000,
        items: [{ quantity: 1, unitPriceMinor: 20_000 }],
        payments: [],
        status: "CONFIRMED",
      })
      .mockResolvedValueOnce({ ...financialOrder, agreedTotalMinor: null });

    await correctAgreedPrice({
      actorId: "owner",
      agreedTotalMinor: 17_500,
      existingPaymentsAcknowledged: false,
      orderId: "order-1",
    });
    await correctAgreedPrice({
      actorId: "owner",
      agreedTotalMinor: null,
      existingPaymentsAcknowledged: false,
      orderId: "order-1",
    });

    expect(mocks.orderUpdate).toHaveBeenNthCalledWith(1, {
      data: { agreedTotalMinor: 17_500 },
      where: { id: "order-1" },
    });
    expect(mocks.orderUpdate).toHaveBeenNthCalledWith(3, {
      data: { agreedTotalMinor: null },
      where: { id: "order-1" },
    });
    expect(
      mocks.correctionCreate.mock.calls.some(
        ([call]) =>
          call.data.changedField === "effective_total" &&
          call.data.newValue === 20_000,
      ),
    ).toBe(true);
  });

  it("edits and voids payments without deleting the ledger row", async () => {
    mocks.paymentFind
      .mockResolvedValueOnce({
        amountMinor: 5_000,
        currency: "EUR",
        kind: "DEPOSIT",
        order: { status: "CONFIRMED" },
        processorFeeMinor: null,
        reference: null,
      })
      .mockResolvedValueOnce({
        amountMinor: 5_500,
        order: { status: "CONFIRMED" },
        status: "ACTIVE",
      });
    mocks.orderFind.mockResolvedValue(financialOrder);

    await editPaymentRecord({
      actorId: "owner",
      amountMinor: 5_500,
      currency: "EUR",
      kind: "DEPOSIT",
      orderId: "order-1",
      paymentId: "payment-1",
      processorFeeMinor: 50,
      reference: "corrected",
    });
    await voidPaymentRecord({
      actorId: "owner",
      orderId: "order-1",
      paymentId: "payment-1",
      reason: "Duplicate bank entry",
    });

    expect(mocks.paymentUpdate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "VOIDED",
        voidReason: "Duplicate bank entry",
        voidedByAdminId: "owner",
      }),
      where: { id: "payment-1" },
    });
    expect(JSON.stringify(mocks.paymentUpdate.mock.calls)).not.toContain(
      "delete",
    );
    expect(mocks.correctionCreate).toHaveBeenCalled();
  });

  it("keeps paid revenue active when a logistics-stage order is fully paid", async () => {
    mocks.paymentFind.mockResolvedValue({
      amountMinor: 20_000,
      currency: "EUR",
      kind: "FULL",
      order: { status: "IN_TRANSIT" },
      processorFeeMinor: null,
      reference: null,
    });
    mocks.orderFind.mockResolvedValue({
      ...financialOrder,
      payments: [],
      status: "IN_TRANSIT",
    });
    mocks.orderFind
      .mockResolvedValueOnce({ ...financialOrder, status: "IN_TRANSIT" })
      .mockResolvedValue({
        ...financialOrder,
        status: "IN_TRANSIT",
        payments: [{ amountMinor: 20_000, kind: "FULL", status: "ACTIVE" }],
      });

    await editPaymentRecord({
      actorId: "owner",
      amountMinor: 20_000,
      currency: "EUR",
      kind: "FULL",
      orderId: "order-1",
      paymentId: "payment-1",
      processorFeeMinor: null,
      reference: null,
    });

    expect(mocks.eventUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ isActive: true }),
      }),
    );
    expect(mocks.orderUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: expect.anything() }),
      }),
    );
  });
});

const paymentInput = {
  actorId: "owner",
  amountMinor: 14_900,
  currency: "EUR",
  kind: "BALANCE" as const,
  orderId: "delivered-order",
  processorFeeMinor: null,
  reference: null,
  requestKey: "d7d589ce-374d-4bed-a698-0b31b2b2bf6b",
};
const delivered = {
  ...financialOrder,
  status: "DELIVERED",
  confirmedTotalMinor: 21_900,
  items: [{ quantity: 1, unitPriceMinor: 21_900 }],
  payments: [
    { amountMinor: 7_000, currency: "EUR", kind: "DEPOSIT", status: "ACTIVE" },
  ],
};

describe("delivered-order financial operations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.correctionFind.mockResolvedValue(null);
    mocks.paymentCreate.mockImplementation(async ({ data }) => ({
      id: "payment-new",
      ...data,
    }));
    mocks.correctionCreate.mockResolvedValue({});
    mocks.orderFind.mockResolvedValue(delivered);
    mocks.paymentFind.mockResolvedValue({
      amountMinor: 7_000,
      currency: "EUR",
      kind: "DEPOSIT",
      processorFeeMinor: null,
      reference: null,
      status: "ACTIVE",
      order: { status: "DELIVERED" },
    });
  });

  it.each([
    { kind: "BALANCE" as const, amount: 14_900, before: delivered.payments },
    { kind: "DEPOSIT" as const, amount: 5_000, before: [] },
    { kind: "FULL" as const, amount: 21_900, before: [] },
  ])(
    "records $kind without writing fulfilment, tracking, history or invitations",
    async ({ kind, amount, before }) => {
      mocks.orderFind
        .mockResolvedValueOnce({ ...delivered, payments: before })
        .mockResolvedValue({
          ...delivered,
          payments: [
            ...before,
            { amountMinor: amount, currency: "EUR", kind, status: "ACTIVE" },
          ],
        });
      await addPaymentRecord({ ...paymentInput, kind, amountMinor: amount });
      expect(mocks.paymentCreate).toHaveBeenCalledTimes(1);
      expect(mocks.orderUpdate).not.toHaveBeenCalled();
      expect(mocks.itemUpdate).not.toHaveBeenCalled();
      expect(mocks.correctionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            changedField: `payment_request.${paymentInput.requestKey}`,
            newValue: "payment-new",
          }),
        }),
      );
      if (kind !== "DEPOSIT")
        expect(mocks.eventUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({
              amountMinor: 21_900,
              eventKey: "paid:delivered-order",
            }),
          }),
        );
    },
  );

  it("retries the same request without adding payment, audit or revenue twice", async () => {
    mocks.correctionFind.mockResolvedValue({ newValue: "payment-existing" });
    mocks.paymentUnique.mockResolvedValue({
      id: "payment-existing",
      ...paymentInput,
    });
    await addPaymentRecord(paymentInput);
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
    expect(mocks.correctionCreate).not.toHaveBeenCalled();
    expect(mocks.eventUpsert).not.toHaveBeenCalled();
  });

  it("rejects reused idempotency keys with changed amounts", async () => {
    mocks.correctionFind.mockResolvedValue({ newValue: "payment-existing" });
    mocks.paymentUnique.mockResolvedValue({
      ...paymentInput,
      amountMinor: 100,
    });
    await expect(addPaymentRecord(paymentInput)).rejects.toThrow(
      "already used",
    );
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it.each([0, -1, 0.5, 14_901])(
    "rejects invalid amount or overpayment %s",
    async (amountMinor) => {
      await expect(
        addPaymentRecord({ ...paymentInput, amountMinor }),
      ).rejects.toThrow();
      expect(mocks.paymentCreate).not.toHaveBeenCalled();
    },
  );

  it("rejects currency mismatch", async () => {
    await expect(
      addPaymentRecord({ ...paymentInput, currency: "USD" }),
    ).rejects.toThrow("currency");
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("uses agreed price for balance protection", async () => {
    mocks.orderFind.mockResolvedValue({
      ...delivered,
      agreedTotalMinor: 20_000,
    });
    await expect(addPaymentRecord(paymentInput)).rejects.toThrow("balance");
    await addPaymentRecord({ ...paymentInput, amountMinor: 13_000 });
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("corrects a payment excluding its old amount from the available balance", async () => {
    mocks.orderFind
      .mockResolvedValueOnce({ ...delivered, payments: [] })
      .mockResolvedValue({
        ...delivered,
        payments: [{ amountMinor: 21_900, kind: "FULL", status: "ACTIVE" }],
      });
    await editPaymentRecord({
      ...paymentInput,
      paymentId: "deposit",
      amountMinor: 21_900,
      kind: "FULL",
    });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amountMinor: 21_900 }),
      }),
    );
    expect(mocks.orderFind).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          payments: expect.objectContaining({
            where: { status: "ACTIVE", id: { not: "deposit" } },
          }),
        }),
      }),
    );
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("voids a delivered payment, deactivates revenue and preserves delivery", async () => {
    mocks.orderFind.mockResolvedValue({ ...delivered, payments: [] });
    await voidPaymentRecord({
      actorId: "owner",
      orderId: "delivered-order",
      paymentId: "deposit",
      reason: "Owner correction",
    });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "VOIDED",
          voidReason: "Owner correction",
        }),
      }),
    );
    expect(mocks.eventUpdateMany).toHaveBeenCalledWith({
      data: { isActive: false },
      where: { eventKey: "paid:delivered-order", isActive: true },
    });
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("allows agreed-price correction after delivery without rewriting delivery state", async () => {
    mocks.orderFind
      .mockResolvedValueOnce({ ...delivered, payments: [{ id: "deposit" }] })
      .mockResolvedValue({ ...delivered, agreedTotalMinor: 22_000 });
    await correctAgreedPrice({
      actorId: "owner",
      orderId: "delivered-order",
      agreedTotalMinor: 22_000,
      existingPaymentsAcknowledged: true,
    });
    expect(mocks.orderUpdate).toHaveBeenCalledExactlyOnceWith({
      data: { agreedTotalMinor: 22_000 },
      where: { id: "delivered-order" },
    });
  });

  it("does not unlock delivered fulfilment or item editing", async () => {
    await expect(
      correctOrderDetails({
        actorId: "owner",
        orderId: "delivered-order",
        customerNotes: null,
        internalNotes: null,
        deliveryMode: "ESTONIA_DELIVERY",
        fulfilmentMethod: "DELIVERY",
      }),
    ).rejects.toThrow("not editable");
    mocks.itemFind.mockResolvedValue({ order: { status: "DELIVERED" } });
    await expect(
      correctOrderItem({
        actorId: "owner",
        orderId: "delivered-order",
        itemId: "item",
        productId: "product",
        productName: "Model",
        quantity: 1,
        color: null,
        size: null,
        measurementsNote: null,
      }),
    ).rejects.toThrow("not editable");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
    expect(mocks.itemUpdate).not.toHaveBeenCalled();
  });

  it("keeps cancelled orders financially locked", async () => {
    mocks.orderFind.mockResolvedValue({ ...delivered, status: "CANCELLED" });
    await expect(addPaymentRecord(paymentInput)).rejects.toThrow(
      "not editable",
    );
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });
});

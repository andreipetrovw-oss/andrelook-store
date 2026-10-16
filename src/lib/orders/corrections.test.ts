import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  correctionCreate: vi.fn(),
  eventUpdateMany: vi.fn(),
  eventUpsert: vi.fn(),
  itemFind: vi.fn(),
  itemUpdate: vi.fn(),
  orderFind: vi.fn(),
  orderUpdate: vi.fn(),
  paymentFind: vi.fn(),
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
  orderCorrectionHistory: { create: mocks.correctionCreate },
  orderItem: {
    findFirstOrThrow: mocks.itemFind,
    update: mocks.itemUpdate,
  },
  payment: {
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
    vi.clearAllMocks();
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
      payments: [{ amountMinor: 20_000, kind: "FULL", status: "ACTIVE" }],
      status: "IN_TRANSIT",
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

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOrderRequest: vi.fn(),
  requestOrderInput: vi.fn(),
  sendMetaLeadForOrder: vi.fn(),
  sendNewOrderNotification: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        host: "www.andrelook.store",
        referer:
          "https://www.andrelook.store/et/catalog/warm-jackets/moncler-maya-down-jacket",
      }),
    ),
}));
vi.mock("@/lib/measurement/meta-capi", () => ({
  sendMetaLeadForOrder: mocks.sendMetaLeadForOrder,
}));
vi.mock("@/lib/notifications/order-notification", () => ({
  sendNewOrderNotification: mocks.sendNewOrderNotification,
}));
vi.mock("@/lib/orders/request-schema", () => ({
  requestOrderInput: mocks.requestOrderInput,
}));
vi.mock("@/lib/orders/service", () => ({
  createOrderRequest: mocks.createOrderRequest,
  RequestRejectedError: class RequestRejectedError extends Error {
    constructor(public readonly reason: string) {
      super(reason);
    }
  },
}));

import { submitOrderRequest } from "./actions";

describe("order request measurement delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestOrderInput.mockReturnValue({
      data: { requestKey: "11111111-1111-4111-8111-111111111111" },
      success: true,
    });
    mocks.sendMetaLeadForOrder.mockResolvedValue({ status: "sent" });
    mocks.sendNewOrderNotification.mockResolvedValue({ status: "SENT" });
  });

  it("sends server Lead once after a newly persisted order", async () => {
    mocks.createOrderRequest.mockResolvedValue({
      duplicate: false,
      orderId: "order_1",
      reference: "AL-REAL-1",
    });

    await expect(
      submitOrderRequest({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ reference: "AL-REAL-1", status: "success" });
    expect(mocks.sendMetaLeadForOrder).toHaveBeenCalledOnce();
    expect(mocks.sendMetaLeadForOrder).toHaveBeenCalledWith(
      "order_1",
      "https://www.andrelook.store/et/catalog/warm-jackets/moncler-maya-down-jacket",
    );
    expect(mocks.sendNewOrderNotification).toHaveBeenCalledOnce();
  });

  it("does not repeat the server Lead for an idempotent duplicate", async () => {
    mocks.createOrderRequest.mockResolvedValue({
      duplicate: true,
      orderId: "order_1",
      reference: "AL-REAL-1",
    });

    await expect(
      submitOrderRequest({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ reference: "AL-REAL-1", status: "success" });
    expect(mocks.sendMetaLeadForOrder).not.toHaveBeenCalled();
    expect(mocks.sendNewOrderNotification).not.toHaveBeenCalled();
  });

  it("keeps the persisted order successful when CAPI delivery throws", async () => {
    mocks.createOrderRequest.mockResolvedValue({
      duplicate: false,
      orderId: "order_1",
      reference: "AL-REAL-1",
    });
    mocks.sendMetaLeadForOrder.mockRejectedValue(new Error("provider failure"));

    await expect(
      submitOrderRequest({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ reference: "AL-REAL-1", status: "success" });
    expect(mocks.sendNewOrderNotification).toHaveBeenCalledOnce();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findLinkedOrders = vi.fn();
const findOrder = vi.fn();
const updateOrder = vi.fn();
const upsertNotification = vi.fn();
const updateNotification = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: { findUnique: findOrder, update: updateOrder },
    orderShipment: { findMany: findLinkedOrders },
    trackingMilestoneNotification: {
      update: updateNotification,
      upsert: upsertNotification,
    },
  }),
}));

vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({
    orderNotificationFrom: null,
    resendApiKey: null,
    siteUrl: new URL("https://staging.example.com"),
  }),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

import { notifyLinkedOrders } from "./notifications";

describe("tracking notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findLinkedOrders.mockResolvedValue([
      { orderId: "order-a" },
      { orderId: "order-b" },
      { orderId: "order-c" },
    ]);
    findOrder.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({
        customer: { email: `${where.id}@example.com` },
        displayNumber: where.id.toUpperCase(),
        publicTrackingToken: "t".repeat(43),
        requestedLocale: "EN",
      }),
    );
    upsertNotification.mockImplementation(
      ({ create }: { create: { orderId: string } }) =>
        Promise.resolve({
          id: `notification-${create.orderId}`,
          status: "PENDING",
        }),
    );
    updateNotification.mockResolvedValue({});
  });

  it("fans one shared-shipment milestone out to three linked orders", async () => {
    await notifyLinkedOrders("master-shipment", ["HANDED_TO_LOGISTICS"]);

    expect(findLinkedOrders).toHaveBeenCalledWith({
      select: { orderId: true },
      where: { customerVisible: true, shipmentId: "master-shipment" },
    });
    expect(findOrder).toHaveBeenCalledTimes(3);
    expect(upsertNotification).toHaveBeenCalledTimes(3);
    expect(updateNotification).toHaveBeenCalledTimes(3);
  });

  it("does not notify for a non-meaningful carrier scan", async () => {
    await notifyLinkedOrders("master-shipment", ["INTERNATIONAL_TRANSIT"]);

    expect(findOrder).not.toHaveBeenCalled();
    expect(upsertNotification).not.toHaveBeenCalled();
    expect(updateNotification).not.toHaveBeenCalled();
  });
});

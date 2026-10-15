import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  afterCallbacks: [] as Array<() => Promise<void> | void>,
  ingestWebhookSnapshot: vi.fn(),
  notifyLinkedOrders: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (callback: () => Promise<void> | void) => {
      mocks.afterCallbacks.push(callback);
    },
  };
});
vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({ seventeenTrackToken: "webhook-token" }),
}));
vi.mock("@/lib/tracking/notifications", () => ({
  notifyLinkedOrders: mocks.notifyLinkedOrders,
}));
vi.mock("@/lib/tracking/service", () => ({
  ingestWebhookSnapshot: mocks.ingestWebhookSnapshot,
}));

import { POST } from "./route";

describe("17TRACK webhook acknowledgement", () => {
  beforeEach(() => {
    mocks.afterCallbacks.length = 0;
    mocks.ingestWebhookSnapshot.mockReset();
    mocks.notifyLinkedOrders.mockReset();
  });

  it("acknowledges a valid signed payload before database processing", async () => {
    const body = JSON.stringify({
      data: { number: "TEST-NUMBER" },
      event: "TRACKING_UPDATED",
    });
    const sign = createHash("sha256")
      .update(`${body}/webhook-token`, "utf8")
      .digest("hex");
    const response = await POST(
      new Request("https://example.test/api/webhooks/17track", {
        body,
        headers: { "content-type": "application/json", sign },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.ingestWebhookSnapshot).not.toHaveBeenCalled();
    expect(mocks.afterCallbacks).toHaveLength(1);

    mocks.ingestWebhookSnapshot.mockResolvedValueOnce(null);
    await mocks.afterCallbacks[0]?.();
    expect(mocks.ingestWebhookSnapshot).toHaveBeenCalledOnce();
    expect(mocks.notifyLinkedOrders).not.toHaveBeenCalled();
  });
});

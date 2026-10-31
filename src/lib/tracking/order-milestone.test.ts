import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderTrackingMilestoneKind } from "@prisma/client";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    $transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        $queryRaw: mocks.query,
        orderTrackingMilestone: { findFirst: mocks.find, create: mocks.create },
        order: { update: mocks.update },
      }),
  }),
}));
import { parseOrderMilestone, saveOrderMilestone } from "./order-milestone";

const input = {
  orderId: "synthetic-order",
  kind: "PACKING_CONFIRMED",
  evidenceSource: "OWNER_CONFIRMED",
  occurredAt: "2026-10-30T15:00",
  evidenceNote: "Поставщик подтвердил упаковку. Ожидает отправки.",
};
function form(overrides: Record<string, string | undefined> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...input, ...overrides }))
    if (value !== undefined) data.set(key, value);
  return data;
}
const now = new Date("2026-10-31T02:11:00Z");

describe("manual order milestones independent of shipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockResolvedValue([{ id: input.orderId }]);
    mocks.find.mockResolvedValue(null);
  });

  it.each(Object.values(OrderTrackingMilestoneKind))(
    "accepts the visible enum option %s",
    (kind) => {
      expect(parseOrderMilestone(form({ kind }), now).error).toBeNull();
    },
  );

  it("retains packing source and Tallinn time without any shipment/tracking identifiers", async () => {
    const parsed = parseOrderMilestone(form(), now);
    expect(parsed.data?.occurredAt.toISOString()).toBe(
      "2026-10-30T13:00:00.000Z",
    );
    if (!parsed.data) throw new Error("fixture validation failed");
    expect(await saveOrderMilestone(parsed.data, "owner-1")).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        ...input,
        occurredAt: new Date("2026-10-30T13:00:00Z"),
        createdByAdminId: "owner-1",
        customerVisible: true,
      },
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.query.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.find.mock.invocationCallOrder[0]!,
    );
    expect(mocks.query.mock.calls[0]![0].sql).toContain("FOR UPDATE");
  });

  it("returns existing evidence without duplicating or overwriting it on retry", async () => {
    mocks.find.mockResolvedValue({ id: "existing-evidence" });
    const parsed = parseOrderMilestone(form(), now);
    if (!parsed.data) throw new Error("fixture validation failed");
    expect(await saveOrderMilestone(parsed.data, "owner-1")).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([
    { evidenceNote: "  " },
    { evidenceNote: "ok" },
    { evidenceNote: "a".repeat(501) },
    { kind: "Упаковка подтверждена" },
    { kind: "FAKE_FLIGHT" },
    { evidenceSource: "PROVIDER_EVENT" },
    { occurredAt: "2026-02-31T10:00" },
    { occurredAt: "2026-10-31T04:12" },
    { orderId: "" },
  ])("returns a safe validation error with no writes: %j", (overrides) => {
    const result = parseOrderMilestone(form(overrides), now);
    expect(result.error).toBeTruthy();
    expect(result).not.toHaveProperty("data");
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("rejects duplicate fields and missing fields rather than accepting ambiguous input", () => {
    const data = form();
    data.append("kind", "INTERNATIONAL_DISPATCH_CONFIRMED");
    expect(parseOrderMilestone(data, now).error).toBeTruthy();
    data.delete("kind");
    expect(parseOrderMilestone(data, now).error).toBeTruthy();
  });

  it("fails without inserting anything for a nonexistent order", async () => {
    mocks.query.mockResolvedValue([]);
    const parsed = parseOrderMilestone(form(), now);
    if (!parsed.data) throw new Error("fixture validation failed");
    await expect(saveOrderMilestone(parsed.data, "owner")).rejects.toThrow(
      "Order unavailable",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ order: { findUnique } }),
}));

import { metaCapiAllowedForRuntime, sendMetaLeadForOrder } from "./meta-capi";

const productionRuntime = {
  accessToken: "test-token-never-log",
  datasetId: "3334309000107146",
  projectId: "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH",
  vercelEnvironment: "production",
};

const order = {
  attribution: { marketingConsent: true },
  createdAt: new Date("2026-10-10T18:00:00.000Z"),
  currency: "EUR",
  displayNumber: "AL-20261010-REAL01",
  items: [{ productId: "product_1", quantity: 1, unitPriceMinor: 25_900 }],
  requestKey: "11111111-1111-4111-8111-111111111111",
};

describe("Meta Conversions API Lead delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUnique.mockResolvedValue(order);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("allows only the approved production project, host, dataset and consent", () => {
    expect(
      metaCapiAllowedForRuntime("www.andrelook.store", true, productionRuntime),
    ).toBe(true);
    expect(
      metaCapiAllowedForRuntime(
        "www.andrelook.store",
        false,
        productionRuntime,
      ),
    ).toBe(false);
    expect(
      metaCapiAllowedForRuntime("localhost", true, productionRuntime),
    ).toBe(false);
    expect(
      metaCapiAllowedForRuntime(
        "andrelook-v1-staging.vercel.app",
        true,
        productionRuntime,
      ),
    ).toBe(false);
    expect(
      metaCapiAllowedForRuntime("www.andrelook.store", true, {
        ...productionRuntime,
        projectId: "staging-project",
      }),
    ).toBe(false);
    expect(
      metaCapiAllowedForRuntime("www.andrelook.store", true, {
        ...productionRuntime,
        vercelEnvironment: "preview",
      }),
    ).toBe(false);
  });

  it("sends one consented Lead with the persisted event ID and approved fields", async () => {
    await expect(
      sendMetaLeadForOrder(
        "order_1",
        "https://www.andrelook.store/et/catalog/warm-jackets/moncler-maya-down-jacket?fbclid=not-sent#request",
        productionRuntime,
      ),
    ).resolves.toEqual({ status: "sent" });

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "https://graph.facebook.com/v26.0/3334309000107146/events",
    );
    expect(init?.headers).toEqual({
      Authorization: "Bearer test-token-never-log",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      data: [
        {
          action_source: "website",
          custom_data: {
            content_ids: ["product_1"],
            currency: "EUR",
            value: 259,
          },
          event_id: "11111111-1111-4111-8111-111111111111",
          event_name: "Lead",
          event_source_url:
            "https://www.andrelook.store/et/catalog/warm-jackets/moncler-maya-down-jacket",
          event_time: 1791655200,
          user_data: {
            external_id: [
              "bd7662a5eeb41614e720d477abfcb2272e19a8a70a93b7e3bc8560d44ad326e9",
            ],
          },
        },
      ],
    });
    expect(String(init?.body)).not.toContain("email");
    expect(String(init?.body)).not.toContain("phone");
    expect(String(init?.body)).not.toContain("customer");
  });

  it("blocks no-consent, test-order, preview and CRM events", async () => {
    findUnique.mockResolvedValueOnce({
      ...order,
      attribution: { marketingConsent: false },
    });
    await expect(
      sendMetaLeadForOrder(
        "order_1",
        "https://www.andrelook.store/et/catalog",
        productionRuntime,
      ),
    ).resolves.toEqual({ reason: "consent", status: "skipped" });

    findUnique.mockResolvedValueOnce({
      ...order,
      displayNumber: "AL-20261007-3C7477",
    });
    await expect(
      sendMetaLeadForOrder(
        "order_test",
        "https://www.andrelook.store/et/catalog",
        productionRuntime,
      ),
    ).resolves.toEqual({ reason: "test-order", status: "skipped" });

    await expect(
      sendMetaLeadForOrder(
        "order_preview",
        "https://andrelook-v1-staging.vercel.app/et/catalog",
        productionRuntime,
      ),
    ).resolves.toEqual({ reason: "invalid-source", status: "skipped" });
    await expect(
      sendMetaLeadForOrder(
        "order_admin",
        "https://www.andrelook.store/admin/orders/order_1",
        productionRuntime,
      ),
    ).resolves.toEqual({ reason: "invalid-source", status: "skipped" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns only a generic failure classification", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await sendMetaLeadForOrder(
      "order_1",
      "https://www.andrelook.store/et/catalog",
      productionRuntime,
    );
    expect(result).toEqual({ reason: "provider", status: "failed" });
    expect(JSON.stringify(result)).not.toContain(productionRuntime.accessToken);
  });
});

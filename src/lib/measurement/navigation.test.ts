import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("measures actual navigation once and never repeats product views on re-consent", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEASUREMENT_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_GA4_MEASUREMENT_ID", "G-0NLE5DGQN2");
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "3334309000107146");
  const scripts: Array<{ dataset: Record<string, string>; src: string }> = [];
  const w = {
    location: {
      hostname: "www.andrelook.store",
      pathname: "/et/catalog/a",
      search: "",
    },
    dataLayer: [] as unknown[][],
    fbq: undefined as undefined | { queue: unknown[][] },
  };
  vi.stubGlobal("window", w);
  vi.stubGlobal("document", {
    createElement: () => ({ dataset: {}, src: "" }),
    head: { append: (s: (typeof scripts)[number]) => scripts.push(s) },
    querySelector: (selector: string) =>
      scripts.find((s) =>
        selector.includes("data-andrelook-ga")
          ? Boolean(s.dataset.andrelookGa)
          : Boolean(s.dataset.andrelookMeta),
      ) ?? null,
  });
  const storage = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => storage.get(k),
    setItem: (k: string, v: string) => storage.set(k, v),
  });
  vi.stubGlobal("localStorage", { getItem: () => null });
  const fetch = vi.fn().mockResolvedValue({});
  vi.stubGlobal("fetch", fetch);
  const m = await import("./client");
  const consent = {
    analytics: true,
    marketing: true,
    updatedAt: new Date().toISOString(),
    version: "g2-consent-v1" as const,
  };
  const product = (id: string) =>
    m.trackPublicEvent("view_item", {
      items: [{ item_id: id, item_name: id }],
    });
  m.applyMeasurementConsent(consent);
  m.trackFirstPartyPageView();
  product("A");
  m.applyMeasurementConsent(consent);
  product("A");
  expect(w.fbq!.queue.filter((c) => c[1] === "PageView")).toHaveLength(1);
  expect(w.fbq!.queue.filter((c) => c[1] === "ViewContent")).toHaveLength(1);
  for (const [path, id] of [
    ["/et/catalog/b", "B"],
    ["/et", null],
    ["/et/catalog/a", "A"],
    ["/en/catalog/a", "A"],
  ]) {
    w.location.pathname = path!;
    m.trackFirstPartyPageView();
    if (id) product(id);
  }
  expect(w.fbq!.queue.filter((c) => c[1] === "PageView")).toHaveLength(5);
  expect(w.fbq!.queue.filter((c) => c[1] === "ViewContent")).toHaveLength(4);
  expect(
    w.dataLayer.filter((c) => c[0] === "event" && c[1] === "view_item"),
  ).toHaveLength(4);
  expect(
    fetch.mock.calls.filter(
      (c) => JSON.parse(c[1].body).eventName === "VIEW_ITEM",
    ),
  ).toHaveLength(4);
  expect(w.fbq!.queue.filter((c) => c[0] === "init")).toHaveLength(1);
  const id = crypto.randomUUID();
  m.trackPublicEvent("preorder_submit", { item_id: "A" }, { eventId: id });
  m.trackPublicEvent("preorder_submit", { item_id: "A" }, { eventId: id });
  expect(w.fbq!.queue.filter((c) => c[1] === "Lead")).toHaveLength(1);
  m.applyMeasurementConsent({ ...consent, analytics: false, marketing: false });
  w.location.pathname = "/ru/catalog/a";
  m.trackFirstPartyPageView();
  product("A");
  expect(w.fbq!.queue.filter((c) => c[1] === "PageView")).toHaveLength(5);
});

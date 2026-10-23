import { describe, expect, it, vi } from "vitest";
import { copyCurrentReviewRequest } from "./clipboard";
import { reviewRequestMessage } from "./copy";

const requests = {
  en: { url: "https://example.invalid/review/en-order?lang=en", message: "" },
  et: { url: "https://example.invalid/review/et-order?lang=et", message: "" },
};
requests.en.message = reviewRequestMessage("en", requests.en.url);
requests.et.message = reviewRequestMessage("et", requests.et.url);

describe("current-order review clipboard", () => {
  for (const sequence of [
    ["en", "et"],
    ["et", "en"],
  ] as const) {
    it(`copies ${sequence.join(" then ")} with distinct current URLs`, async () => {
      let contents = "previous clipboard";
      const clipboard = {
        writeText: vi.fn(async (text: string) => {
          contents = text;
        }),
        readText: vi.fn(async () => contents),
      };
      const prepare = vi.fn(async (id: string) => requests[id as "en" | "et"]);
      for (const id of sequence) {
        const result = await copyCurrentReviewRequest(id, prepare, clipboard);
        expect(result?.copied).toBe(true);
        expect(contents).toBe(requests[id].message);
        expect(contents).toContain(requests[id].url);
        expect(contents).not.toContain(requests[id === "en" ? "et" : "en"].url);
      }
      expect(prepare.mock.calls.map(([id]) => id)).toEqual(sequence);
    });
  }
  it("does not report success before the write resolves", async () => {
    let complete!: () => void;
    let settled = false;
    const result = copyCurrentReviewRequest("en", async () => requests.en, {
      writeText: () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    }).then((value) => {
      settled = true;
      return value;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    complete();
    expect((await result)?.copied).toBe(true);
  });
  it("returns the exact new message for fallback on clipboard rejection", async () => {
    const result = await copyCurrentReviewRequest(
      "en",
      async () => requests.en,
      {
        writeText: async () => {
          throw new Error("permission denied");
        },
      },
    );
    expect(result).toEqual({ ...requests.en, copied: false });
  });
  it("never claims success when a resolved write leaves stale text", async () => {
    const result = await copyCurrentReviewRequest(
      "en",
      async () => requests.en,
      {
        writeText: async () => {},
        readText: async () => requests.et.message,
      },
    );
    expect(result).toEqual({ ...requests.en, copied: false });
  });
  it("provides fallback when clipboard is unavailable or readback is denied", async () => {
    expect(
      (await copyCurrentReviewRequest("et", async () => requests.et, undefined))
        ?.copied,
    ).toBe(false);
    expect(
      (
        await copyCurrentReviewRequest("et", async () => requests.et, {
          writeText: async () => {},
          readText: async () => {
            throw new Error("read denied");
          },
        })
      )?.copied,
    ).toBe(false);
  });
  it("does not copy a late previous-order response after navigation", async () => {
    let current = true;
    const clipboard = { writeText: vi.fn() };
    const result = copyCurrentReviewRequest(
      "en",
      async () => {
        current = false;
        return requests.en;
      },
      clipboard,
      () => current,
    );
    expect(await result).toBeNull();
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });
  it("opens fallback instead of hanging on an unanswered clipboard permission request", async () => {
    vi.useFakeTimers();
    try {
      const result = copyCurrentReviewRequest("en", async () => requests.en, {
        writeText: async () => {},
        readText: () => new Promise<string>(() => {}),
      });
      await vi.advanceTimersByTimeAsync(2000);
      expect(await result).toEqual({ ...requests.en, copied: false });
    } finally {
      vi.useRealTimers();
    }
  });
});

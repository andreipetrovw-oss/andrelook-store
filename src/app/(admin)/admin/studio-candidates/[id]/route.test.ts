import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  blobGet: vi.fn(),
  getPrivateStudioCandidate: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({ get: mocks.blobGet }));
vi.mock("@/lib/catalog/private-query", () => ({
  getPrivateStudioCandidate: mocks.getPrivateStudioCandidate,
}));

import { OwnerAuthorizationError } from "@/lib/auth/server";

import { GET } from "./route";

describe("private Studio candidate proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDIO_STORE_ID = "store_private";
  });

  it("streams a private candidate without exposing its blob URL", async () => {
    mocks.getPrivateStudioCandidate.mockResolvedValue({
      id: "candidate_1",
      privateBlobUrl: "https://private.blob.vercel-storage.com/secret.png",
      productId: "product_1",
      status: "NEEDS_REVIEW",
    });
    mocks.blobGet.mockResolvedValue({
      blob: { contentType: "image/png", etag: "etag-1", size: 3 },
      statusCode: 200,
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3]));
          controller.close();
        },
      }),
    });

    const response = await GET(
      new Request("https://crm.test/admin/studio-candidates/candidate_1"),
      { params: Promise.resolve({ id: "candidate_1" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(mocks.blobGet).toHaveBeenCalledWith(
      "https://private.blob.vercel-storage.com/secret.png",
      { access: "private", storeId: "store_private", useCache: false },
    );
    expect(await response.text()).not.toContain("private.blob");
  });

  it("fails closed before blob access when owner authorization is absent", async () => {
    mocks.getPrivateStudioCandidate.mockRejectedValue(
      new OwnerAuthorizationError("unauthenticated"),
    );
    const response = await GET(
      new Request("https://crm.test/admin/studio-candidates/candidate_1"),
      { params: Promise.resolve({ id: "candidate_1" }) },
    );
    expect(response.status).toBe(401);
    expect(mocks.blobGet).not.toHaveBeenCalled();
  });
});

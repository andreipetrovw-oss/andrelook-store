import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/catalog/private-query", () => ({
  getPrivateSourceImage: vi.fn(),
}));

import { getPrivateSourceImage } from "@/lib/catalog/private-query";
import { OwnerAuthorizationError } from "@/lib/auth/server";

import { GET } from "./route";

const source = vi.mocked(getPrivateSourceImage);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("private owner image proxy", () => {
  it("fetches an allowed private image with the stored album referrer", async () => {
    source.mockResolvedValue({
      previewUrl: null,
      product: {
        privateData: {
          supplierAlbumUrl: "https://supplier.x.yupoo.com/albums/1",
        },
      },
      sourceUrl: "https://photo.yupoo.com/supplier/example.jpg",
    });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "image/jpeg" },
        status: 200,
      }),
    );

    const response = await GET(
      new Request("https://crm.test/admin/source-images/a"),
      {
        params: Promise.resolve({ id: "image-a" }),
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("private");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ hostname: "photo.yupoo.com" }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Referer: "https://supplier.x.yupoo.com/albums/1",
        }),
        redirect: "error",
      }),
    );
  });

  it("rejects a host that is not explicitly allowed", async () => {
    source.mockResolvedValue({
      previewUrl: null,
      product: { privateData: { supplierAlbumUrl: null } },
      sourceUrl: "https://example.com/image.jpg",
    });
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await GET(
      new Request("https://crm.test/admin/source-images/a"),
      {
        params: Promise.resolve({ id: "image-a" }),
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when owner authorization is missing", async () => {
    source.mockRejectedValue(new OwnerAuthorizationError("unauthenticated"));
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await GET(
      new Request("https://crm.test/admin/source-images/a"),
      { params: Promise.resolve({ id: "image-a" }) },
    );

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not redirect or echo upstream non-image responses", async () => {
    source.mockResolvedValue({
      previewUrl: null,
      product: { privateData: { supplierAlbumUrl: null } },
      sourceUrl: "https://photo.yupoo.com/supplier/example.jpg",
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("supplier error", {
        headers: { "Content-Type": "text/html" },
        status: 567,
      }),
    );

    const response = await GET(
      new Request("https://crm.test/admin/source-images/a"),
      {
        params: Promise.resolve({ id: "image-a" }),
      },
    );

    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("supplier error");
  });
});

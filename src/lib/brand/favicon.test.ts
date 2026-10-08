import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const assets = {
  apple: {
    hash: "20595b8c970af90a506785641a11edcfc8d9b982024cfaaa92d51e63c4c8f26d",
    path: fileURLToPath(new URL("../../app/apple-icon.png", import.meta.url)),
    size: 180,
  },
  favicon: {
    hash: "ef1ad376e1e29d964fd9672537dbcb52f18b53a315999f1d1119212a50c7c725",
    path: fileURLToPath(new URL("../../app/favicon.ico", import.meta.url)),
  },
  icon: {
    hash: "e696ec3b5fafc92b2d00dd6dd487e5cc0d6097ee7580d5759da4e74298d679ff",
    path: fileURLToPath(new URL("../../app/icon.png", import.meta.url)),
    size: 512,
  },
} as const;

async function sha256(filePath: string) {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}

describe("Andrelook file-based icon metadata", () => {
  it("keeps the approved logo-derived assets at Next.js convention paths", async () => {
    await expect(sha256(assets.favicon.path)).resolves.toBe(
      assets.favicon.hash,
    );
    await expect(sha256(assets.icon.path)).resolves.toBe(assets.icon.hash);
    await expect(sha256(assets.apple.path)).resolves.toBe(assets.apple.hash);
  });

  it.each([assets.icon, assets.apple])(
    "keeps $size px PNG metadata square and opaque",
    async (asset) => {
      const metadata = await sharp(asset.path).metadata();
      expect(metadata).toMatchObject({
        channels: 3,
        format: "png",
        hasAlpha: false,
        height: asset.size,
        width: asset.size,
      });
    },
  );
});

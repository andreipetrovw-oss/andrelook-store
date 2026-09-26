import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const goldenCodes = [
  "AL-SRC-CPREPSCN-218824597",
  "AL-SRC-CPREPSCN-200087445",
  "AL-SRC-KINGCN-209196603",
  "AL-SRC-CPREPSCN-161312256",
] as const;

const tileWidth = 240;
const tileHeight = 320;
const columns = 4;

function label(position: number, width: number, height: number) {
  const text = `#${position} · ${width}×${height}`;
  return Buffer.from(
    `<svg width="${tileWidth}" height="36" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="10" y="24" fill="#fff" font-family="Arial" font-size="16">${text}</text></svg>`,
  );
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const prisma = new PrismaClient();
  const outputRoot = path.resolve(".phase6d-review");
  await mkdir(outputRoot, { recursive: true });

  try {
    const requestedCode = process.env.PHASE6D_PRODUCT_CODE?.trim();
    const products = await prisma.product.findMany({
      orderBy: { internalCode: "asc" },
      select: {
        internalCode: true,
        sourceImages: {
          orderBy: { sourcePosition: "asc" },
          select: {
            isSizeChart: true,
            previewUrl: true,
            sourcePosition: true,
            sourceUrl: true,
          },
        },
        translations: {
          select: { locale: true, name: true },
          where: { locale: "EN" },
        },
      },
      where: {
        internalCode: requestedCode ? requestedCode : { in: [...goldenCodes] },
      },
    });

    for (const product of products) {
      console.log(`Reviewing ${product.internalCode}...`);
      const tiles: Buffer[] = [];
      const manifest = [];
      for (const image of product.sourceImages) {
        const reviewUrl = image.previewUrl ?? image.sourceUrl;
        const supplier = new URL(reviewUrl).pathname.split("/")[1];
        const response = await fetch(reviewUrl, {
          headers: {
            Referer: `https://${supplier}.x.yupoo.com/`,
            "User-Agent": "Andrelook private evidence review",
          },
        });
        if (!response.ok) {
          manifest.push({ ...image, error: `HTTP ${response.status}` });
          continue;
        }
        const input = Buffer.from(await response.arrayBuffer());
        const metadata = await sharp(input).metadata();
        const width = metadata.width ?? 0;
        const height = metadata.height ?? 0;
        const picture = await sharp(input)
          .rotate()
          .resize(tileWidth, tileHeight - 36, {
            background: "#f1eee8",
            fit: "contain",
          })
          .extend({
            background: "#111",
            bottom: 36,
          })
          .composite([
            {
              input: label(image.sourcePosition, width, height),
              left: 0,
              top: tileHeight - 36,
            },
          ])
          .jpeg({ quality: 84 })
          .toBuffer();
        if (image.sourcePosition === 2) {
          await sharp(input)
            .rotate()
            .png()
            .toFile(
              path.join(
                outputRoot,
                `${product.internalCode.toLowerCase()}-source-02.png`,
              ),
            );
        }
        tiles.push(picture);
        manifest.push({ ...image, height, width });
        console.log(`  source #${image.sourcePosition}`);
      }

      if (!tiles.length) {
        throw new Error(
          `No reviewable images fetched for ${product.internalCode}.`,
        );
      }
      const rows = Math.ceil(tiles.length / columns);
      const sheet = sharp({
        create: {
          background: "#dedbd4",
          channels: 3,
          height: rows * tileHeight,
          width: columns * tileWidth,
        },
      }).composite(
        tiles.map((input, index) => ({
          input,
          left: (index % columns) * tileWidth,
          top: Math.floor(index / columns) * tileHeight,
        })),
      );
      const basename = product.internalCode.toLowerCase();
      await sheet
        .jpeg({ quality: 88 })
        .toFile(path.join(outputRoot, `${basename}.jpg`));
      await writeFile(
        path.join(outputRoot, `${basename}.json`),
        JSON.stringify(
          {
            internalCode: product.internalCode,
            name: product.translations[0]?.name,
            sourceImages: manifest,
          },
          null,
          2,
        ),
      );
    }
    console.log(`Private review sheets written to ${outputRoot}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

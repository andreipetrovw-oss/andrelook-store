import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  dillonReferencePack,
  PHASE6D3_PRODUCT_CODE,
} from "./lib/phase6d3-dillon-reference-pack";

const [, , sourceArgument, outputArgument] = process.argv;
if (!sourceArgument || !outputArgument) {
  throw new Error(
    "Usage: tsx scripts/create-phase6d3-studio-masters.ts SOURCE_DIR OUTPUT_DIR",
  );
}
const sourceDirectory: string = sourceArgument;
const outputDirectory: string = outputArgument;

const canvas = { width: 2400, height: 3000 };
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const cutoutScript = path.join(
  moduleDirectory,
  "studio",
  "vision-source-cutout.swift",
);

async function sha256(filePath: string) {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}

async function createMaster(
  role: string,
  sourcePosition: number,
  destination: string,
) {
  const source = path.join(
    sourceDirectory,
    `dillon-${String(sourcePosition).padStart(2, "0")}.jpg`,
  );
  const cutout = path.join(
    outputDirectory,
    `.working-${role.toLowerCase()}-source-${sourcePosition}.png`,
  );
  execFileSync("swift", [cutoutScript, source, cutout], { stdio: "inherit" });

  const trimmed = await sharp(cutout)
    .trim({ background: "transparent" })
    .png()
    .toBuffer();
  const product = await sharp(trimmed)
    .resize(1968, 2460, {
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const metadata = await sharp(product).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Invalid cutout");
  const left = Math.round((canvas.width - metadata.width) / 2);
  const top = Math.round((canvas.height - metadata.height) / 2);

  await sharp({
    create: {
      ...canvas,
      background: "#F5F2ED",
      channels: 4,
    },
  })
    .composite([{ input: product, left, top }])
    .flatten({ background: "#F5F2ED" })
    .withMetadata({ icc: "srgb" })
    .png({ compressionLevel: 9, palette: false })
    .toFile(destination);

  return {
    outputSha256: await sha256(destination),
    sourceSha256: await sha256(source),
  };
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  const candidates = [];
  for (const definition of dillonReferencePack) {
    const role = definition.role.toLowerCase();
    const filename = `andrelook-${PHASE6D3_PRODUCT_CODE.toLowerCase()}-${role}-v01-2400x3000.png`;
    const destination = path.join(outputDirectory, filename);
    const hashes = await createMaster(
      definition.role,
      definition.primaryPosition,
      destination,
    );
    candidates.push({
      ...definition,
      filename,
      format: "png",
      height: canvas.height,
      method: "source-pixel/vision-mask/v1",
      version: 1,
      width: canvas.width,
      ...hashes,
    });
  }
  await writeFile(
    path.join(outputDirectory, "manifest.local.json"),
    `${JSON.stringify({ candidates, productCode: PHASE6D3_PRODUCT_CODE }, null, 2)}\n`,
  );
  console.log(
    JSON.stringify({ candidates: candidates.length, outputDirectory }),
  );
}

void main();

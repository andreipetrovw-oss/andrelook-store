import { del, put } from "@vercel/blob";
import { ImageRole, Prisma, PrismaClient } from "@prisma/client";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  dillonFidelityChecks,
  dillonReferencePack,
  dillonUnsupportedClaims,
  PHASE6D3_PRODUCT_CODE,
} from "./lib/phase6d3-dillon-reference-pack";

type LocalCandidate = {
  engineeringDisposition: "CANDIDATE" | "REJECTED_TOOLING";
  filename: string;
  format: string;
  height: number;
  method: string;
  outputSha256: string;
  primaryPosition: number;
  purpose: string;
  role: string;
  sourceSha256: string;
  supportingPositions: number[];
  version: number;
  width: number;
};

const manifestArgument = process.argv[2];
if (!manifestArgument) {
  throw new Error(
    "Usage: tsx scripts/import-phase6d3-studio-candidates.ts MANIFEST_PATH",
  );
}
const manifestPath: string = manifestArgument;

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (!process.env.STUDIO_STORE_ID) {
    throw new Error("STUDIO_STORE_ID is required for private candidates.");
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    candidates: LocalCandidate[];
    productCode: string;
  };
  if (manifest.productCode !== PHASE6D3_PRODUCT_CODE) {
    throw new Error("Import is scope-locked to the Dillon Golden Master.");
  }
  const expected = new Map(
    dillonReferencePack.map((item) => [
      `${item.role}:${item.primaryPosition}`,
      item,
    ]),
  );
  const candidates = manifest.candidates.filter(
    (item) => item.engineeringDisposition === "CANDIDATE",
  );
  if (candidates.length !== 4) {
    throw new Error(
      "Expected exactly four engineering-accepted Dillon candidates.",
    );
  }

  const prisma = new PrismaClient();
  const uploaded: string[] = [];
  try {
    const product = await prisma.product.findUniqueOrThrow({
      include: { sourceImages: true },
      where: { internalCode: PHASE6D3_PRODUCT_CODE },
    });
    for (const candidate of candidates) {
      const definition = expected.get(
        `${candidate.role}:${candidate.primaryPosition}`,
      );
      if (!definition || definition.engineeringDisposition !== "CANDIDATE") {
        throw new Error(`Unexpected candidate ${candidate.role}.`);
      }
      const sourcePositions = [
        candidate.primaryPosition,
        ...candidate.supportingPositions,
      ];
      const sources = sourcePositions.map((position) => {
        const source = product.sourceImages.find(
          (item) => item.sourcePosition === position,
        );
        if (!source) throw new Error(`Missing source position ${position}.`);
        return source;
      });
      const primary = sources[0];
      if (!primary) throw new Error("Candidate has no primary source.");
      if (
        primary.sourceSha256 &&
        primary.sourceSha256 !== candidate.sourceSha256
      ) {
        throw new Error(
          `Source hash mismatch for position ${primary.sourcePosition}.`,
        );
      }
      const role = Object.values(ImageRole).find(
        (value) => value === candidate.role,
      );
      if (!role || role === ImageRole.SIZE_CHART) {
        throw new Error(`Unsupported Studio role ${candidate.role}.`);
      }
      const existing = await prisma.studioCandidate.findUnique({
        where: {
          productId_role_version: {
            productId: product.id,
            role,
            version: candidate.version,
          },
        },
      });
      if (existing) continue;

      const localPath = path.join(
        path.dirname(manifestPath),
        candidate.filename,
      );
      const bytes = await readFile(localPath);
      const file = await stat(localPath);
      const storageKey = `andrelook-v1/phase6d3/${product.id}/${candidate.role.toLowerCase()}/v${String(candidate.version).padStart(2, "0")}/${candidate.filename}`;
      const blob = await put(storageKey, bytes, {
        access: "private",
        addRandomSuffix: false,
        contentType: "image/png",
        storeId: process.env.STUDIO_STORE_ID,
      });
      uploaded.push(blob.url);
      try {
        await prisma.studioCandidate.create({
          data: {
            fileSizeBytes: file.size,
            format: candidate.format,
            height: candidate.height,
            method: candidate.method,
            privateBlobUrl: blob.url,
            productId: product.id,
            referencePack: json({
              colourEvidencePositions: [2, 3, 4, 5],
              fidelityChecklist: dillonFidelityChecks,
              geometryEvidencePositions: [2, 3, 4, 5],
              hardwareEvidencePositions: [12, 14],
              primarySourcePosition: candidate.primaryPosition,
              purpose: candidate.purpose,
              supportingSourcePositions: candidate.supportingPositions,
              uncertaintyNotes: [
                "Тёмные исходники различаются по балансу белого; цвет не является коммерческим решением.",
                "Владелец должен сравнить края маски при 100% масштабе.",
              ],
              unsupportedAreas: dillonUnsupportedClaims,
            }),
            role,
            sources: {
              create: sources.map((source, index) => ({
                isPrimary: index === 0,
                purpose:
                  index === 0
                    ? "PRIMARY_EVIDENCE"
                    : "SUPPORTING_FIDELITY_EVIDENCE",
                sortOrder: index,
                sourceImageId: source.id,
              })),
            },
            status: "NEEDS_REVIEW",
            storageKey,
            technicalQa: json({
              alpha: false,
              aspectRatio: "4:5",
              background: "#F5F2ED",
              candidateSha256: candidate.outputSha256,
              dimensions: `${candidate.width}x${candidate.height}`,
              edgeReview: "engineering-reviewed; owner 100% review required",
              noProductRegeneration: true,
              sourcePixelPipeline: true,
              sourceResolutionLimited: candidate.primaryPosition === 2,
            }),
            version: candidate.version,
            width: candidate.width,
          },
        });
      } catch (error) {
        await del(blob.url, { storeId: process.env.STUDIO_STORE_ID });
        uploaded.pop();
        throw error;
      }
    }
    const result = await prisma.studioCandidate.groupBy({
      _count: true,
      by: ["status"],
      where: { productId: product.id },
    });
    console.log(
      JSON.stringify({ importedCandidates: candidates.length, states: result }),
    );
  } catch (error) {
    if (uploaded.length)
      console.error(`Uploaded before failure: ${uploaded.length}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

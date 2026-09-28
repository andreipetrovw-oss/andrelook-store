import { del, put } from "@vercel/blob";
import { Prisma, PrismaClient, StudioCandidateStatus } from "@prisma/client";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import {
  dillonCompleteEvidencePositions,
  dillonInvariantMap,
  phase6d4Candidates,
  phase6d4Method,
  phase6d4RejectedPasses,
  phase6d4UnsupportedClaims,
  PHASE6D4_PRODUCT_CODE,
  type Phase6d4CandidateDefinition,
} from "./lib/phase6d4-dillon-reference-pack";

const assetDirectoryArgument = process.argv[2];
if (!assetDirectoryArgument) {
  throw new Error(
    "Usage: tsx scripts/import-phase6d4-studio-candidates.ts ASSET_DIRECTORY",
  );
}
const assetDirectory = path.resolve(assetDirectoryArgument);

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function inspectAsset(filename: string) {
  const localPath = path.join(assetDirectory, filename);
  const bytes = await readFile(localPath);
  const file = await stat(localPath);
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height || metadata.format !== "png") {
    throw new Error(`${filename} must be a readable PNG with dimensions.`);
  }
  const ratio = metadata.width / metadata.height;
  if (Math.abs(ratio - 4 / 5) > 0.001) {
    throw new Error(`${filename} is not within tolerance of the 4:5 master.`);
  }
  return {
    bytes,
    fileSizeBytes: file.size,
    format: metadata.format,
    height: metadata.height,
    outputSha256: createHash("sha256").update(bytes).digest("hex"),
    width: metadata.width,
  };
}

type InspectedAsset = Awaited<ReturnType<typeof inspectAsset>>;
type CandidateSource = { id: string; sourcePosition: number };
type PreparedCandidate =
  | {
      definition: Phase6d4CandidateDefinition;
      existing: true;
    }
  | {
      asset: InspectedAsset;
      blobUrl: string;
      definition: Phase6d4CandidateDefinition;
      existing: false;
      sources: CandidateSource[];
      storageKey: string;
    };

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (!process.env.STUDIO_STORE_ID) {
    throw new Error("STUDIO_STORE_ID is required for private candidates.");
  }

  const inspected = new Map(
    await Promise.all(
      phase6d4Candidates.map(
        async (definition) =>
          [
            definition.filename,
            await inspectAsset(definition.filename),
          ] as const,
      ),
    ),
  );
  const prisma = new PrismaClient();
  const uploaded: string[] = [];

  try {
    const product = await prisma.product.findUniqueOrThrow({
      include: { sourceImages: true },
      where: { internalCode: PHASE6D4_PRODUCT_CODE },
    });
    if (product.publicationStatus === "PUBLISHED") {
      throw new Error("Dillon must remain unpublished during Phase 6D.4.");
    }

    const availablePositions = new Set(
      product.sourceImages.map((item) => item.sourcePosition),
    );
    for (const position of dillonCompleteEvidencePositions) {
      if (!availablePositions.has(position)) {
        throw new Error(`Missing Dillon source position ${position}.`);
      }
    }

    const approvedLegacy = await prisma.studioCandidate.count({
      where: {
        productId: product.id,
        status: StudioCandidateStatus.OWNER_APPROVED,
        storageKey: { startsWith: "andrelook-v1/phase6d3/" },
      },
    });
    if (approvedLegacy) {
      throw new Error(
        "Refusing to supersede an owner-approved Phase 6D.3 candidate.",
      );
    }

    const prepared: PreparedCandidate[] = [];
    for (const definition of phase6d4Candidates) {
      const asset = inspected.get(definition.filename);
      if (!asset)
        throw new Error(`Missing inspected asset ${definition.filename}.`);
      const sourcePositions = [
        definition.primaryPosition,
        ...definition.supportingPositions,
      ];
      const sources = sourcePositions.map((position) => {
        const source = product.sourceImages.find(
          (item) => item.sourcePosition === position,
        );
        if (!source) throw new Error(`Missing source position ${position}.`);
        return source;
      });
      const existing = await prisma.studioCandidate.findUnique({
        where: {
          productId_role_version: {
            productId: product.id,
            role: definition.role,
            version: definition.version,
          },
        },
      });
      if (existing) {
        if (existing.method !== phase6d4Method) {
          throw new Error(
            `Role/version collision for ${definition.role} v${definition.version}.`,
          );
        }
        prepared.push({ definition, existing: true as const });
        continue;
      }

      const storageKey = `andrelook-v1/phase6d4/${product.id}/${definition.role.toLowerCase()}/v${String(definition.version).padStart(2, "0")}/${definition.filename}`;
      const blob = await put(storageKey, asset.bytes, {
        access: "private",
        addRandomSuffix: false,
        contentType: "image/png",
        storeId: process.env.STUDIO_STORE_ID,
      });
      uploaded.push(blob.url);
      prepared.push({
        asset,
        blobUrl: blob.url,
        definition,
        existing: false as const,
        sources,
        storageKey,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of prepared) {
        if (item.existing) continue;
        const { asset, definition, sources } = item;
        await tx.studioCandidate.create({
          data: {
            engineeringNotes:
              "Phase 6D.4 generative Studio candidate. Private review only; no public promotion or owner approval.",
            fileSizeBytes: asset.fileSizeBytes,
            fidelityChecklist: json({ checked: [], completed: false }),
            format: asset.format,
            height: asset.height,
            method: definition.method,
            privateBlobUrl: item.blobUrl,
            productId: product.id,
            referencePack: json({
              completeEvidencePositions: dillonCompleteEvidencePositions,
              fidelityFindings: definition.fidelityFindings,
              generationInputPositions: definition.generationInputPositions,
              invariantMap: dillonInvariantMap,
              iterationHistory: definition.iterationHistory,
              primarySourcePosition: definition.primaryPosition,
              purpose: definition.purpose,
              rejectedPasses: phase6d4RejectedPasses,
              supportingSourcePositions: definition.supportingPositions,
              uncertaintyNotes: definition.uncertaintyNotes,
              unsupportedClaims: phase6d4UnsupportedClaims,
            }),
            role: definition.role,
            sources: {
              create: sources.map((source, index) => ({
                isPrimary: index === 0,
                purpose:
                  index === 0
                    ? "PRIMARY_GENERATION_EVIDENCE"
                    : "SUPPORTING_MULTI_REFERENCE_EVIDENCE",
                sortOrder: index,
                sourceImageId: source.id,
              })),
            },
            status: StudioCandidateStatus.NEEDS_REVIEW,
            storageKey: item.storageKey,
            technicalQa: json({
              aspectRatio: "4:5",
              background: "warm neutral Andrelook Studio",
              candidateSha256: asset.outputSha256,
              dimensions: `${asset.width}x${asset.height}`,
              fidelityReview:
                "engineering pass; owner full-resolution review required",
              generatedReconstruction: true,
              noAutomaticApproval: true,
              noAutomaticPublicImage: true,
              sourcePixelCutout: false,
            }),
            version: definition.version,
            width: asset.width,
          },
        });
      }

      const legacy = await tx.studioCandidate.updateMany({
        data: {
          engineeringNotes:
            "Superseded and rejected by owner direction in Phase 6D.4: obsolete source-pixel cutout technical experiment; never publish or scale.",
          status: StudioCandidateStatus.REJECTED,
        },
        where: {
          productId: product.id,
          status: { not: StudioCandidateStatus.OWNER_APPROVED },
          storageKey: { startsWith: "andrelook-v1/phase6d3/" },
        },
      });

      return {
        imported: prepared.filter((item) => !item.existing).length,
        legacy,
      };
    });

    const states = await prisma.studioCandidate.groupBy({
      _count: true,
      by: ["status"],
      where: { productId: product.id },
    });
    const publicImages = await prisma.productImage.count({
      where: { productId: product.id },
    });
    console.log(
      JSON.stringify({
        activeDefinitions: phase6d4Candidates.length,
        importedCandidates: result.imported,
        legacyRejected: result.legacy.count,
        publicImages,
        states,
      }),
    );
  } catch (error) {
    await Promise.all(
      uploaded.map((url) =>
        del(url, { storeId: process.env.STUDIO_STORE_ID }).catch(
          () => undefined,
        ),
      ),
    );
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

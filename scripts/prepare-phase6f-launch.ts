import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, parse, resolve } from "node:path";
import vm from "node:vm";

import sharp from "sharp";

const PHASE5_SHA256 =
  "5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21";

const mapping = new Map<number, string>([
  [1, "AL-SRC-KINGCN-209196543"],
  [2, "AL-SRC-CPREPSCN-218168827"],
  [3, "AL-SRC-KINGCN-209196423"],
  [4, "AL-SRC-KINGCN-250472868"],
  [5, "AL-SRC-CPREPSCN-200087445"],
  [7, "AL-SRC-KINGCN-209196317"],
  [8, "AL-SRC-KINGCN-209196488"],
  [10, "AL-SRC-KINGCN-209196467"],
  [11, "AL-SRC-KINGCN-209208469"],
  [12, "AL-SRC-CPREPSCN-179204523"],
  [14, "AL-SRC-KINGCN-209195406"],
  [15, "AL-SRC-CPREPSCN-190253977"],
  [16, "AL-SRC-KINGCN-209196612"],
  [17, "AL-SRC-KINGCN-209196441"],
  [18, "AL-SRC-KINGCN-209196300"],
  [21, "AL-SRC-KINGCN-209196561"],
  [23, "AL-SRC-KINGCN-209196496"],
]);

type LegacyProduct = {
  id: number;
  names: Record<"ru" | "et" | "en", string>;
  category: string;
  cats: Record<"ru" | "et" | "en", string>;
  descs: Record<"ru" | "et" | "en", string>;
  images: string[];
  brand: string;
  colors?: Array<{
    hex: string;
    name: Record<"ru" | "et" | "en", string>;
  }>;
};

type Phase5Product = {
  internal_id: string;
  size_data: {
    status: string;
    chart?: {
      source_album_id?: string;
      units?: string | null;
      sizes: string[];
      measurements: Array<{ name: string; values: Array<number | null> }>;
      verification?: string;
      verification_date?: string;
      chart_scope?: string;
      notes?: string[];
      source_image_position?: number;
      source_image_url?: string;
      source_image_sha256?: string | null;
    };
  };
};

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractLegacyProducts(source: string): LegacyProduct[] {
  const start = source.indexOf("const PRODUCTS =");
  const end = source.indexOf("\n];", start);
  if (start < 0 || end < 0) throw new Error("Legacy PRODUCTS array not found.");
  const expression = source
    .slice(start, end + 3)
    .replace(/^const PRODUCTS\s*=\s*/, "");
  const products = vm.runInNewContext(expression, Object.create(null));
  if (!Array.isArray(products) || products.length !== 23) {
    throw new Error(
      `Expected 23 legacy products, received ${products?.length}.`,
    );
  }
  return products as LegacyProduct[];
}

async function main() {
  const workspace = resolve(process.cwd());
  const archiveRoot = resolve(workspace, "..");
  const legacyRoot = join(archiveRoot, "phase4-work");
  const phase5Path = join(archiveRoot, "phase5c1", "final-master-catalog.json");
  const legacyScript = await readFile(
    join(legacyRoot, "js", "main.js"),
    "utf8",
  );
  const phase5Bytes = await readFile(phase5Path);
  if (sha256(phase5Bytes) !== PHASE5_SHA256) {
    throw new Error(
      "Phase 5C1 catalog hash does not match the approved artifact.",
    );
  }

  const legacyProducts = extractLegacyProducts(legacyScript);
  const phase5 = JSON.parse(phase5Bytes.toString("utf8")) as {
    products: Phase5Product[];
  };
  const phase5ById = new Map(
    phase5.products.map((product) => [product.internal_id, product]),
  );

  const originalRoot = join(workspace, "assets", "legacy-products", "original");
  const publicRoot = join(workspace, "public", "products", "legacy");
  await mkdir(originalRoot, { recursive: true });
  await mkdir(publicRoot, { recursive: true });

  const products = [];
  let imageCount = 0;
  for (const legacy of legacyProducts) {
    const slug = slugify(legacy.names.en);
    const images = [];
    for (const [index, relativePath] of legacy.images.entries()) {
      const fileName = basename(relativePath);
      const sourcePath = join(legacyRoot, relativePath);
      const sourceBytes = await readFile(sourcePath);
      const originalPath = join(originalRoot, fileName);
      await cp(sourcePath, originalPath);

      const optimizedName = `${parse(fileName).name}.webp`;
      const optimizedPath = join(publicRoot, optimizedName);
      await sharp(sourceBytes)
        .rotate()
        .resize({
          fit: "inside",
          height: 2200,
          withoutEnlargement: true,
          width: 1800,
        })
        .webp({ effort: 5, quality: 84, smartSubsample: true })
        .toFile(optimizedPath);
      const optimizedBytes = await readFile(optimizedPath);
      const metadata = await sharp(optimizedBytes).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error(`Missing dimensions for ${optimizedName}.`);
      }
      images.push({
        alt: {
          en: `${legacy.names.en}, view ${index + 1}`,
          et: `${legacy.names.et}, vaade ${index + 1}`,
          ru: `${legacy.names.ru}, вид ${index + 1}`,
        },
        height: metadata.height,
        masterExtension: extname(fileName).slice(1),
        masterFile: `assets/legacy-products/original/${fileName}`,
        masterSha256: sha256(sourceBytes),
        optimizedSha256: sha256(optimizedBytes),
        role: index === 0 ? "PRIMARY" : "GALLERY",
        sortOrder: index,
        url: `/products/legacy/${optimizedName}`,
        width: metadata.width,
      });
      imageCount += 1;
    }

    const sourceInternalId = mapping.get(legacy.id) ?? null;
    const source = sourceInternalId ? phase5ById.get(sourceInternalId) : null;
    if (sourceInternalId && !source) {
      throw new Error(`Missing mapped Phase 5 product ${sourceInternalId}.`);
    }
    const chart = source?.size_data.chart;
    if (
      source &&
      (source.size_data.status !== "SIZE CHART VERIFIED" || !chart)
    ) {
      throw new Error(
        `Mapped product ${sourceInternalId} lacks a verified chart.`,
      );
    }

    products.push({
      availabilityType: "PRE_ORDER",
      brand: legacy.brand,
      category: {
        names: legacy.cats,
        slug: legacy.category,
      },
      colors: (legacy.colors ?? []).map((color, index) => ({
        code: slugify(color.name.en),
        names: color.name,
        sortOrder: index,
        swatchHex: color.hex,
      })),
      images,
      internalCode: `AL-LEGACY-${String(legacy.id).padStart(3, "0")}`,
      isFeatured: [1, 2, 3, 4, 14, 20].includes(legacy.id),
      legacyId: legacy.id,
      phase5Mapping: sourceInternalId
        ? {
            confidence: "EXPLICIT_MODEL_NAME",
            sourceInternalId,
          }
        : null,
      preorderEstimateText: "2–3 weeks",
      publicationStatus: "READY",
      retailPriceMinor: null,
      currency: "EUR",
      sizeChart: chart
        ? {
            chartData: {
              measurements: chart.measurements,
              sizes: chart.sizes,
            },
            evidence: {
              chartScope: chart.chart_scope ?? null,
              notes: chart.notes ?? [],
              sourceAlbumId: chart.source_album_id ?? null,
              sourceImagePosition: chart.source_image_position ?? null,
              sourceImageSha256: chart.source_image_sha256 ?? null,
              sourceImageUrl: chart.source_image_url ?? null,
              verification: chart.verification ?? null,
              verificationDate: chart.verification_date ?? null,
            },
            units: chart.units ?? null,
          }
        : null,
      slug,
      sortOrder: legacy.id,
      translations: legacy.names
        ? (["ru", "et", "en"] as const).map((locale) => ({
            description: legacy.descs[locale],
            locale,
            name: legacy.names[locale],
            shortDescription: legacy.descs[locale].split("\n")[0],
          }))
        : [],
    });
  }

  if (imageCount !== 53 || mapping.size !== 17) {
    throw new Error(
      `Unexpected launch totals: ${products.length} products, ${imageCount} images, ${mapping.size} mappings.`,
    );
  }

  const artifact = {
    approvedPhase5Sha256: PHASE5_SHA256,
    artifactType: "andrelook-phase6f-legacy-launch-catalog",
    products,
    summary: {
      imageCount,
      mappedSizeChartCount: mapping.size,
      productCount: products.length,
      unresolvedSizeChartCount: products.length - mapping.size,
    },
    version: 1,
  };
  await mkdir(join(workspace, "data"), { recursive: true });
  await writeFile(
    join(workspace, "data", "phase6f-launch-catalog.json"),
    `${JSON.stringify(artifact, null, 2)}\n`,
  );
  console.log(JSON.stringify(artifact.summary));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

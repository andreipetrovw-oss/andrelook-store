import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const phase6fCatalogPath = path.resolve(
  process.cwd(),
  "data/phase6f-launch-catalog.json",
);

export const expectedPhase5Sha256 =
  "5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21";

export type LaunchLocale = "ru" | "et" | "en";

export type LaunchProduct = {
  availabilityType: "PRE_ORDER";
  brand: string;
  category: {
    names: Record<LaunchLocale, string>;
    slug: string;
  };
  colors: Array<{
    code: string;
    names: Record<LaunchLocale, string>;
    sortOrder: number;
    swatchHex: string;
  }>;
  currency: "EUR";
  images: Array<{
    alt: Record<LaunchLocale, string>;
    height: number;
    masterFile: string;
    masterSha256: string;
    optimizedSha256: string;
    role: "PRIMARY" | "GALLERY";
    sortOrder: number;
    url: string;
    width: number;
  }>;
  internalCode: string;
  isFeatured: boolean;
  legacyId: number;
  phase5Mapping: {
    confidence: "EXPLICIT_MODEL_NAME";
    sourceInternalId: string;
  } | null;
  preorderEstimateText: "2–3 weeks";
  publicationStatus: "DRAFT" | "READY";
  retailPriceMinor: number | null;
  sizeChart: {
    chartData: {
      measurements: Array<{
        name: string;
        values: Array<number | null>;
      }>;
      sizes: string[];
    };
    evidence: {
      chartScope: string | null;
      notes: string[];
      sourceAlbumId: string | null;
      sourceImagePosition: number | null;
      sourceImageSha256: string | null;
      sourceImageUrl: string | null;
      verification: string | null;
      verificationDate: string | null;
    };
    units: string | null;
  } | null;
  slug: string;
  sortOrder: number;
  translations: Array<{
    description: string;
    locale: LaunchLocale;
    name: string;
    shortDescription: string;
  }>;
};

export type Phase6fLaunchCatalog = {
  approvedPhase5Sha256: string;
  artifactType: "andrelook-phase6f-legacy-launch-catalog";
  products: LaunchProduct[];
  summary: {
    imageCount: number;
    mappedSizeChartCount: number;
    ownerApprovedPriceCount: number;
    productCount: number;
    publicProductCount: number;
    retiredPrivateProductCount: number;
    unresolvedPublicSizeChartCount: number;
  };
  version: 1;
};

export function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function assertPhase6fLaunchCatalog(
  value: unknown,
): asserts value is Phase6fLaunchCatalog {
  const catalog = value as Partial<Phase6fLaunchCatalog>;
  if (
    catalog.artifactType !== "andrelook-phase6f-legacy-launch-catalog" ||
    catalog.version !== 1 ||
    catalog.approvedPhase5Sha256 !== expectedPhase5Sha256 ||
    !Array.isArray(catalog.products) ||
    catalog.products.length !== 23
  ) {
    throw new Error(
      "Phase 6F launch catalog identity or product count mismatch.",
    );
  }
  const codes = new Set(
    catalog.products.map((product) => product.internalCode),
  );
  const slugs = new Set(catalog.products.map((product) => product.slug));
  const images = catalog.products.flatMap((product) => product.images);
  const publicProducts = catalog.products.filter(
    (product) => product.publicationStatus === "READY",
  );
  const retiredProduct = catalog.products.find(
    (product) => product.internalCode === "AL-LEGACY-006",
  );
  const charts = publicProducts.filter((product) => product.sizeChart);
  const pricedProducts = publicProducts.filter(
    (product) =>
      Number.isInteger(product.retailPriceMinor) &&
      (product.retailPriceMinor ?? 0) > 0,
  );
  if (
    codes.size !== 23 ||
    slugs.size !== 23 ||
    images.length !== 53 ||
    publicProducts.length !== 22 ||
    charts.length !== 22 ||
    pricedProducts.length !== 22 ||
    !retiredProduct ||
    retiredProduct.publicationStatus !== "DRAFT" ||
    retiredProduct.retailPriceMinor !== null ||
    retiredProduct.sizeChart !== null ||
    catalog.summary?.productCount !== 23 ||
    catalog.summary.publicProductCount !== 22 ||
    catalog.summary.retiredPrivateProductCount !== 1 ||
    catalog.summary.imageCount !== 53 ||
    catalog.summary.ownerApprovedPriceCount !== 22 ||
    catalog.summary.mappedSizeChartCount !== 22 ||
    catalog.summary.unresolvedPublicSizeChartCount !== 0 ||
    catalog.products.some(
      (product) =>
        product.availabilityType !== "PRE_ORDER" ||
        product.preorderEstimateText !== "2–3 weeks" ||
        product.currency !== "EUR" ||
        product.translations.length !== 3 ||
        !product.images.length,
    )
  ) {
    throw new Error("Phase 6F launch catalog invariant mismatch.");
  }
}

export async function readPhase6fLaunchCatalog(
  file = phase6fCatalogPath,
): Promise<Phase6fLaunchCatalog> {
  const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
  assertPhase6fLaunchCatalog(parsed);
  return parsed;
}

export async function verifyPhase6fAssetHashes(
  catalog: Phase6fLaunchCatalog,
  root = process.cwd(),
) {
  for (const product of catalog.products) {
    for (const image of product.images) {
      const master = await readFile(path.resolve(root, image.masterFile));
      const optimized = await readFile(
        path.resolve(root, image.url.replace(/^\//, "public/")),
      );
      if (sha256(master) !== image.masterSha256) {
        throw new Error(`Legacy master checksum mismatch: ${image.masterFile}`);
      }
      if (sha256(optimized) !== image.optimizedSha256) {
        throw new Error(`Optimized image checksum mismatch: ${image.url}`);
      }
    }
  }
}

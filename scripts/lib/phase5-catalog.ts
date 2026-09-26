export const expectedPhase5 = {
  candidates: 57,
  products: 63,
  reviewBeforeCatalog: 6,
  sourceImages: 1431,
  verifiedSizeCharts: 60,
} as const;

export type Phase5SourceImage = {
  assigned_role?: string | null;
  height?: number | null;
  http_validation?: unknown;
  inferred_view?: string | null;
  is_size_chart?: boolean;
  local_original_path?: string | null;
  name?: string | null;
  position: number;
  preview_url?: string | null;
  source_image_sha256?: string | null;
  url: string;
  width?: number | null;
};

export type Phase5Product = {
  colours: unknown;
  current_production_match?: unknown;
  data_quality: {
    catalog_readiness: "CATALOG CANDIDATE" | "REVIEW BEFORE CATALOG";
    owner_review_required: boolean;
    review_notes: string[];
    [key: string]: unknown;
  };
  future_fields: Record<string, unknown>;
  identity: {
    brand_source_label?: string | null;
    category: string;
    normalized_internal_name: string;
    subcategory: string;
    [key: string]: unknown;
  };
  images: {
    source_references: Phase5SourceImage[];
  };
  internal_id: string;
  size_data: {
    chart?: {
      chart_scope?: string | null;
      measurements: unknown[];
      notes?: unknown;
      sizes: string[];
      source_album_id?: string | null;
      source_image_position?: number | null;
      source_image_sha256?: string | null;
      source_image_url?: string | null;
      units?: string | null;
      verification?: string | null;
      verification_date?: string | null;
    } | null;
    status: string;
  };
  source: {
    album_id?: string | null;
    last_checked?: string | null;
    source_id: string;
    supplier: string;
    url: string;
    [key: string]: unknown;
  };
  supplier_pricing: {
    currency?: string | null;
    price?: number | null;
    [key: string]: unknown;
  };
};

export type Phase5Catalog = {
  artifact_type: string;
  products: Phase5Product[];
  schema_version: string;
  summary: Record<string, unknown>;
};

export type Phase5Summary = {
  candidates: number;
  products: number;
  reviewBeforeCatalog: number;
  sourceImages: number;
  verifiedSizeCharts: number;
};

export function parseCatalog(value: unknown): Phase5Catalog {
  if (!value || typeof value !== "object") {
    throw new Error("Phase 5C1 catalog must be a JSON object.");
  }

  const candidate = value as Partial<Phase5Catalog>;
  if (!Array.isArray(candidate.products)) {
    throw new Error("Phase 5C1 catalog is missing its products array.");
  }

  for (const [index, product] of candidate.products.entries()) {
    if (
      !product ||
      typeof product.internal_id !== "string" ||
      !product.source ||
      !product.identity ||
      !product.images ||
      !Array.isArray(product.images.source_references) ||
      !product.data_quality ||
      !product.future_fields
    ) {
      throw new Error(`Product at index ${index} is structurally incomplete.`);
    }
  }

  return candidate as Phase5Catalog;
}

export function summarizeCatalog(catalog: Phase5Catalog): Phase5Summary {
  return catalog.products.reduce<Phase5Summary>(
    (summary, product) => {
      summary.products += 1;
      summary.sourceImages += product.images.source_references.length;
      if (product.size_data.status === "SIZE CHART VERIFIED") {
        summary.verifiedSizeCharts += 1;
      }
      if (product.data_quality.catalog_readiness === "CATALOG CANDIDATE") {
        summary.candidates += 1;
      }
      if (product.data_quality.catalog_readiness === "REVIEW BEFORE CATALOG") {
        summary.reviewBeforeCatalog += 1;
      }
      return summary;
    },
    {
      candidates: 0,
      products: 0,
      reviewBeforeCatalog: 0,
      sourceImages: 0,
      verifiedSizeCharts: 0,
    },
  );
}

export function assertExpectedCatalog(summary: Phase5Summary): void {
  for (const key of Object.keys(expectedPhase5) as Array<
    keyof typeof expectedPhase5
  >) {
    if (summary[key] !== expectedPhase5[key]) {
      throw new Error(
        `Phase 5C1 ${key} mismatch: expected ${expectedPhase5[key]}, received ${summary[key]}.`,
      );
    }
  }
}

export function privateReviewStatus(
  product: Phase5Product,
): "CANDIDATE" | "NEEDS_REVIEW" {
  return product.data_quality.catalog_readiness === "CATALOG CANDIDATE"
    ? "CANDIDATE"
    : "NEEDS_REVIEW";
}

export function taxonomySlug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

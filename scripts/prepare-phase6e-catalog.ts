import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import {
  assertExpectedCatalog,
  parseCatalog,
  summarizeCatalog,
} from "./lib/phase5-catalog";
import {
  catalogLocales,
  prepareCatalogIdentities,
  taxonomyNames,
} from "./lib/phase6e-catalog";

const expectedSha256 =
  "5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21";

function argument(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const file = path.resolve(
    argument("--file") ??
      process.env.PHASE5_CATALOG_PATH ??
      path.resolve(process.cwd(), "../phase5c1/final-master-catalog.json"),
  );
  const write = process.argv.includes("--write");
  const target = argument("--target");
  if (write && target !== "staging" && target !== "development") {
    throw new Error(
      "--write requires --target staging or --target development; production is refused.",
    );
  }

  const contents = await readFile(file);
  const sha256 = createHash("sha256").update(contents).digest("hex");
  if (sha256 !== expectedSha256) {
    throw new Error(`Phase 5C1 checksum mismatch: ${sha256}.`);
  }
  const catalog = parseCatalog(JSON.parse(contents.toString("utf8")));
  const sourceSummary = summarizeCatalog(catalog);
  assertExpectedCatalog(sourceSummary);
  const identities = prepareCatalogIdentities(catalog);

  if (!write) {
    console.log(
      JSON.stringify(
        {
          file,
          mode: "dry-run",
          preparedIdentities: identities.length,
          sha256,
          ...sourceSummary,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient();
  try {
    for (const category of await prisma.category.findMany({
      select: { id: true, slug: true },
    })) {
      const names = taxonomyNames(category.slug);
      for (const locale of catalogLocales) {
        await prisma.categoryTranslation.upsert({
          create: { categoryId: category.id, locale, name: names[locale] },
          update: { name: names[locale] },
          where: { categoryId_locale: { categoryId: category.id, locale } },
        });
      }
    }

    for (const identity of identities) {
      const product = await prisma.product.findUniqueOrThrow({
        select: { id: true, slug: true },
        where: { internalCode: identity.internalCode },
      });
      if (!product.slug) {
        await prisma.product.update({
          data: { slug: identity.slug },
          where: { id: product.id },
        });
      }
      for (const translation of identity.translations) {
        await prisma.productTranslation.upsert({
          create: {
            locale: translation.locale,
            name: translation.name,
            productId: product.id,
          },
          update: {},
          where: {
            productId_locale: {
              locale: translation.locale,
              productId: product.id,
            },
          },
        });
      }
    }

    const sourceByCode = new Map(
      catalog.products.map((product) => [product.internal_id, product]),
    );
    const prepared = await prisma.product.findMany({
      select: {
        internalCode: true,
        slug: true,
        sizeChart: {
          select: {
            evidence: { select: { sourceImageSha256: true } },
            reviewStatus: true,
          },
        },
        translations: { select: { locale: true } },
      },
      where: {
        internalCode: { in: identities.map((item) => item.internalCode) },
      },
    });

    let verifiedChartMappings = 0;
    for (const product of prepared) {
      const source = sourceByCode.get(product.internalCode);
      const sourceChart = source?.size_data.chart;
      if (source?.size_data.status === "SIZE CHART VERIFIED") {
        if (
          !product.sizeChart ||
          product.sizeChart.reviewStatus !== "APPROVED" ||
          product.sizeChart.evidence?.sourceImageSha256 !==
            (sourceChart?.source_image_sha256 ?? null)
        ) {
          throw new Error(
            `Size-chart evidence mismatch for ${product.internalCode}.`,
          );
        }
        verifiedChartMappings += 1;
      }
      if (!product.slug || product.translations.length !== 3) {
        throw new Error(
          `Incomplete prepared identity for ${product.internalCode}.`,
        );
      }
    }

    console.log(
      JSON.stringify(
        {
          mode: "write",
          preparedIdentities: prepared.length,
          sha256,
          target,
          verifiedChartMappings,
          ...sourceSummary,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

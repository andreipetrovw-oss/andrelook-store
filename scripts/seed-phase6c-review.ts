import { readFile } from "node:fs/promises";
import path from "node:path";

import { Locale, PrismaClient } from "@prisma/client";

import { parseCatalog, taxonomySlug } from "./lib/phase5-catalog";

const selection = [
  {
    code: "AL-SRC-CPREPSCN-218824597",
    presentation: "HANGING_GARMENT",
    ready: true,
  },
  {
    code: "AL-SRC-CPREPSCN-200087445",
    presentation: "HANGING_GARMENT",
    ready: true,
  },
  {
    code: "AL-SRC-KINGCN-209196603",
    presentation: "HANGING_GARMENT",
    ready: true,
  },
  {
    code: "AL-SRC-CPREPSCN-161312256",
    presentation: "FLAT_SURFACE",
    ready: true,
  },
  {
    code: "AL-SRC-CPREPSCN-161312020",
    presentation: "ACCESSORY_OBJECT",
    ready: false,
  },
] as const;

const taxonomy: Record<
  string,
  Record<Locale, { name: string; description: string }>
> = {
  Accessories: {
    RU: { name: "Аксессуары", description: "Аксессуары Andrelook" },
    ET: { name: "Aksessuaarid", description: "Andrelooki aksessuaarid" },
    EN: { name: "Accessories", description: "Andrelook accessories" },
  },
  Bottoms: {
    RU: { name: "Низ", description: "Брюки и шорты" },
    ET: { name: "Alaosad", description: "Püksid ja lühikesed püksid" },
    EN: { name: "Bottoms", description: "Trousers and shorts" },
  },
  Cardigans: {
    RU: { name: "Кардиганы", description: "Кардиганы" },
    ET: { name: "Kardiganid", description: "Kardiganid" },
    EN: { name: "Cardigans", description: "Cardigans" },
  },
  "Down jackets": {
    RU: { name: "Пуховики", description: "Пуховые куртки" },
    ET: { name: "Sulejoped", description: "Sulejoped" },
    EN: { name: "Down Jackets", description: "Down jackets" },
  },
  Headwear: {
    RU: { name: "Головные уборы", description: "Головные уборы" },
    ET: { name: "Peakatted", description: "Peakatted" },
    EN: { name: "Headwear", description: "Headwear" },
  },
  Knitwear: {
    RU: { name: "Трикотаж", description: "Трикотаж Andrelook" },
    ET: { name: "Kudumid", description: "Andrelooki kudumid" },
    EN: { name: "Knitwear", description: "Andrelook knitwear" },
  },
  Outerwear: {
    RU: { name: "Верхняя одежда", description: "Верхняя одежда Andrelook" },
    ET: { name: "Pealisrõivad", description: "Andrelooki pealisrõivad" },
    EN: { name: "Outerwear", description: "Andrelook outerwear" },
  },
  Shorts: {
    RU: { name: "Шорты", description: "Шорты" },
    ET: { name: "Lühikesed püksid", description: "Lühikesed püksid" },
    EN: { name: "Shorts", description: "Shorts" },
  },
  Vests: {
    RU: { name: "Жилеты", description: "Жилеты" },
    ET: { name: "Vestid", description: "Vestid" },
    EN: { name: "Vests", description: "Vests" },
  },
};

const pendingDescription: Record<Locale, string> = {
  RU: "Описание, цена, цвета и наличие ожидают подтверждения владельца.",
  ET: "Kirjeldus, hind, värvid ja saadavus ootavad omaniku kinnitust.",
  EN: "Description, price, colours and availability await owner approval.",
};

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const catalogPath = path.resolve(
    process.env.PHASE5_CATALOG_PATH ??
      path.join(process.cwd(), "../../phase5c1/final-master-catalog.json"),
  );
  const catalog = parseCatalog(JSON.parse(await readFile(catalogPath, "utf8")));
  const prisma = new PrismaClient();

  try {
    for (const selected of selection) {
      const source = catalog.products.find(
        (product) => product.internal_id === selected.code,
      );
      if (!source) throw new Error(`Missing golden product ${selected.code}.`);

      const parentSlug = taxonomySlug(source.identity.category);
      const childSlug = taxonomySlug(source.identity.subcategory);
      const parent = await prisma.category.findUniqueOrThrow({
        where: { slug: parentSlug },
      });
      const child = await prisma.category.findUniqueOrThrow({
        where: { slug: childSlug },
      });

      for (const locale of Object.values(Locale)) {
        const parentCopy = taxonomy[source.identity.category]?.[locale];
        const childCopy = taxonomy[source.identity.subcategory]?.[locale];
        if (!parentCopy || !childCopy) {
          throw new Error(
            `Missing taxonomy copy for ${source.identity.category}/${source.identity.subcategory}.`,
          );
        }
        await prisma.categoryTranslation.upsert({
          create: { categoryId: parent.id, locale, ...parentCopy },
          update: parentCopy,
          where: { categoryId_locale: { categoryId: parent.id, locale } },
        });
        await prisma.categoryTranslation.upsert({
          create: { categoryId: child.id, locale, ...childCopy },
          update: childCopy,
          where: { categoryId_locale: { categoryId: child.id, locale } },
        });
      }

      const product = await prisma.product.update({
        data: {
          availabilityType: null,
          categoryId: child.id,
          currency: null,
          preorderEstimateText: null,
          publicationStatus: selected.ready ? "READY" : "DRAFT",
          publishedAt: null,
          retailPriceMinor: null,
          slug: slugify(source.identity.normalized_internal_name),
        },
        where: { internalCode: selected.code },
      });

      for (const locale of Object.values(Locale)) {
        const copy = {
          description: pendingDescription[locale],
          name: source.identity.normalized_internal_name,
          seoDescription: null,
          seoTitle: null,
          shortDescription: pendingDescription[locale],
        };
        await prisma.productTranslation.upsert({
          create: { productId: product.id, locale, ...copy },
          update: copy,
          where: { productId_locale: { productId: product.id, locale } },
        });
      }

      await prisma.productPrivate.update({
        data: {
          internalNotes: [
            source.data_quality.review_notes.join("\n"),
            `Phase 6C presentation template: ${selected.presentation}.`,
            selected.ready
              ? "READY for owner review only; not approved for public publication."
              : "Held in DRAFT because Phase 5C1 requires owner review.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
        where: { productId: product.id },
      });
    }

    console.log(
      JSON.stringify(
        {
          draft: selection
            .filter((item) => !item.ready)
            .map((item) => item.code),
          readyForOwnerReview: selection
            .filter((item) => item.ready)
            .map((item) => item.code),
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

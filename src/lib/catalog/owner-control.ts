import "server-only";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import {
  AvailabilityType,
  ImageRole,
  Locale,
  Prisma,
  ReviewDecision,
  SourceReviewStatus,
} from "@prisma/client";
import sharp from "sharp";
import { z } from "zod";

import { requireActiveAdmin } from "@/lib/admin/identity";
import { getPrisma } from "@/lib/db";

import {
  assertPublicationReady,
  evaluatePublicationReadiness,
} from "./readiness";

const productIdSchema = z.string().min(1);

const commercialSchema = z.object({
  availabilityType: z.enum(AvailabilityType),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  preorderEstimateText: z.string().trim().max(300).optional(),
  productId: productIdSchema,
  retailPrice: z.coerce.number().positive().max(1_000_000),
});

const contentSchema = z.object({
  descriptionEN: z.string().trim().min(1).max(2_000),
  descriptionET: z.string().trim().min(1).max(2_000),
  descriptionRU: z.string().trim().min(1).max(2_000),
  nameEN: z.string().trim().min(1).max(200),
  nameET: z.string().trim().min(1).max(200),
  nameRU: z.string().trim().min(1).max(200),
  productId: productIdSchema,
});

const reviewSchema = z.object({
  blockingIssues: z.string().max(4_000).optional(),
  categoryDecision: z.enum(ReviewDecision),
  commercialDecision: z.enum(ReviewDecision),
  contentDecision: z.enum(ReviewDecision),
  identityDecision: z.enum(ReviewDecision),
  imageDecision: z.enum(ReviewDecision),
  optionsDecision: z.enum(ReviewDecision),
  ownerPublicationApproved: z.boolean(),
  productId: productIdSchema,
  sizeDecision: z.enum(ReviewDecision),
  visualDecision: z.enum(ReviewDecision),
});

const sourceImageReviewSchema = z.object({
  assignedSourceRole: z.enum(ImageRole),
  imageId: z.string().min(1),
  productId: productIdSchema,
  reviewStatus: z.enum(SourceReviewStatus),
});

const colorLineSchema = z.object({
  code: z.string().trim().min(1).max(40),
  en: z.string().trim().min(1).max(80),
  et: z.string().trim().min(1).max(80),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable(),
  ru: z.string().trim().min(1).max(80),
});

export type OwnerOptionsInput = {
  colors: string;
  productId: string;
  sizes: string;
};

function auditJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseLines(value: string) {
  return [
    ...new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function parseColors(value: string) {
  if (!value.trim()) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, ru, et, en, rawHex] = line
        .split("|")
        .map((item) => item.trim());
      return colorLineSchema.parse({
        code,
        en,
        et,
        hex: rawHex || null,
        ru,
      });
    });
}

async function createAuditEvent(
  tx: Prisma.TransactionClient,
  input: {
    action: string;
    adminId: string;
    after: unknown;
    before: unknown;
    note?: string;
    productId: string;
  },
) {
  await tx.productReviewEvent.create({
    data: {
      action: input.action,
      afterState: auditJson(input.after),
      beforeState: auditJson(input.before),
      changedByAdminId: input.adminId,
      note: input.note,
      productId: input.productId,
    },
  });
}

async function resetAffectedReview(
  tx: Prisma.TransactionClient,
  productId: string,
  adminId: string,
  field:
    | "commercialDecision"
    | "contentDecision"
    | "optionsDecision"
    | "imageDecision",
) {
  await tx.productReview.upsert({
    create: {
      productId,
      reviewedByAdminId: adminId,
      [field]: "NEEDS_REVISION",
    },
    update: {
      [field]: "NEEDS_REVISION",
      ownerApprovedAt: null,
      ownerPublicationApproved: false,
      reviewedByAdminId: adminId,
    },
    where: { productId },
  });
}

export async function updateCommercialFields(raw: unknown) {
  const input = commercialSchema.parse(raw);
  const admin = await requireActiveAdmin();
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const before = await tx.product.findUniqueOrThrow({
      select: {
        availabilityType: true,
        currency: true,
        preorderEstimateText: true,
        retailPriceMinor: true,
      },
      where: { id: input.productId },
    });
    const after = await tx.product.update({
      data: {
        availabilityType: input.availabilityType,
        currency: input.currency,
        preorderEstimateText: input.preorderEstimateText || null,
        retailPriceMinor: Math.round(input.retailPrice * 100),
      },
      select: {
        availabilityType: true,
        currency: true,
        preorderEstimateText: true,
        retailPriceMinor: true,
      },
      where: { id: input.productId },
    });
    await resetAffectedReview(
      tx,
      input.productId,
      admin.id,
      "commercialDecision",
    );
    await createAuditEvent(tx, {
      action: "COMMERCIAL_FIELDS_UPDATED",
      adminId: admin.id,
      after,
      before,
      productId: input.productId,
    });
  });
}

export async function updateLocalizedContent(raw: unknown) {
  const input = contentSchema.parse(raw);
  const admin = await requireActiveAdmin();
  const prisma = getPrisma();
  const content = [
    { description: input.descriptionRU, locale: Locale.RU, name: input.nameRU },
    { description: input.descriptionET, locale: Locale.ET, name: input.nameET },
    { description: input.descriptionEN, locale: Locale.EN, name: input.nameEN },
  ];

  await prisma.$transaction(async (tx) => {
    const before = await tx.productTranslation.findMany({
      orderBy: { locale: "asc" },
      where: { productId: input.productId },
    });
    for (const translation of content) {
      await tx.productTranslation.upsert({
        create: { ...translation, productId: input.productId },
        update: {
          description: translation.description,
          name: translation.name,
        },
        where: {
          productId_locale: {
            locale: translation.locale,
            productId: input.productId,
          },
        },
      });
    }
    await resetAffectedReview(tx, input.productId, admin.id, "contentDecision");
    await createAuditEvent(tx, {
      action: "LOCALIZED_CONTENT_UPDATED",
      adminId: admin.id,
      after: content,
      before,
      productId: input.productId,
    });
  });
}

export async function updateProductOptions(raw: OwnerOptionsInput) {
  const productId = productIdSchema.parse(raw.productId);
  const sizes = parseLines(raw.sizes);
  const colors = parseColors(raw.colors);
  if (!sizes.length)
    throw new Error("Укажите хотя бы один подтверждённый размер.");
  if (!colors.length)
    throw new Error("Укажите хотя бы один подтверждённый цвет.");

  const admin = await requireActiveAdmin();
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({
      include: { colors: { include: { translations: true } }, variants: true },
      where: { id: productId },
    });
    const before = { colors: product.colors, variants: product.variants };

    await tx.productVariant.deleteMany({ where: { productId } });
    await tx.productColor.deleteMany({ where: { productId } });
    const createdColors = [];
    for (const [index, color] of colors.entries()) {
      const created = await tx.productColor.create({
        data: {
          code: color.code,
          productId,
          reviewStatus: "APPROVED",
          sortOrder: index,
          swatchHex: color.hex,
          translations: {
            create: [
              { locale: "RU", name: color.ru },
              { locale: "ET", name: color.et },
              { locale: "EN", name: color.en },
            ],
          },
        },
      });
      createdColors.push(created);
    }
    for (const color of createdColors) {
      for (const size of sizes) {
        await tx.productVariant.create({
          data: {
            colorId: color.id,
            isEnabled: true,
            productId,
            sizeLabel: size,
            variantKey: `${color.code}:${size}`,
          },
        });
      }
    }
    await resetAffectedReview(tx, productId, admin.id, "optionsDecision");
    await createAuditEvent(tx, {
      action: "CUSTOMER_OPTIONS_UPDATED",
      adminId: admin.id,
      after: { colors, sizes },
      before,
      productId,
    });
  });
}

export async function updateSourceImageReview(raw: unknown) {
  const input = sourceImageReviewSchema.parse(raw);
  const admin = await requireActiveAdmin();
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const before = await tx.productSourceImage.findFirstOrThrow({
      where: { id: input.imageId, productId: input.productId },
    });
    const after = await tx.productSourceImage.update({
      data: {
        assignedSourceRole: input.assignedSourceRole,
        reviewStatus: input.reviewStatus,
      },
      where: { id: input.imageId },
    });
    await resetAffectedReview(tx, input.productId, admin.id, "imageDecision");
    await createAuditEvent(tx, {
      action: "SOURCE_IMAGE_REVIEWED",
      adminId: admin.id,
      after,
      before,
      productId: input.productId,
    });
  });
}

const uploadSchema = z.object({
  altEN: z.string().trim().min(1).max(300),
  altET: z.string().trim().min(1).max(300),
  altRU: z.string().trim().min(1).max(300),
  fidelityApproved: z.literal("yes"),
  productId: productIdSchema,
  role: z.enum(ImageRole),
  sourceImageId: z.string().min(1),
});

export async function approveAndStorePublicImage(raw: unknown, file: File) {
  const input = uploadSchema.parse(raw);
  if (!(file instanceof File) || file.size === 0 || file.size > 15_000_000) {
    throw new Error("Добавьте версию Studio размером до 15 МБ.");
  }
  const admin = await requireActiveAdmin();
  const prisma = getPrisma();
  const source = await prisma.productSourceImage.findFirstOrThrow({
    where: {
      id: input.sourceImageId,
      productId: input.productId,
      reviewStatus: "APPROVED",
    },
  });
  const bytes = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error(
      "Загруженный файл не является поддерживаемым изображением.",
    );
  }
  if (
    !["avif", "jpeg", "png", "webp"].includes(metadata.format) ||
    metadata.width * metadata.height > 50_000_000
  ) {
    throw new Error("Формат или размер изображения не поддерживается.");
  }

  const extension = metadata.format === "jpeg" ? "jpg" : metadata.format;
  const storageKey = `andrelook-v1/phase6d/${input.productId}/${randomUUID()}.${extension}`;
  const blob = await put(storageKey, bytes, {
    access: "public",
    addRandomSuffix: false,
    contentType:
      metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`,
  });

  try {
    await prisma.$transaction(async (tx) => {
      const image = await tx.productImage.create({
        data: {
          approvedAt: new Date(),
          approvedByAdminId: admin.id,
          height: metadata.height!,
          productId: input.productId,
          reviewStatus: "APPROVED",
          role: input.role,
          sortOrder: source.sourcePosition,
          sourceImageId: source.id,
          storageKey,
          translations: {
            create: [
              { altText: input.altRU, locale: "RU" },
              { altText: input.altET, locale: "ET" },
              { altText: input.altEN, locale: "EN" },
            ],
          },
          url: blob.url,
          width: metadata.width!,
        },
      });
      await resetAffectedReview(tx, input.productId, admin.id, "imageDecision");
      await createAuditEvent(tx, {
        action: "PUBLIC_IMAGE_FIDELITY_APPROVED",
        adminId: admin.id,
        after: {
          imageId: image.id,
          role: image.role,
          sourceImageId: source.id,
          storageKey,
        },
        before: { sourceImageId: source.id },
        note: "Owner explicitly confirmed SOURCE vs STUDIO fidelity.",
        productId: input.productId,
      });
    });
  } catch (error) {
    await del(blob.url);
    throw error;
  }
}

function readinessSelect() {
  return {
    availabilityType: true,
    categoryId: true,
    currency: true,
    images: {
      select: { approvedAt: true, reviewStatus: true },
      where: { role: "PRIMARY" as const },
    },
    retailPriceMinor: true,
    review: true,
    sizeChart: { select: { isPublished: true, reviewStatus: true } },
    slug: true,
    translations: { select: { description: true, locale: true, name: true } },
    variants: { select: { id: true }, where: { isEnabled: true } },
  } satisfies Prisma.ProductSelect;
}

export async function updateOwnerReview(raw: unknown) {
  const input = reviewSchema.parse(raw);
  const admin = await requireActiveAdmin();
  const prisma = getPrisma();
  const blockingIssues = parseLines(input.blockingIssues ?? "");

  await prisma.$transaction(async (tx) => {
    const before = await tx.productReview.findUnique({
      where: { productId: input.productId },
    });
    const reviewData = {
      blockingIssues,
      categoryDecision: input.categoryDecision,
      commercialDecision: input.commercialDecision,
      contentDecision: input.contentDecision,
      identityDecision: input.identityDecision,
      imageDecision: input.imageDecision,
      optionsDecision: input.optionsDecision,
      ownerApprovedAt: input.ownerPublicationApproved ? new Date() : null,
      ownerPublicationApproved: input.ownerPublicationApproved,
      reviewedByAdminId: admin.id,
      sizeDecision: input.sizeDecision,
      visualDecision: input.visualDecision,
    };
    const after = await tx.productReview.upsert({
      create: { ...reviewData, productId: input.productId },
      update: reviewData,
      where: { productId: input.productId },
    });
    if (input.ownerPublicationApproved) {
      const product = await tx.product.findUniqueOrThrow({
        select: readinessSelect(),
        where: { id: input.productId },
      });
      assertPublicationReady({
        ...product,
        enabledVariantCount: product.variants.length,
        primaryImages: product.images,
      });
    }
    await createAuditEvent(tx, {
      action: "OWNER_REVIEW_UPDATED",
      adminId: admin.id,
      after,
      before: before ?? {},
      productId: input.productId,
    });
  });
}

export async function getProductReadiness(productId: string) {
  productIdSchema.parse(productId);
  await requireActiveAdmin();
  const product = await getPrisma().product.findUniqueOrThrow({
    select: readinessSelect(),
    where: { id: productId },
  });
  return evaluatePublicationReadiness({
    ...product,
    enabledVariantCount: product.variants.length,
    primaryImages: product.images,
  });
}

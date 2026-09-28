import "server-only";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";

import { evaluatePublicationReadiness } from "./readiness";

export async function getPrivateCatalogProduct(productId: string) {
  await requireOwner();

  return getPrisma().product.findUnique({
    include: {
      category: { include: { translations: true } },
      colors: {
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      },
      images: {
        include: { sourceImage: true, translations: true },
        orderBy: { sortOrder: "asc" },
      },
      privateData: {
        select: {
          sourceReviewStatus: true,
          supplierName: true,
          supplierProductCode: true,
        },
      },
      review: true,
      reviewEvents: {
        include: { changedByAdmin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      sizeChart: { include: { evidence: true } },
      sourceImages: { orderBy: { sourcePosition: "asc" } },
      studioCandidates: {
        include: {
          ownerReviewedByAdmin: { select: { email: true } },
          sources: {
            include: {
              sourceImage: {
                select: {
                  assignedSourceRole: true,
                  id: true,
                  sourcePosition: true,
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: [{ role: "asc" }, { version: "desc" }],
      },
      translations: true,
      variants: { orderBy: [{ sizeLabel: "asc" }, { variantKey: "asc" }] },
    },
    where: { id: productId },
  });
}

export async function getPrivateCatalogProductWorkspace(productId: string) {
  const product = await getPrivateCatalogProduct(productId);
  if (!product) return null;

  return {
    product,
    readiness: evaluatePublicationReadiness({
      ...product,
      enabledVariantCount: product.variants.filter((item) => item.isEnabled)
        .length,
      primaryImages: product.images,
    }),
  };
}

export async function getPrivateStudioCandidate(candidateId: string) {
  await requireOwner();

  return getPrisma().studioCandidate.findUnique({
    select: {
      id: true,
      privateBlobUrl: true,
      productId: true,
      status: true,
    },
    where: { id: candidateId },
  });
}

export async function getPrivateSourceImage(imageId: string) {
  await requireOwner();

  return getPrisma().productSourceImage.findUnique({
    select: {
      previewUrl: true,
      product: {
        select: {
          privateData: { select: { supplierAlbumUrl: true } },
        },
      },
      sourceUrl: true,
    },
    where: { id: imageId },
  });
}

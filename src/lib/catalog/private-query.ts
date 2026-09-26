import "server-only";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";

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
      privateData: true,
      review: true,
      reviewEvents: {
        include: { changedByAdmin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      sizeChart: { include: { evidence: true } },
      sourceImages: { orderBy: { sourcePosition: "asc" } },
      translations: true,
      variants: { orderBy: [{ sizeLabel: "asc" }, { variantKey: "asc" }] },
    },
    where: { id: productId },
  });
}

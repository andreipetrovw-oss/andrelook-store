import "server-only";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";

export async function getPrivateCatalogProduct(productId: string) {
  await requireOwner();

  return getPrisma().product.findUnique({
    include: {
      privateData: true,
      sizeChart: { include: { evidence: true } },
      sourceImages: { orderBy: { sourcePosition: "asc" } },
      translations: true,
    },
    where: { id: productId },
  });
}

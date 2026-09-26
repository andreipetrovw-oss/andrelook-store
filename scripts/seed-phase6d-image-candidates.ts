import { PrismaClient } from "@prisma/client";

const candidates: Record<string, Record<number, string>> = {
  "AL-SRC-CPREPSCN-218824597": {
    1: "SIZE_CHART",
    2: "PRIMARY",
    3: "FRONT",
    4: "BACK",
    5: "INTERIOR",
    6: "DETAIL",
    7: "DETAIL",
    8: "DETAIL",
    9: "DETAIL",
    10: "DETAIL",
    11: "DETAIL",
    12: "BRANDING",
    15: "BRANDING",
    16: "BRANDING",
    17: "BRANDING",
    18: "BRANDING",
    19: "BRANDING",
    20: "BRANDING",
    21: "BRANDING",
  },
  "AL-SRC-CPREPSCN-200087445": {
    1: "SIZE_CHART",
    2: "PRIMARY",
    5: "FRONT",
    6: "BACK",
    9: "INTERIOR",
    11: "DETAIL",
    14: "BRANDING",
    15: "DETAIL",
    16: "BRANDING",
    17: "DETAIL",
    18: "DETAIL",
    20: "DETAIL",
    24: "DETAIL",
    25: "DETAIL",
    26: "BRANDING",
    27: "BRANDING",
    28: "BRANDING",
    29: "BRANDING",
    30: "BRANDING",
    31: "BRANDING",
    32: "BRANDING",
    33: "BRANDING",
  },
  "AL-SRC-KINGCN-209196603": {
    1: "SIZE_CHART",
    2: "PRIMARY",
    3: "FRONT",
    4: "BACK",
    5: "ALTERNATIVE",
  },
  "AL-SRC-CPREPSCN-161312256": {
    1: "SIZE_CHART",
    2: "PRIMARY",
    7: "FRONT",
    8: "BACK",
    10: "ALTERNATIVE",
    12: "FRONT",
    13: "ALTERNATIVE",
    14: "ALTERNATIVE",
    15: "ALTERNATIVE",
    16: "DETAIL",
    17: "DETAIL",
    18: "DETAIL",
    19: "DETAIL",
    20: "DETAIL",
    21: "DETAIL",
    22: "ALTERNATIVE",
    23: "DETAIL",
    24: "DETAIL",
    25: "DETAIL",
    26: "BRANDING",
    27: "BRANDING",
    28: "BRANDING",
    29: "BRANDING",
    30: "BRANDING",
    31: "BRANDING",
    32: "BRANDING",
  },
};

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const prisma = new PrismaClient();
  let updated = 0;
  try {
    for (const [internalCode, positions] of Object.entries(candidates)) {
      const product = await prisma.product.findUniqueOrThrow({
        select: { id: true },
        where: { internalCode },
      });
      for (const [position, assignedSourceRole] of Object.entries(positions)) {
        await prisma.productSourceImage.update({
          data: {
            assignedSourceRole,
            reviewStatus: "NEEDS_REVIEW",
          },
          where: {
            productId_sourcePosition: {
              productId: product.id,
              sourcePosition: Number(position),
            },
          },
        });
        updated += 1;
      }
    }
    console.log(JSON.stringify({ candidateAssignments: updated }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { readFile, writeFile } from "node:fs/promises";

import {
  assertPhase6fLaunchCatalog,
  phase6fCatalogPath,
  type LaunchProduct,
} from "./lib/phase6f-launch";

const retiredCode = "AL-LEGACY-006";

const prices: Record<string, number> = {
  "AL-LEGACY-001": 25_900,
  "AL-LEGACY-002": 28_900,
  "AL-LEGACY-003": 27_900,
  "AL-LEGACY-004": 22_900,
  "AL-LEGACY-005": 21_900,
  "AL-LEGACY-007": 21_900,
  "AL-LEGACY-008": 19_900,
  "AL-LEGACY-009": 18_900,
  "AL-LEGACY-010": 19_900,
  "AL-LEGACY-011": 20_900,
  "AL-LEGACY-012": 24_900,
  "AL-LEGACY-013": 23_900,
  "AL-LEGACY-014": 19_900,
  "AL-LEGACY-015": 21_900,
  "AL-LEGACY-016": 21_900,
  "AL-LEGACY-017": 6_900,
  "AL-LEGACY-018": 7_900,
  "AL-LEGACY-019": 7_900,
  "AL-LEGACY-020": 14_900,
  "AL-LEGACY-021": 11_900,
  "AL-LEGACY-022": 7_900,
  "AL-LEGACY-023": 6_900,
};

type SizeChart = NonNullable<LaunchProduct["sizeChart"]>;

function exactChart(input: {
  albumId: string;
  imageName: string;
  imageSha256: string;
  imageUrl: string;
  measurements: SizeChart["chartData"]["measurements"];
  sizes: string[];
}): SizeChart {
  return {
    chartData: {
      measurements: input.measurements,
      sizes: input.sizes,
    },
    evidence: {
      chartScope: null,
      notes: [
        `Exact first source image: ${input.imageName}`,
        "The source chart does not print a measurement unit; no unit was inferred.",
        "The source chart does not explicitly identify garment measurements versus body measurements; no scope was inferred.",
        'The source label "Bust" is preserved exactly; the chart does not explicitly state width/half-chest versus circumference.',
      ],
      sourceAlbumId: input.albumId,
      sourceImagePosition: 1,
      sourceImageSha256: input.imageSha256,
      sourceImageUrl: input.imageUrl,
      verification: "OWNER_EXACT_SOURCE_AND_VISUALLY_VERIFIED",
      verificationDate: "2026-10-07",
    },
    units: null,
  };
}

const charts: Record<string, SizeChart> = {
  "AL-LEGACY-009": exactChart({
    albumId: "209196360",
    imageName: "classical wool cardigan size.jpeg",
    imageSha256:
      "07d52e592409c40a1e121f96b608f73085efdd18f13d9260c219724d867dac3b",
    imageUrl: "https://photo.yupoo.com/kingcn/1c350fe8/27c49ab7.jpeg",
    measurements: [
      { name: "Back Length", values: [59.5, 61.5, 63.5, 65.5, 67.5] },
      { name: "Clothes Length", values: [60.5, 62.5, 64.5, 66.5, 68.5] },
      { name: "Shoulder", values: [41.5, 43.5, 45.5, 47.5, 49] },
      { name: "Bust", values: [52, 54, 56, 58, 60] },
      { name: "Sleeve", values: [62, 63, 64, 65, 66] },
    ],
    sizes: ["S/1", "M/2", "L/3", "XL/4", "XXL/5"],
  }),
  "AL-LEGACY-013": exactChart({
    albumId: "203151534",
    imageName: "sizeinfo",
    imageSha256:
      "c9986bc9f7afcde98fe079ce11e42d11e2c1b0a1a483f2735016355b6b834894",
    imageUrl: "https://photo.yupoo.com/repsking/1e8638b2/d3fb76ed.jpeg",
    measurements: [
      { name: "Bust", values: [51.5, 54, 56.5, 59, 61.5] },
      { name: "Clothes Length", values: [65, 67, 69, 71, 73] },
      { name: "Sleeve", values: [62, 63.5, 65, 66.5, 68] },
      { name: "Shoulder", values: [45, 47, 49, 51, 53] },
    ],
    sizes: ["S/1", "M/2", "L/3", "XL/4", "XXL/5"],
  }),
  "AL-LEGACY-019": exactChart({
    albumId: "198289561",
    imageName: "69、Blurred Logo T-shirt.png",
    imageSha256:
      "c56cd616f31918fd656883e95b9906a66b38150c30f9e53ba035051ac70d7240",
    imageUrl: "https://photo.yupoo.com/repsking/83d6c6c7/e7935fd1.jpeg",
    measurements: [
      { name: "Clothes Length", values: [68, 70, 72, 74, 76] },
      { name: "Shoulder", values: [44, 45, 46, 47, 48] },
      { name: "Bust", values: [53, 55, 57, 59, 61] },
      { name: "Sleeve", values: [22, 22.5, 23, 23.5, 24] },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  }),
  "AL-LEGACY-020": exactChart({
    albumId: "209196624",
    imageName: "11、帽子条纹卫衣.png",
    imageSha256:
      "e31d1de4b0a7a7d1bf83bd16e6c227d1b678579f7ffa0372f882b782b6ccc467",
    imageUrl: "https://photo.yupoo.com/kingcn/7f60065d/2b93ba7d.jpeg",
    measurements: [
      { name: "Back Length", values: [63.5, 65.5, 67.5, 69.5, 71.5] },
      { name: "Clothes Length", values: [65, 67, 69, 71, 73] },
      { name: "Shoulder", values: [44, 46, 48, 50, 52] },
      { name: "Bust", values: [53, 55, 57, 59, 61] },
      { name: "Sleeve", values: [64, 65, 66, 67, 68] },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  }),
  "AL-LEGACY-022": exactChart({
    albumId: "209196436",
    imageName: "5、后领织带POLO.png",
    imageSha256:
      "b41b57ee48e63211d9fe7fb0c5fa54bafb303479802d7c5af049fd1b7c1f1800",
    imageUrl: "https://photo.yupoo.com/kingcn/11663348/c8b1c86a.jpeg",
    measurements: [
      { name: "Back Length", values: [68, 70, 72, 74, 76] },
      { name: "Shoulder", values: [41.6, 43.2, 44.8, 46.4, 48] },
      { name: "Bust", values: [48, 50, 53, 56, 59] },
      { name: "Sleeve", values: [19.3, 19.6, 19.9, 20.2, 20.5] },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  }),
};

async function main() {
  const catalog = JSON.parse(await readFile(phase6fCatalogPath, "utf8")) as {
    products: LaunchProduct[];
    summary: Record<string, number>;
  };

  for (const product of catalog.products) {
    if (product.internalCode === retiredCode) {
      product.publicationStatus = "DRAFT";
      product.retailPriceMinor = null;
      product.sizeChart = null;
      continue;
    }
    const price = prices[product.internalCode];
    if (!price)
      throw new Error(`Missing owner-approved price: ${product.internalCode}`);
    product.publicationStatus = "READY";
    product.retailPriceMinor = price;
    const chart = charts[product.internalCode];
    if (chart) product.sizeChart = chart;
  }

  catalog.summary = {
    imageCount: 53,
    mappedSizeChartCount: 22,
    ownerApprovedPriceCount: 22,
    productCount: 23,
    publicProductCount: 22,
    retiredPrivateProductCount: 1,
    unresolvedPublicSizeChartCount: 0,
  };

  assertPhase6fLaunchCatalog(catalog);
  await writeFile(phase6fCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(JSON.stringify(catalog.summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDictionary } from "@/i18n/dictionaries";
import { parseSizeChart } from "@/lib/catalog/size-chart";
import { readPhase6fLaunchCatalog } from "../../scripts/lib/phase6f-launch";

import { SizeGuide } from "./size-guide";

describe("Jayden owner-confirmed size correction", () => {
  it("renders L/3 garment length 69 in ET, RU and EN without changing other measurements", async () => {
    const catalog = await readPhase6fLaunchCatalog();
    const jayden = catalog.products.find(
      (product) => product.internalCode === "AL-LEGACY-015",
    );
    if (!jayden) throw new Error("Jayden product missing");
    expect(jayden?.translations.map((translation) => translation.name)).toEqual(
      [
        "Parajumpers Jayden Hybrid Cardigan",
        "Parajumpers Jayden Hybrid Cardigan",
        "Parajumpers Jayden Hybrid Cardigan",
      ],
    );
    const chart = parseSizeChart(jayden?.sizeChart?.chartData);
    expect(chart).toEqual({
      measurements: [
        { name: "Bust", values: [52.5, 55, 57.5, 60, 62.5] },
        { name: "Clothes length", values: [65, 67, 69, 71, 73] },
        { name: "Sleeve", values: [65.5, 67, 68.5, 70, 71.5] },
        { name: "Shoulder", values: [43.5, 45, 46.5, 48, 49.5] },
      ],
      sizes: ["S/1", "M/2", "L/3", "XL/4", "XXL/5"],
    });
    if (!chart) throw new Error("Jayden chart missing");

    for (const [locale, label] of [
      ["et", "Rõiva pikkus"],
      ["ru", "Длина изделия"],
      ["en", "Garment length"],
    ] as const) {
      const html = renderToStaticMarkup(
        createElement(SizeGuide, {
          chart,
          dictionary: getDictionary(locale),
          locale,
          units: jayden.sizeChart?.units ?? null,
        }),
      );
      expect(html).toContain(label);
      expect(html).toMatch(/<th scope="col">L\/3<\/th>/);
      expect(html).toMatch(
        new RegExp(
          `<th scope="row">${label}<\\/th>(?:<td[^>]*>[^<]*<\\/td>){2}<td[^>]*>69<\\/td>`,
        ),
      );
      expect(html).not.toContain(">79</td>");
    }
  });
});

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/config/locales";
import type { SizeChartTable } from "@/lib/catalog/size-chart";

const measurementLabels: Record<Locale, Record<string, string>> = {
  en: {
    bust: "Bust",
    chest: "Chest",
    "clothes length": "Garment length",
    hips: "Hips",
    inseam: "Inseam",
    length: "Length",
    shoulder: "Shoulder",
    sleeve: "Sleeve",
    waist: "Waist",
  },
  et: {
    bust: "Rinnaümbermõõt",
    chest: "Rind",
    "clothes length": "Rõiva pikkus",
    hips: "Puus",
    inseam: "Sisesäär",
    length: "Pikkus",
    shoulder: "Õlg",
    sleeve: "Varrukas",
    waist: "Vöö",
  },
  ru: {
    bust: "Обхват груди",
    chest: "Грудь",
    "clothes length": "Длина изделия",
    hips: "Бёдра",
    inseam: "Внутренний шов",
    length: "Длина",
    shoulder: "Плечо",
    sleeve: "Рукав",
    waist: "Талия",
  },
};

export function localizeMeasurementLabel(locale: Locale, label: string) {
  return measurementLabels[locale][label.trim().toLowerCase()] ?? label;
}

export function SizeGuide({
  chart,
  dictionary,
  locale,
  units,
}: {
  chart: SizeChartTable;
  dictionary: Dictionary;
  locale: Locale;
  units: string | null;
}) {
  return (
    <details className="size-guide">
      <summary>{dictionary.sizeGuide}</summary>
      <div className="table-scroll" tabIndex={0}>
        <table>
          <caption>
            {dictionary.sizeGuide}
            {units ? ` (${units})` : ""}
          </caption>
          <thead>
            <tr>
              <th scope="col">—</th>
              {chart.sizes.map((size) => (
                <th key={size} scope="col">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.measurements.map((measurement) => (
              <tr key={measurement.name}>
                <th scope="row">
                  {localizeMeasurementLabel(locale, measurement.name)}
                </th>
                {measurement.values.map((value, index) => (
                  <td key={`${measurement.name}-${chart.sizes[index]}`}>
                    {value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="size-guide-note">{dictionary.sizeGuideNote}</p>
    </details>
  );
}

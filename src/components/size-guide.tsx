import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/config/locales";
import type { SizeChartTable } from "@/lib/catalog/size-chart";

const measurementLabels: Record<Locale, Record<string, string>> = {
  en: {
    bust: "Bust",
    "clothes length": "Garment length",
    shoulder: "Shoulder",
    sleeve: "Sleeve",
  },
  et: {
    bust: "Rinnaümbermõõt",
    "clothes length": "Rõiva pikkus",
    shoulder: "Õlg",
    sleeve: "Varrukas",
  },
  ru: {
    bust: "Обхват груди",
    "clothes length": "Длина изделия",
    shoulder: "Плечо",
    sleeve: "Рукав",
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
    </details>
  );
}

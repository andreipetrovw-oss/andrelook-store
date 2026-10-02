import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/config/locales";
import type { SizeChartTable } from "@/lib/catalog/size-chart";

const measurementLabels: Record<Locale, Record<string, string>> = {
  en: {
    "1/2 waist": "Half waist",
    "back length": "Back length",
    bust: "Bust",
    chest: "Chest",
    "clothes length": "Garment length",
    "hip girt": "Hip girth",
    "hip width": "Hip width",
    hips: "Hips",
    inseam: "Inseam",
    length: "Length",
    "pants length": "Trousers length",
    shoulder: "Shoulder",
    "shoulder + sleeve": "Shoulder + sleeve",
    sleeve: "Sleeve",
    "sleeve + shoulder": "Sleeve + shoulder",
    "sleeve length": "Sleeve length",
    "trousers length": "Trousers length",
    waist: "Waist",
    "waist girth": "Waist girth",
    "zipper length": "Zipper length",
  },
  et: {
    "1/2 waist": "Pool vööümbermõõtu",
    "back length": "Seljapikkus",
    bust: "Rinnaümbermõõt",
    chest: "Rind",
    "clothes length": "Rõiva pikkus",
    "hip girt": "Puusaümbermõõt",
    "hip width": "Puusalaius",
    hips: "Puus",
    inseam: "Sisesäär",
    length: "Pikkus",
    "pants length": "Pükste pikkus",
    shoulder: "Õlg",
    "shoulder + sleeve": "Õlg + varrukas",
    sleeve: "Varrukas",
    "sleeve + shoulder": "Varrukas + õlg",
    "sleeve length": "Varruka pikkus",
    "trousers length": "Pükste pikkus",
    waist: "Vöö",
    "waist girth": "Vööümbermõõt",
    "zipper length": "Luku pikkus",
  },
  ru: {
    "1/2 waist": "Полуобхват талии",
    "back length": "Длина по спинке",
    bust: "Обхват груди",
    chest: "Грудь",
    "clothes length": "Длина изделия",
    "hip girt": "Обхват бёдер",
    "hip width": "Ширина по бёдрам",
    hips: "Бёдра",
    inseam: "Внутренний шов",
    length: "Длина",
    "pants length": "Длина брюк",
    shoulder: "Плечо",
    "shoulder + sleeve": "Плечо + рукав",
    sleeve: "Рукав",
    "sleeve + shoulder": "Рукав + плечо",
    "sleeve length": "Длина рукава",
    "trousers length": "Длина брюк",
    waist: "Талия",
    "waist girth": "Обхват талии",
    "zipper length": "Длина молнии",
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

export type SizeChartTable = {
  measurements: Array<{ name: string; values: Array<number | string | null> }>;
  sizes: string[];
};

export function parseSizeChart(value: unknown): SizeChartTable | null {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const candidate = value as { measurements?: unknown; sizes?: unknown };
  if (
    !Array.isArray(candidate.sizes) ||
    !Array.isArray(candidate.measurements)
  ) {
    return null;
  }
  const sizes = candidate.sizes.filter(
    (item): item is string => typeof item === "string",
  );
  const measurements = candidate.measurements.flatMap((item) => {
    if (!item || Array.isArray(item) || typeof item !== "object") return [];
    const row = item as { name?: unknown; values?: unknown };
    if (typeof row.name !== "string" || !Array.isArray(row.values)) return [];
    const values = row.values.map((value) =>
      typeof value === "number" || typeof value === "string" || value === null
        ? value
        : null,
    );
    return values.length === sizes.length ? [{ name: row.name, values }] : [];
  });
  return sizes.length && measurements.length ? { measurements, sizes } : null;
}

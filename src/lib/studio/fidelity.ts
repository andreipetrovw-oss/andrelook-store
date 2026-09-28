export const studioFidelityChecklist = [
  ["silhouette", "Силуэт"],
  ["proportions", "Общие пропорции"],
  ["quilting", "Геометрия простёжки и панелей"],
  ["seams", "Швы"],
  ["collar", "Воротник / капюшон"],
  ["pockets", "Карманы"],
  ["zipper", "Молния"],
  ["hardware", "Фурнитура"],
  ["cuffs", "Манжеты и низ"],
  ["branding", "Расположение брендинга / патча"],
  ["labels", "Видимые ярлыки и текст"],
  ["interior", "Внутренняя конструкция, где применимо"],
  ["fabric", "Внешний вид материала"],
  ["colour", "Цвет"],
  ["no-invented", "Нет добавленных видимых деталей"],
  ["no-missing", "Нет пропавших видимых деталей"],
  ["supported-view", "Ракурс подтверждён источником"],
] as const;

export type StudioFidelityCheckId = (typeof studioFidelityChecklist)[number][0];
export const studioFidelityCheckIds = studioFidelityChecklist.map(
  ([id]) => id,
) as StudioFidelityCheckId[];

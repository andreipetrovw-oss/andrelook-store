import type { ImageRole } from "@prisma/client";

export const PHASE6D3_PRODUCT_CODE = "AL-SRC-CPREPSCN-218824597";

export const dillonReferencePack = [
  {
    role: "PRIMARY",
    primaryPosition: 2,
    supportingPositions: [3, 12, 14],
    purpose: "Карточка и главный hero-ракурс",
    engineeringDisposition: "CANDIDATE",
  },
  {
    role: "FRONT",
    primaryPosition: 3,
    supportingPositions: [2, 12],
    purpose: "Полный вид спереди",
    engineeringDisposition: "CANDIDATE",
  },
  {
    role: "BACK",
    primaryPosition: 4,
    supportingPositions: [3],
    purpose: "Полный вид сзади",
    engineeringDisposition: "CANDIDATE",
  },
  {
    role: "INTERIOR",
    primaryPosition: 5,
    supportingPositions: [6, 7, 9, 15, 16, 17, 18, 19, 20, 21],
    purpose: "Открытый внутренний вид",
    engineeringDisposition: "CANDIDATE",
  },
  {
    role: "BRANDING",
    primaryPosition: 12,
    supportingPositions: [3, 11],
    purpose: "Жёлтая фирменная деталь и застёжка",
    engineeringDisposition: "REJECTED_TOOLING",
  },
  {
    role: "HARDWARE",
    primaryPosition: 14,
    supportingPositions: [12],
    purpose: "Макро фурнитуры застёжки",
    engineeringDisposition: "REJECTED_TOOLING",
  },
  {
    role: "DETAIL",
    primaryPosition: 8,
    supportingPositions: [4, 6],
    purpose: "Материал и конструкция внутренней ленты",
    engineeringDisposition: "REJECTED_TOOLING",
  },
] as const satisfies ReadonlyArray<{
  role: Exclude<ImageRole, "SIZE_CHART">;
  primaryPosition: number;
  supportingPositions: readonly number[];
  purpose: string;
  engineeringDisposition: "CANDIDATE" | "REJECTED_TOOLING";
}>;

export const dillonFidelityChecks = [
  "Идентичность товара подтверждена по исходникам",
  "Силуэт и пропорции не изменены",
  "Цвет не изменён",
  "Материал и фактура не изменены",
  "Логотипы и надписи не перерисованы",
  "Фурнитура не добавлена и не удалена",
  "Швы и конструктивные линии сохранены",
  "Карманы и застёжки сохранены",
  "Бирки и маркировка не синтезированы",
  "Края изделия не обрезаны",
  "Нет смешения вариантов товара",
  "Фон не влияет на цвет изделия",
  "Тень не создаёт ложную форму",
  "Ракурс поддержан выбранным исходником",
  "Неоднозначные детали не дорисованы",
  "Кандидат пригоден только для закрытого review до решения владельца",
] as const;

export const dillonUnsupportedClaims = [
  "Цена, наличие, состав, аутентичность и коммерческие свойства не выводятся из изображения.",
  "Невидимые стороны и детали не синтезируются.",
  "Кандидат не становится публичным изображением автоматически.",
] as const;

import type { ImageRole } from "@prisma/client";

type LocaleSuggestion = {
  description: string;
  name: string;
};

type ShortlistItem = {
  position: number;
  reason: string;
  role: ImageRole;
};

export type GoldenWorkspace = {
  content: Record<"RU" | "ET" | "EN", LocaleSuggestion>;
  decisionPrompts: string[];
  shortlist: ShortlistItem[];
};

export const goldenWorkspaceByInternalCode: Record<string, GoldenWorkspace> = {
  "AL-SRC-CPREPSCN-218824597": {
    content: {
      RU: {
        name: "Куртка Dillon DLON",
        description:
          "Чёрная куртка с заметной стёганой геометрией, высоким воротником, фронтальной молнией и боковыми карманами. В источнике видны передняя, задняя и внутренняя стороны, а также отдельные детали.",
      },
      ET: {
        name: "Dillon DLON jope",
        description:
          "Must jope nähtava tepitud geomeetria, kõrge krae, eesmise tõmbluku ja küljetaskutega. Allikmaterjal näitab esi-, taga- ja sisekülge ning eraldi detaile.",
      },
      EN: {
        name: "Dillon DLON Jacket",
        description:
          "A black jacket with visible quilted geometry, a high collar, front zip and side pockets. The source set shows the front, back and interior together with individual details.",
      },
    },
    decisionPrompts: [
      "Подтвердить название и категорию",
      "Указать цену, наличие и условия заказа",
      "Выбрать продаваемые размеры и цвета",
      "Проверить тексты RU / ET / EN",
      "Одобрить исходники и версию Studio",
      "Дать финальное разрешение на публикацию",
    ],
    shortlist: [
      { position: 2, reason: "чистый общий ракурс", role: "PRIMARY" },
      { position: 3, reason: "вид спереди", role: "FRONT" },
      { position: 4, reason: "вид сзади", role: "BACK" },
      { position: 5, reason: "вид внутренней стороны", role: "INTERIOR" },
      { position: 12, reason: "видимый брендинг", role: "BRANDING" },
    ],
  },
  "AL-SRC-CPREPSCN-200087445": {
    content: {
      RU: {
        name: "Жилет Jeordie",
        description:
          "Чёрный стёганый жилет без рукавов с высоким воротником, фронтальной молнией и боковыми карманами. Источник показывает изделие спереди, сзади и изнутри, а также видимые детали.",
      },
      ET: {
        name: "Jeordie vest",
        description:
          "Must varrukateta tepitud vest kõrge krae, eesmise tõmbluku ja küljetaskutega. Allikmaterjal näitab toodet eest, tagant ja seest ning toob esile nähtavad detailid.",
      },
      EN: {
        name: "Jeordie Vest",
        description:
          "A black sleeveless quilted vest with a high collar, front zip and side pockets. The source set shows the piece from the front, back and interior, plus visible details.",
      },
    },
    decisionPrompts: [
      "Подтвердить название и категорию",
      "Указать цену, наличие и условия заказа",
      "Выбрать продаваемые размеры и цвета",
      "Проверить тексты RU / ET / EN",
      "Одобрить исходники и версию Studio",
      "Дать финальное разрешение на публикацию",
    ],
    shortlist: [
      { position: 2, reason: "чистый общий ракурс", role: "PRIMARY" },
      { position: 5, reason: "вид спереди", role: "FRONT" },
      { position: 6, reason: "вид сзади", role: "BACK" },
      { position: 9, reason: "вид внутренней стороны", role: "INTERIOR" },
      { position: 26, reason: "видимый брендинг", role: "BRANDING" },
    ],
  },
  "AL-SRC-KINGCN-209196603": {
    content: {
      RU: {
        name: "Кардиган Classical",
        description:
          "Чёрный кардиган на молнии с высоким воротником, стёганой передней частью и отличающейся фактурой рукавов и спинки. Источник показывает общий вид спереди и сзади.",
      },
      ET: {
        name: "Classical kardigan",
        description:
          "Must lukuga kardigan kõrge krae, tepitud esiosa ning varrukate ja seljaosa erineva tekstuuriga. Allikmaterjal näitab üldvaadet eest ja tagant.",
      },
      EN: {
        name: "Classical Cardigan",
        description:
          "A black zip-front cardigan with a high collar, quilted front section and contrasting texture across the sleeves and back. The source set shows clear front and back views.",
      },
    },
    decisionPrompts: [
      "Подтвердить название и категорию",
      "Указать цену, наличие и условия заказа",
      "Выбрать продаваемые размеры и цвета",
      "Проверить тексты RU / ET / EN",
      "Одобрить исходники и версию Studio",
      "Дать финальное разрешение на публикацию",
    ],
    shortlist: [
      { position: 2, reason: "чистый общий ракурс", role: "PRIMARY" },
      { position: 3, reason: "общий вид спереди", role: "FRONT" },
      { position: 4, reason: "общий вид сзади", role: "BACK" },
      { position: 5, reason: "дополнительный ракурс", role: "ALTERNATIVE" },
    ],
  },
  "AL-SRC-CPREPSCN-161312256": {
    content: {
      RU: {
        name: "Шорты Saturn CP",
        description:
          "Шорты с эластичным поясом на шнурке и боковым карманом карго. Источник показывает изделие спереди, сзади и крупным планом; продаваемые цвета требуют отдельного решения владельца.",
      },
      ET: {
        name: "Saturn CP lühikesed püksid",
        description:
          "Lühikesed püksid elastse nöörkinnitusega vöökoha ja külgmise cargotaskuga. Allikmaterjal näitab toodet eest, tagant ja lähivaates; müüdavad värvid vajavad omaniku eraldi otsust.",
      },
      EN: {
        name: "Saturn CP Shorts",
        description:
          "Shorts with an elastic drawstring waist and side cargo pocket. The source set shows front, back and close-up views; sellable colours remain a separate owner decision.",
      },
    },
    decisionPrompts: [
      "Подтвердить название и категорию",
      "Указать цену, наличие и условия заказа",
      "Выбрать продаваемые размеры и цвета",
      "Проверить тексты RU / ET / EN",
      "Одобрить исходники и версию Studio",
      "Дать финальное разрешение на публикацию",
    ],
    shortlist: [
      { position: 2, reason: "чистый общий ракурс", role: "PRIMARY" },
      { position: 7, reason: "вид спереди", role: "FRONT" },
      { position: 8, reason: "вид сзади", role: "BACK" },
      { position: 16, reason: "видимая деталь", role: "DETAIL" },
      { position: 26, reason: "видимый брендинг", role: "BRANDING" },
    ],
  },
};

export function getGoldenWorkspace(internalCode: string) {
  return goldenWorkspaceByInternalCode[internalCode] ?? null;
}

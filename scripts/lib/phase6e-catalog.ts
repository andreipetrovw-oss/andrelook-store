import type { Phase5Catalog, Phase5Product } from "./phase5-catalog";

export const catalogLocales = ["RU", "ET", "EN"] as const;

export type CatalogLocale = (typeof catalogLocales)[number];

export type PreparedProductIdentity = {
  internalCode: string;
  name: string;
  slug: string;
  translations: Array<{ locale: CatalogLocale; name: string }>;
};

type TaxonomyTranslation = Record<CatalogLocale, string>;

const taxonomyTranslations: Record<string, TaxonomyTranslation> = {
  accessories: { EN: "Accessories", ET: "Aksessuaarid", RU: "Аксессуары" },
  bottoms: { EN: "Bottoms", ET: "Alaosad", RU: "Брюки и шорты" },
  cardigans: { EN: "Cardigans", ET: "Kardiganid", RU: "Кардиганы" },
  "down-jackets": {
    EN: "Down jackets",
    ET: "Sulejoped",
    RU: "Пуховики",
  },
  headwear: { EN: "Headwear", ET: "Peakatted", RU: "Головные уборы" },
  "hoodies-and-sweatshirts": {
    EN: "Hoodies & sweatshirts",
    ET: "Pusad ja dressipluusid",
    RU: "Худи и свитшоты",
  },
  jackets: { EN: "Jackets", ET: "Joped", RU: "Куртки" },
  knitwear: { EN: "Knitwear", ET: "Kudumid", RU: "Трикотаж" },
  outerwear: { EN: "Outerwear", ET: "Ülerõivad", RU: "Верхняя одежда" },
  overshirts: { EN: "Overshirts", ET: "Pealissärgid", RU: "Верхние рубашки" },
  pants: { EN: "Trousers", ET: "Püksid", RU: "Брюки" },
  polos: { EN: "Polos", ET: "Polod", RU: "Поло" },
  "shell-and-rain-jackets": {
    EN: "Shell & rain jackets",
    ET: "Vihma- ja koorikjoped",
    RU: "Мембранные и дождевые куртки",
  },
  shorts: { EN: "Shorts", ET: "Lühikesed püksid", RU: "Шорты" },
  sweaters: { EN: "Sweaters", ET: "Kampsunid", RU: "Свитеры" },
  "t-shirts": { EN: "T-shirts", ET: "T-särgid", RU: "Футболки" },
  tops: { EN: "Tops", ET: "Ülaosad", RU: "Верх" },
  vests: { EN: "Vests", ET: "Vestid", RU: "Жилеты" },
};

export function storefrontSlug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function taxonomyNames(slug: string): TaxonomyTranslation {
  const translation = taxonomyTranslations[slug];
  if (!translation) {
    throw new Error(`Phase 6E taxonomy translation missing for ${slug}.`);
  }
  return translation;
}

export function prepareProductIdentity(
  product: Phase5Product,
): PreparedProductIdentity {
  const name = product.identity.normalized_internal_name.trim();
  const slug = storefrontSlug(name);
  if (!name || !slug) {
    throw new Error(`Product ${product.internal_id} has no usable identity.`);
  }
  return {
    internalCode: product.internal_id,
    name,
    slug,
    translations: catalogLocales.map((locale) => ({ locale, name })),
  };
}

export function prepareCatalogIdentities(
  catalog: Phase5Catalog,
): PreparedProductIdentity[] {
  const identities = catalog.products.map(prepareProductIdentity);
  const slugs = new Set<string>();
  for (const identity of identities) {
    if (slugs.has(identity.slug)) {
      throw new Error(`Duplicate Phase 6E storefront slug: ${identity.slug}.`);
    }
    slugs.add(identity.slug);
  }
  return identities;
}

import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicCategoryDto } from "@/lib/catalog/public-query";

export function CategoryNavigation({
  activeSlug,
  categories,
  dictionary,
  locale,
}: {
  activeSlug?: string;
  categories: PublicCategoryDto[];
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <nav aria-label={dictionary.catalog} className="category-navigation">
      <Link
        aria-current={!activeSlug ? "page" : undefined}
        href={`/${locale}/catalog`}
      >
        {dictionary.categoryAll}
      </Link>
      {categories.flatMap((category) =>
        category.children.map((child) => (
          <Link
            aria-current={activeSlug === child.slug ? "page" : undefined}
            href={`/${locale}/catalog/${child.slug}`}
            key={child.slug}
          >
            {child.name} <span>{child.productCount}</span>
          </Link>
        )),
      )}
    </nav>
  );
}

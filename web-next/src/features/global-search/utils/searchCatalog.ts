import type {
  GlobalSearchNavigationItem,
  GlobalSearchResult,
} from "../types";

type Translate = (key: string) => string;

export const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}/_-]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

export const buildSearchCatalog = (
  navigation: readonly GlobalSearchNavigationItem[],
  translate: Translate,
): GlobalSearchResult[] => {
  const results = new Map<string, GlobalSearchResult>();

  const visit = (
    items: readonly GlobalSearchNavigationItem[],
    parents: readonly { key: string; label: string }[],
  ) => {
    for (const item of items) {
      const title = translate(item.title);
      const lineage = [...parents, { key: item.title, label: title }];

      if (item.path && !results.has(item.path)) {
        const category = parents.at(-1) ?? { key: item.title, label: title };
        const breadcrumbs = parents.map(({ label }) => label);

        results.set(item.path, {
          id: item.path,
          title,
          categoryKey: category.key,
          category: category.label,
          breadcrumbs,
          path: item.path,
          icon: item.icon,
          searchText: normalizeSearchText(
            [title, ...breadcrumbs, item.path].join(" "),
          ),
        });
      }

      if (item.items?.length) {
        visit(item.items, lineage);
      }
    }
  };

  visit(navigation, []);
  return [...results.values()];
};

const resultScore = (result: GlobalSearchResult, normalizedQuery: string) => {
  const normalizedTitle = normalizeSearchText(result.title);
  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  return 3;
};

export const filterSearchCatalog = (
  catalog: readonly GlobalSearchResult[],
  query: string,
  minSearchLength: number,
  maxResults: number,
): GlobalSearchResult[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < minSearchLength) return [];

  const terms = normalizedQuery.split(" ").filter(Boolean);

  return catalog
    .filter((result) =>
      terms.every((term) => result.searchText.includes(term)),
    )
    .map((result, index) => ({ result, index }))
    .sort(
      (left, right) =>
        resultScore(left.result, normalizedQuery) -
          resultScore(right.result, normalizedQuery) ||
        left.index - right.index,
    )
    .slice(0, Math.max(0, maxResults))
    .map(({ result }) => result);
};


import { computed, linkedSignal } from '@angular/core';
import type { CollectionPageRequest, CollectionSort, CollectionSource } from './collection.types';
import {
  matchesLocalTextFilter,
  parseLocalTextFilter,
  type LocalTextFilter,
} from './local-text-filter';

type SortValue = string | number | null | undefined;
interface LocalCollectionOptions<T> {
  readonly rows: () => readonly T[];
  readonly scopeKey: () => string;
  readonly pageSizes: readonly number[];
  readonly sortValues: Readonly<Record<string, (row: T) => SortValue>>;
  readonly textFilterFields?: readonly string[];
}
interface LocalCriteria extends CollectionPageRequest {
  readonly sort: CollectionSort | undefined;
  readonly filter: LocalTextFilter | null;
}

/** Adapts an already loaded array to the shared Grid contract; never requests remote data. */
export function createLocalCollection<T>(options: LocalCollectionOptions<T>) {
  const firstSize = options.pageSizes[0];
  if (
    firstSize === undefined ||
    options.pageSizes.some((size) => !Number.isSafeInteger(size) || size < 1)
  )
    throw Error('Local collection requires positive integer page sizes.');
  const criteria = linkedSignal<LocalCriteria>(() => {
    options.rows();
    options.scopeKey();
    return { pageIndex: 0, pageSize: firstSize, sort: undefined, filter: null };
  });
  const collator = new Intl.Collator();
  const sort = computed(() => criteria().sort);
  const filter = computed(() => criteria().filter);
  const filtered = computed(() => {
    const rows = options.rows(),
      active = filter();
    const value =
      active && Object.hasOwn(options.sortValues, active.field)
        ? options.sortValues[active.field]
        : undefined;
    return active && value
      ? rows.filter((row) => matchesLocalTextFilter(value(row), active))
      : rows;
  });
  const ordered = computed(() => {
    const rows = filtered();
    const activeSort = sort();
    const value =
      activeSort && Object.hasOwn(options.sortValues, activeSort.field)
        ? options.sortValues[activeSort.field]
        : undefined;
    if (!activeSort || !value) return rows;
    const direction = activeSort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const a = value(left),
        b = value(right);
      if (a == null) return b == null ? 0 : -direction;
      if (b == null) return direction;
      return (
        direction *
        (typeof a === 'number' && typeof b === 'number'
          ? a - b
          : collator.compare(String(a), String(b)))
      );
    });
  });
  const source = computed<CollectionSource<T>>(() => {
    const { pageIndex, pageSize, sort, filter } = criteria();
    const query = {
      scopeKey: options.scopeKey(),
      criteriaKey: JSON.stringify({ sort: sort ?? null, filter }),
      pageIndex,
      pageSize,
    };
    const rows = ordered();
    return {
      query,
      kind: 'ready',
      result: {
        query,
        rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        total: rows.length,
        hasNextPage: (pageIndex + 1) * pageSize < rows.length,
      },
    };
  });
  return {
    source,
    sort,
    filter,
    changePage: (page: CollectionPageRequest): void => {
      if (
        !options.pageSizes.includes(page.pageSize) ||
        !Number.isSafeInteger(page.pageIndex) ||
        page.pageIndex < 0 ||
        page.pageIndex > Math.max(0, Math.ceil(filtered().length / page.pageSize) - 1)
      )
        return;
      criteria.update((value) => ({ ...value, ...page }));
    },
    changeSort: (sort: CollectionSort | null): void => {
      if (sort === null) {
        criteria.update((value) => ({ ...value, pageIndex: 0, sort: undefined }));
        return;
      }
      if (
        !Object.hasOwn(options.sortValues, sort.field) ||
        (sort.direction !== 'asc' && sort.direction !== 'desc')
      )
        return;
      criteria.update((value) => ({ ...value, pageIndex: 0, sort: { ...sort } }));
    },
    changeFilter: (value: unknown): boolean => {
      try {
        const filter = parseLocalTextFilter(
          value,
          (options.textFilterFields ?? []).filter((field) =>
            Object.hasOwn(options.sortValues, field),
          ),
        );
        criteria.update((previous) => ({ ...previous, pageIndex: 0, filter }));
        return true;
      } catch {
        return false;
      }
    },
  };
}

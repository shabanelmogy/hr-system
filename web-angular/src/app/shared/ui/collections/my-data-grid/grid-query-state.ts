import { computed, DestroyRef, inject, signal } from '@angular/core';
import { fromPrimeGridFilters, toPrimeGridFilters } from '../grid-filter-adapter';
import {
  filterDefinitionValid,
  gridFilterModes,
  parseGridFilters,
  type GridFilters,
  type GridColumnFilter,
} from '../grid-filter.types';
import { parseGridSort, type GridSortItem } from '../grid-options.types';
import type { CollectionColumn, CollectionSort, CollectionSource } from '../collection.types';

interface GridQueryOptions<T> {
  readonly columns: () => readonly CollectionColumn<T>[];
  readonly advancedFilters: () => boolean;
  readonly filters: () => GridFilters;
  readonly sorts: () => readonly GridSortItem[];
  readonly sort: () => CollectionSort | undefined;
  readonly sortMode: () => 'single' | 'multiple';
  readonly source: () => CollectionSource<T>;
  readonly ready: () => boolean;
  readonly locale: { translate(key: string): string };
  readonly filtersChange: (value: GridFilters) => void;
  readonly sortsChange: (value: readonly GridSortItem[]) => void;
  readonly sortChange: (value: CollectionSort) => void;
}
/** Per-grid vendor event normalization and deferred sort acceptance. */
export class GridQueryState<T> {
  private readonly destroyRef = inject(DestroyRef);
  readonly filterInvalid = signal(false);
  private pendingSort: {
    readonly value: CollectionSort;
    readonly source: CollectionSource<T>;
  } | null = null;
  private sortScheduled = false;
  constructor(private readonly options: GridQueryOptions<T>) {}
  readonly filterDefinitions = computed<readonly GridColumnFilter[]>(() =>
    this.options.advancedFilters()
      ? this.options.columns().flatMap((column) => (column.filter ? [column.filter] : []))
      : [],
  );
  readonly filterContractValid = computed(() => {
    const definitions = this.filterDefinitions();
    try {
      parseGridFilters(this.options.filters(), definitions);
      return definitions.every(filterDefinitionValid);
    } catch {
      return false;
    }
  });
  readonly nativeFilters = computed(() =>
    this.filterContractValid()
      ? toPrimeGridFilters(this.options.filters(), this.filterDefinitions())
      : {},
  );
  readonly nativeSorts = computed(() => {
    try {
      return parseGridSort(
        this.options.sorts(),
        this.options.columns().flatMap((column) => (column.sortField ? [column.sortField] : [])),
      ).map((item) => ({ field: item.field, order: item.direction === 'asc' ? 1 : -1 }));
    } catch {
      return [];
    }
  });
  filterModes(definition: GridColumnFilter) {
    return (definition.modes ?? gridFilterModes[definition.type]).map((value) => ({
      value,
      label: this.options.locale.translate('collections.' + value),
    }));
  }
  changeFilters(event: unknown) {
    if (!this.options.advancedFilters() || !this.options.ready() || !this.filterContractValid())
      return;
    try {
      if (typeof event !== 'object' || event === null || !('filters' in event))
        throw Error('Invalid filter event');
      const filters = fromPrimeGridFilters(event.filters, this.filterDefinitions());
      this.filterInvalid.set(false);
      if (JSON.stringify(filters) !== JSON.stringify(this.options.filters()))
        this.options.filtersChange(filters);
    } catch {
      this.filterInvalid.set(true);
    }
  }
  changeSort(event: unknown) {
    if (this.options.sortMode() === 'multiple') {
      if (
        typeof event !== 'object' ||
        event === null ||
        !('multisortmeta' in event) ||
        !Array.isArray(event.multisortmeta) ||
        !this.options.ready()
      )
        return;
      try {
        const sorts = parseGridSort(
          event.multisortmeta.map((item: unknown) => {
            if (
              typeof item !== 'object' ||
              item === null ||
              !('field' in item) ||
              !('order' in item) ||
              (item.order !== 1 && item.order !== -1)
            )
              throw Error('Invalid sort');
            return { field: item.field, direction: item.order === 1 ? 'asc' : 'desc' };
          }),
          this.options.columns().flatMap((column) => (column.sortField ? [column.sortField] : [])),
        );
        if (JSON.stringify(sorts) !== JSON.stringify(this.options.sorts()))
          this.options.sortsChange(sorts);
      } catch {
        /* Unsupported vendor sort never becomes owner criteria. */
      }
      return;
    }
    if (
      typeof event !== 'object' ||
      event === null ||
      !('field' in event) ||
      !('order' in event) ||
      typeof event.field !== 'string' ||
      !this.options.columns().some((column) => column.sortField === event.field) ||
      (event.order !== 1 && event.order !== -1)
    )
      return;
    // PrimeNG applies field and order in separate effects, including on mount.
    // Commit only their final pair after the current input synchronization completes.
    this.pendingSort = {
      value: { field: event.field, direction: event.order === 1 ? 'asc' : 'desc' },
      source: this.options.source(),
    };
    if (this.sortScheduled) return;
    this.sortScheduled = true;
    queueMicrotask(() => {
      this.sortScheduled = false;
      const pending = this.pendingSort;
      this.pendingSort = null;
      if (
        this.destroyRef.destroyed ||
        !pending ||
        pending.source !== this.options.source() ||
        !this.options.ready() ||
        (this.options.sort()?.field === pending.value.field &&
          this.options.sort()?.direction === pending.value.direction)
      )
        return;
      this.options.sortChange(pending.value);
    });
  }
}

import { afterNextRender, computed, DestroyRef, inject, Injector, signal } from '@angular/core';
import type {
  ContextMenuPanel,
  ContextMenuAction,
} from '../../overlays/context-menu-panel/context-menu-panel';
import { filterByCellValue } from '../grid-cell-filter';
import type { GridFilters, GridColumnFilter } from '../grid-filter.types';
import type { GridRowAction } from '../grid-options.types';
import {
  collectionQueryKey,
  type CollectionColumn,
  type CollectionSource,
} from '../collection.types';
interface GridContextOptions<T> {
  readonly source: () => CollectionSource<T>;
  readonly rows: () => readonly T[];
  readonly ready: () => boolean;
  readonly contextActions: () => ((row: T) => readonly GridRowAction[]) | null;
  readonly cellContextFilter: () => boolean;
  readonly advancedFilters: () => boolean;
  readonly filterContractValid: () => boolean;
  readonly filters: () => GridFilters;
  readonly filterDefinitions: () => readonly GridColumnFilter[];
  readonly displayColumns: () => readonly CollectionColumn<T>[];
  readonly rowMenu: () => ContextMenuPanel | undefined;
  readonly locale: { translate(key: string): string };
  readonly filtersChange: (value: GridFilters) => void;
  readonly rowAction: (value: { readonly row: T; readonly action: string }) => void;
  readonly clearFilterError: () => void;
}
/** A context menu lease belongs to the exact row snapshot that opened it. */
export class GridContextState<T> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  constructor(private readonly options: GridContextOptions<T>) {}
  private readonly context = signal<{
    readonly row: T;
    readonly key: string;
    readonly source: CollectionSource<T>;
    readonly column: CollectionColumn<T> | null;
    readonly value: unknown;
  } | null>(null);
  readonly contextItems = computed<readonly ContextMenuAction[]>(() => {
    const context = this.context();
    if (!context || !this.currentContext(context)) return [];
    const rows = (this.options.contextActions()?.(context.row) ?? []).map((action) => ({
      id: 'row:' + action.id,
      label: action.label,
      ...(action.icon === undefined ? {} : { icon: action.icon }),
      ...(action.disabled === undefined ? {} : { disabled: action.disabled }),
    }));
    const filter = this.cellFilter(context);
    return [
      ...(filter
        ? [
            {
              id: 'filter-by-value',
              label: this.options.locale.translate('collections.filterByCellValue'),
              icon: 'filter' as const,
            },
          ]
        : []),
      ...(filter && rows.length ? [{ id: 'separator', label: '', separator: true }] : []),
      ...rows,
    ];
  });
  private currentContext(context: NonNullable<ReturnType<typeof this.context>>): boolean {
    return (
      context.source === this.options.source() &&
      this.options.ready() &&
      context.key === collectionQueryKey(this.options.source().query) &&
      this.options.rows().includes(context.row)
    );
  }
  private cellValue(column: CollectionColumn<T>, row: T): unknown {
    try {
      return column.filterValue ? column.filterValue(row) : column.value(row);
    } catch {
      return undefined;
    }
  }
  private cellFilter(context: NonNullable<ReturnType<typeof this.context>>): GridFilters | null {
    const column = context.column;
    if (
      !this.options.cellContextFilter() ||
      !this.options.advancedFilters() ||
      !this.options.filterContractValid() ||
      !column?.filter ||
      !this.options.displayColumns().includes(column) ||
      !Object.is(context.value, this.cellValue(column, context.row))
    )
      return null;
    return filterByCellValue(
      this.options.filters(),
      this.options.filterDefinitions(),
      column.filter.field,
      context.value,
    );
  }
  openContext(row: T, event: MouseEvent): void {
    if (
      (!this.options.contextActions() &&
        (!this.options.advancedFilters() || !this.options.cellContextFilter())) ||
      !this.options.ready() ||
      !this.options.rows().includes(row)
    )
      return;
    const cell =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('td[data-cell-column]')
        : null;
    const column = cell
      ? (this.options
          .displayColumns()
          .find((column) => column.key === cell.dataset['cellColumn']) ?? null)
      : null;
    const context = {
      row,
      key: collectionQueryKey(this.options.source().query),
      source: this.options.source(),
      column,
      value: column ? this.cellValue(column, row) : undefined,
    };
    this.context.set(context);
    if (!this.contextItems().length) return;
    event.preventDefault();
    event.stopPropagation();
    const returnTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const rect = returnTarget?.getBoundingClientRect() ?? null;
    const position =
      event.clientX === 0 && event.clientY === 0 && rect
        ? new MouseEvent('contextmenu', {
            clientX: rect.x + rect.width / 2,
            clientY: rect.y + rect.height / 2,
          })
        : event;
    afterNextRender(
      () => {
        if (!this.destroyRef.destroyed && this.context() === context && this.contextItems().length)
          this.options.rowMenu()?.show(position, returnTarget);
      },
      { injector: this.injector },
    );
  }
  runContextCommand(id: string): void {
    const context = this.context();
    if (!context || !this.currentContext(context)) return;
    if (id === 'filter-by-value') {
      const filters = this.cellFilter(context);
      if (!filters) return;
      this.options.clearFilterError();
      if (JSON.stringify(filters) !== JSON.stringify(this.options.filters()))
        this.options.filtersChange(filters);
      this.context.set(null);
    } else if (id.startsWith('row:')) this.runContextAction(context.row, id.slice(4), context.key);
  }
  dismissContext(): void {
    this.context.set(null);
  }
  private runContextAction(row: T, action: string, key: string): void {
    if (
      !this.options.ready() ||
      key !== collectionQueryKey(this.options.source().query) ||
      !this.options.rows().includes(row) ||
      !this.options
        .contextActions()?.(row)
        .some((item) => item.id === action && !item.disabled)
    )
      return;
    this.options.rowAction({ row, action });
    this.context.set(null);
  }
  activateRowAction(row: T, action: string) {
    this.runContextAction(row, action, collectionQueryKey(this.options.source().query));
  }

  reset(): void {
    this.context.set(null);
    this.options.rowMenu()?.hide(false);
  }
}

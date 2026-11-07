import { computed, signal } from '@angular/core';
import type { CollectionColumn, CollectionId } from '../collection.types';
import type { GridRowGroup } from '../grid-options.types';
interface GridExpansionOptions<T> {
  readonly grouping: () => GridRowGroup | null;
  readonly columns: () => readonly CollectionColumn<T>[];
  readonly details: () => unknown;
  readonly frozenRows: () => readonly T[];
  readonly rows: () => readonly T[];
  readonly ready: () => boolean;
  readonly total: () => number | null;
  readonly rowId: () => (row: T) => CollectionId;
  readonly dataKey: () => string;
  readonly detailToggle: (event: { readonly row: T; readonly expanded: boolean }) => void;
}
/** Validate grouping and own expansion locally to one grid instance. */
export class GridExpansionState<T> {
  readonly expanded = signal<Readonly<Record<string, boolean>>>({});
  constructor(private readonly options: GridExpansionOptions<T>) {}
  readonly groupColumn = computed(() =>
    this.options.grouping()
      ? (this.options.columns().find((column) => column.key === this.options.grouping()?.field) ??
        null)
      : null,
  );
  readonly groupingValid = computed(() => {
    const group = this.options.grouping();
    if (!group) return true;
    const column = this.groupColumn();
    if (
      !column ||
      this.options.details() ||
      this.options.frozenRows().length > 0 ||
      (group.expandable && group.mode === 'rowspan')
    )
      return false;
    if (!this.options.ready()) return true;
    if (group.scope === 'all' && this.options.total() !== this.options.rows().length) return false;
    const seen = new Set<string>();
    let previous: string | null = null;
    for (const row of this.options.rows()) {
      const value = column.value(row);
      if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        typeof row !== 'object' ||
        row === null ||
        Reflect.get(row, group.field) !== value
      )
        return false;
      const key = JSON.stringify([typeof value, value]);
      if (key !== previous) {
        if (seen.has(key)) return false;
        seen.add(key);
        previous = key;
      }
    }
    return true;
  });
  toggleDetails(row: T): void {
    if (!this.options.details() || !this.options.ready() || !this.options.rows().includes(row))
      return;
    const id = this.options.rowId()(row);
    if (typeof row !== 'object' || row === null || Reflect.get(row, this.options.dataKey()) !== id)
      return;
    const key = String(id),
      expanded = !this.expanded()[key];
    this.expanded.update((value) => ({ ...value, [key]: expanded }));
    this.options.detailToggle({ row, expanded });
  }
  groupLabel(row: T) {
    return String(this.groupColumn()?.value(row) ?? '');
  }
  toggleGroup(row: T): void {
    if (!this.options.grouping()?.expandable || !this.groupingValid() || !this.options.ready())
      return;
    const key = this.groupLabel(row);
    this.expanded.update((value) => ({ ...value, [key]: !value[key] }));
  }
}

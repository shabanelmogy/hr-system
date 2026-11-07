import { computed, signal, type WritableSignal } from '@angular/core';
import { gridColumnWidths, gridColumnMinimum, gridFrozenOffset } from '../grid-column-widths';
import type { CollectionColumn } from '../collection.types';
import type { GridDisplayOptions } from '../grid-options.types';
interface GridGeometryOptions<T> {
  readonly columns: () => readonly CollectionColumn<T>[];
  readonly displayColumns: () => readonly CollectionColumn<T>[];
  readonly availableWidth: () => number;
  readonly reservedWidth: () => number;
  readonly widths: WritableSignal<Readonly<Record<string, number>>>;
  readonly pins: () => Readonly<Record<string, 'start' | 'end'>>;
  readonly display: () => GridDisplayOptions;
  readonly contextActions: () => unknown;
  readonly stickyActions: () => boolean;
  readonly actionColumnWidth: () => number;
  readonly columnWidthsChange: (widths: Readonly<Record<string, number>>) => void;
}
/** Column measurements and logical frozen offsets; lifetime stays with the grid. */
export class GridGeometry<T> {
  constructor(private readonly options: GridGeometryOptions<T>) {}
  readonly headerMinimums = signal<Readonly<Record<string, number>>>({});
  readonly resolvedWidths = computed(() =>
    gridColumnWidths(
      this.options.displayColumns(),
      this.options.availableWidth() - this.options.reservedWidth(),
      this.options.widths(),
      this.headerMinimums(),
      this.compactViewport(),
    ),
  );
  readonly tableWidth = computed(
    () =>
      this.options
        .displayColumns()
        .reduce((sum, column) => sum + this.width(column), this.options.reservedWidth()) + 'px',
  );
  private readonly compactViewport = computed(
    () => this.options.availableWidth() > 0 && this.options.availableWidth() < 600,
  );
  compact(column: CollectionColumn<T>): boolean {
    return (
      this.compactViewport() &&
      Number.isFinite(column.compactWidth) &&
      (column.compactWidth ?? 0) >= 48
    );
  }
  width(column: CollectionColumn<T>) {
    return this.resolvedWidths()[column.key] ?? gridColumnMinimum(column);
  }
  columnStyleWidth(column: CollectionColumn<T>) {
    return this.width(column);
  }
  minimum(column: CollectionColumn<T>) {
    return gridColumnMinimum(column, this.headerMinimums()[column.key], this.compactViewport());
  }
  pinned(column: CollectionColumn<T>) {
    return this.options.pins()[column.key] ?? null;
  }
  frozenOffset(column: CollectionColumn<T>): string {
    return (
      gridFrozenOffset(
        this.options.displayColumns(),
        this.resolvedWidths(),
        this.options.pins(),
        column.key,
        this.options.contextActions() && this.options.stickyActions()
          ? this.options.actionColumnWidth()
          : 0,
      ) + 'px'
    );
  }
  resized(event: unknown) {
    if (
      !this.options.display().resizableColumns ||
      typeof event !== 'object' ||
      event === null ||
      !('element' in event) ||
      !(event.element instanceof HTMLElement)
    )
      return;
    const key = event.element.dataset['columnKey'],
      column = this.options.columns().find((item) => item.key === key);
    if (!column) return;
    const widths = { ...this.options.widths() };
    for (const element of event.element
      .closest('tr')
      ?.querySelectorAll<HTMLElement>('[data-column-key]') ?? []) {
      const key = element.dataset['columnKey'],
        column = this.options.columns().find((item) => item.key === key);
      if (!column) continue;
      const width = Math.round(element.getBoundingClientRect().width);
      if (width < gridColumnMinimum(column, this.headerMinimums()[column.key]) || width > 4096)
        return;
      widths[column.key] = width;
    }
    this.options.widths.set(widths);
    this.options.columnWidthsChange(widths);
  }
}

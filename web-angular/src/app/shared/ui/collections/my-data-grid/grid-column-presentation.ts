import { computed, signal, type Signal } from '@angular/core';
import { parseGridPresentation, type GridPresentation } from '../grid-presentation';
import type { GridDisplayOptions } from '../grid-options.types';
import type { CollectionColumn, CollectionDensity } from '../collection.types';

/** Generic column preferences; no domain data, transport or persistence. */
export function createGridPresentation<T>(options: {
  readonly columns: Signal<readonly CollectionColumn<T>[]>;
  readonly display: Signal<GridDisplayOptions>;
  readonly scope: () => string;
  readonly orderChange: (keys: readonly string[]) => void;
}) {
  const order = signal<readonly string[]>([]);
  const widths = signal<Readonly<Record<string, number>>>({});
  const pins = signal<Readonly<Record<string, 'start' | 'end'>>>({});
  const density = signal<CollectionDensity>('standard');
  const visibleKeys = signal<readonly string[]>([]);
  const optionColumns = computed(() =>
    [...options.columns()].sort((a, b) => order().indexOf(a.key) - order().indexOf(b.key)),
  );
  const displayColumns = computed(() => {
    const rank = (column: CollectionColumn<T>) =>
      pins()[column.key] === 'start' ? 0 : pins()[column.key] === 'end' ? 2 : 1;
    return options
      .columns()
      .filter((column) => visibleKeys().includes(column.key))
      .sort((a, b) => rank(a) - rank(b) || order().indexOf(a.key) - order().indexOf(b.key));
  });
  const resetDisplay = () => {
    visibleKeys.set(options.columns().map((column) => column.key));
    order.set(options.columns().map((column) => column.key));
    widths.set({});
    pins.set({ ...options.display().frozenColumns });
    density.set('standard');
  };

  const presentation = (): GridPresentation => {
    return parseGridPresentation(
      {
        version: 1,
        scope: options.scope(),
        order: order(),
        visible: visibleKeys(),
        widths: widths(),
        pinned: pins(),
        density: density(),
      },
      options.scope(),
      options.columns(),
    );
  };

  const restorePresentation = (value: unknown): boolean => {
    try {
      const state = parseGridPresentation(value, options.scope(), options.columns());
      order.set(state.order);
      visibleKeys.set(state.visible);
      widths.set(state.widths);
      pins.set(state.pinned);
      density.set(state.density);
      return true;
    } catch {
      return false;
    }
  };

  const moveColumn = (change: { readonly key: string; readonly direction: -1 | 1 }) => {
    if (!options.display().columnManagement) return;
    const nextOrder = [...order()],
      index = nextOrder.indexOf(change.key),
      target = index + change.direction;
    if (index < 0 || target < 0 || target >= nextOrder.length) return;
    const current = nextOrder[index],
      next = nextOrder[target];
    if (current === undefined || next === undefined) return;
    nextOrder[index] = next;
    nextOrder[target] = current;
    order.set(nextOrder);
    options.orderChange(nextOrder);
  };

  const pinColumn = (change: { readonly key: string; readonly side: 'start' | 'end' | null }) => {
    if (
      !options.display().columnManagement ||
      !options.columns().some((column) => column.key === change.key)
    )
      return;
    pins.update((value) => {
      const next = { ...value };
      if (change.side) next[change.key] = change.side;
      else delete next[change.key];
      return next;
    });
  };

  const reordered = (event: unknown) => {
    if (
      !options.display().reorderableColumns ||
      typeof event !== 'object' ||
      event === null ||
      !('columns' in event) ||
      !Array.isArray(event.columns)
    )
      return;
    const keys: string[] = [];
    const columns: readonly unknown[] = event.columns;
    for (const column of columns) {
      if (
        typeof column !== 'object' ||
        column === null ||
        !('key' in column) ||
        typeof column.key !== 'string' ||
        !displayColumns().some((item) => item.key === column.key) ||
        keys.includes(column.key)
      )
        return;
      keys.push(column.key);
    }
    if (keys.length !== displayColumns().length) return;
    const hidden = order().filter((key) => !keys.includes(key));
    order.set([...keys, ...hidden]);
    options.orderChange(order());
  };
  return {
    order,
    widths,
    pins,
    density,
    visibleKeys,
    optionColumns,
    displayColumns,
    resetDisplay,
    presentation,
    restorePresentation,
    moveColumn,
    pinColumn,
    reordered,
  };
}

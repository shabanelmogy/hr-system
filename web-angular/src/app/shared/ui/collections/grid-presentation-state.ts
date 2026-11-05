import { computed, effect, signal, untracked, type Signal } from '@angular/core';
import type { CollectionColumn, CollectionDensity } from './collection.types';
import type { GridDisplayOptions } from './grid-options.types';
import { parseGridPresentation, type GridPresentation } from './grid-presentation';

/** Per-grid presentation state. No records, server criteria, storage or DOM ownership. */
export function createGridPresentationState<T>(
  columns: Signal<readonly CollectionColumn<T>[]>,
  scope: Signal<string>,
  display: Signal<GridDisplayOptions>,
  orderChanged: (keys: readonly string[]) => void,
  contextReset: () => void,
) {
  const order = signal<readonly string[]>([]);
  const visibleKeys = signal<readonly string[]>([]);
  const widths = signal<Readonly<Record<string, number>>>({});
  const pins = signal<Readonly<Record<string, 'start' | 'end'>>>({});
  const density = signal<CollectionDensity>('standard');
  const optionColumns = computed(() => [...columns()].sort((a, b) => order().indexOf(a.key) - order().indexOf(b.key)));
  const displayColumns = computed(() => {
    const rank = (column: CollectionColumn<T>) => pins()[column.key] === 'start' ? 0 : pins()[column.key] === 'end' ? 2 : 1;
    return columns().filter(column => visibleKeys().includes(column.key)).sort((a, b) => rank(a) - rank(b) || order().indexOf(a.key) - order().indexOf(b.key));
  });

  function reset(): void {
    const keys = columns().map(column => column.key);
    visibleKeys.set(keys);
    order.set(keys);
    widths.set({});
    pins.set({ ...display().frozenColumns });
    density.set('standard');
  }

  let context = '';
  effect(() => {
    const key = JSON.stringify([scope(), columns().map(column => [column.key, column.hideable])]);
    untracked(() => {
      if (key !== context) {
        context = key;
        reset();
        contextReset();
      }
    });
  });
  effect(() => { pins.set({ ...display().frozenColumns }); });

  function snapshot(): GridPresentation {
    return parseGridPresentation({ version: 1, scope: scope(), order: order(), visible: visibleKeys(), widths: widths(), pinned: pins(), density: density() }, scope(), columns());
  }

  function restore(value: unknown): boolean {
    try {
      const state = parseGridPresentation(value, scope(), columns());
      order.set(state.order);
      visibleKeys.set(state.visible);
      widths.set(state.widths);
      pins.set(state.pinned);
      density.set(state.density);
      return true;
    } catch { return false; }
  }

  function move(change: { readonly key: string; readonly direction: -1 | 1 }): void {
    if (!display().columnManagement) return;
    const keys = [...order()], index = keys.indexOf(change.key), target = index + change.direction;
    if (index < 0 || target < 0 || target >= keys.length) return;
    [keys[index], keys[target]] = [keys[target], keys[index]];
    order.set(keys);
    orderChanged(keys);
  }

  function pin(change: { readonly key: string; readonly side: 'start' | 'end' | null }): void {
    if (!display().columnManagement || !columns().some(column => column.key === change.key)) return;
    pins.update(value => {
      const next = { ...value };
      if (change.side) next[change.key] = change.side;
      else delete next[change.key];
      return next;
    });
  }

  function reorder(keys: readonly string[]): void {
    if (!display().reorderableColumns || keys.length !== displayColumns().length || new Set(keys).size !== keys.length || keys.some(key => !displayColumns().some(column => column.key === key))) return;
    const hidden = order().filter(key => !keys.includes(key));
    order.set([...keys, ...hidden]);
    orderChanged(order());
  }

  return { order, visibleKeys, widths, pins, density, optionColumns, displayColumns, reset, snapshot, restore, move, pin, reorder };
}

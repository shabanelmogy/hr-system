import { signal } from '@angular/core';
import { createGridPresentation } from './grid-column-presentation';
import type { GridDisplayOptions } from '../grid-options.types';
import type { CollectionColumn } from '../collection.types';

describe('shared Grid column preferences', () => {
  const columns = signal<readonly CollectionColumn<{ id: number; name: string }>[]>([
    { key: 'id', header: 'ID', value: (row) => row.id, hideable: false },
    { key: 'name', header: 'Name', value: (row) => row.name },
  ]);
  function setup() {
    const display = signal<GridDisplayOptions>({
      columnManagement: true,
      reorderableColumns: true,
    });
    const orderChange = vi.fn<(keys: readonly string[]) => void>();
    const state = createGridPresentation({
      columns,
      display,
      scope: () => 'fixture-a',
      orderChange,
    });
    state.resetDisplay();
    return { state, display, orderChange };
  }
  it('keeps the current preferences when a foreign or invalid snapshot is restored', () => {
    const { state } = setup();
    state.pinColumn({ key: 'name', side: 'end' });
    const before = state.presentation();
    expect(state.restorePresentation({ ...before, scope: 'fixture-b' })).toBe(false);
    expect(state.presentation()).toEqual(before);
    expect(state.restorePresentation({ ...before, visible: ['name'] })).toBe(false);
    expect(state.presentation()).toEqual(before);
  });
  it('accepts only a complete visible-column reorder and honors disabled management', () => {
    const { state, display, orderChange } = setup();
    state.reordered({ columns: [{ key: 'name' }, { key: 'name' }] });
    expect(orderChange).not.toHaveBeenCalled();
    state.reordered({ columns: [{ key: 'name' }, { key: 'id' }] });
    expect(state.order()).toEqual(['name', 'id']);
    expect(orderChange).toHaveBeenCalledOnce();
    display.set({});
    state.moveColumn({ key: 'name', direction: 1 });
    state.pinColumn({ key: 'name', side: 'start' });
    expect(state.order()).toEqual(['name', 'id']);
    expect(state.pins()).toEqual({});
  });
});

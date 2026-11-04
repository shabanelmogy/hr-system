import { fixtureItem } from '../../../../testing/fixture-item';
import { createGridCsv, gridCsvFilename } from './grid-export';
import { parseGridPresentation } from './grid-presentation';
import { parseGridSort } from './grid-options.types';
import type { CollectionColumn } from './collection.types';
import { gridColumnWidths, gridFrozenOffset } from './grid-column-widths';
const columns: readonly CollectionColumn<{ id: number; name: string }>[] = [
  { key: 'id', header: 'ID', value: (row) => row.id, hideable: false },
  { key: 'name', header: 'Name', value: (row) => row.name },
];
describe('Grid export,sort and presentation boundaries', () => {
  it('offsets logical frozen edges by their pinned neighbours, including reserved trailing actions', () => {
    const all = ['first', 'second', 'middle', 'before-last', 'last'].map((key) => ({
      key,
      header: key,
      value: () => '',
    }));
    const widths = { first: 80, second: 120, middle: 400, 'before-last': 100, last: 72 };
    const pins = { first: 'start', second: 'start', 'before-last': 'end', last: 'end' } as const;
    expect(gridFrozenOffset(all, widths, pins, 'second')).toBe(80);
    expect(gridFrozenOffset(all, widths, pins, 'before-last', 50)).toBe(122);
    expect(gridFrozenOffset(all, widths, pins, 'last', 50)).toBe(50);
    expect(gridFrozenOffset(all, widths, pins, 'middle')).toBe(0);
  });
  it('compacts explicitly opted-in icon action columns without shrinking other headers or losing desktop sizing', () => {
    const responsive = [
      { ...fixtureItem(columns, 1), minWidth: 200, flex: 1 },
      {
        key: 'action',
        header: 'Register the existing report',
        value: () => '',
        width: 280,
        compactWidth: 72,
      },
    ];
    expect(gridColumnWidths(responsive, 320, { action: 300 }, { action: 320 }, true)).toEqual({
      name: 248,
      action: 72,
    });
    expect(gridColumnWidths(responsive, 720, { action: 300 }, { action: 320 })).toEqual({
      name: 400,
      action: 320,
    });
    const invalid = [{ ...fixtureItem(responsive, 1), compactWidth: -1 }];
    expect(gridColumnWidths(invalid, 320, {}, {}, true)['action']).toBe(280);
  });
  it('shares available width by flex weight without shrinking source header minimums or an explicit resize', () => {
    const flexible = [
      { ...fixtureItem(columns, 0), width: 72 },
      { ...fixtureItem(columns, 1), flex: 1 },
      { key: 'other', header: 'Other', value: () => '', flex: 2 },
    ];
    const wide = gridColumnWidths(flexible, 672);
    expect(wide).toEqual({ id: 72, name: 200, other: 400 });
    expect(gridColumnWidths(flexible, 100)).toEqual({ id: 72, name: 72, other: 72 });
    expect(gridColumnWidths(flexible, 672, { name: 300 })).toEqual({
      id: 72,
      name: 300,
      other: 300,
    });
  });
  it('keeps the measured full title and native controls visible even after a narrower saved resize', () => {
    const flexible = [
      { ...fixtureItem(columns, 0), width: 72 },
      { ...fixtureItem(columns, 1), flex: 1 },
      { key: 'other', header: 'Other', value: () => '', flex: 2 },
    ];
    expect(gridColumnWidths(flexible, 672, { name: 100 }, { name: 340 })).toEqual({
      id: 72,
      name: 340,
      other: 260,
    });
    expect(gridColumnWidths(flexible, 100, {}, { name: 340 })).toEqual({
      id: 72,
      name: 340,
      other: 72,
    });
  });
  it('exports supplied values only and protects spreadsheet formulas while preserving numeric negatives and Unicode', () => {
    const csv = createGridCsv(columns, [
      { id: -1, name: '=SUM(A1:A2)' },
      { id: 2, name: '  @cmd' },
      { id: 3, name: 'مصر, "Egypt"\nنص' },
    ]);
    expect(csv).toBe(
      '\uFEFFID,Name\r\n-1,\'=SUM(A1:A2)\r\n2,\'  @cmd\r\n3,"مصر, ""Egypt""\nنص"\r\n',
    );
    expect(gridCsvFilename('../../countries?*')).toBe('countries.csv');
    expect(gridCsvFilename('')).toBe('records.csv');
  });
  it('restores validated presentation without private criteria,wrong actor,hidden required columns or invalid widths', () => {
    const snapshot = {
      version: 1,
      scope: 'actor1',
      order: ['name', 'id'],
      visible: ['id'],
      widths: { name: 120 },
      density: 'compact',
    };
    expect(parseGridPresentation(snapshot, 'actor1', columns).order).toEqual(['name', 'id']);
    for (const bad of [
      { ...snapshot, scope: 'other' },
      { ...snapshot, visible: ['name'] },
      { ...snapshot, order: ['name', 'name'] },
      { ...snapshot, widths: { name: 8 } },
      { ...snapshot, criteria: { private: 'x' } },
      { ...snapshot, density: 'unknown' },
    ])
      expect(() => parseGridPresentation(bad, 'actor1', columns)).toThrow();
  });
  it('accepts explicit empty removable sorting and rejects duplicate/unknown/malformed or oversized multi-sort', () => {
    expect(parseGridSort([], ['id'])).toEqual([]);
    expect(parseGridSort([{ field: 'id', direction: 'desc' }], ['id'])).toEqual([
      { field: 'id', direction: 'desc' },
    ]);
    for (const bad of [
      [{ field: 'name', direction: 'asc' }],
      [{ field: 'id', direction: 'up' }],
      [
        { field: 'id', direction: 'asc' },
        { field: 'id', direction: 'desc' },
      ],
      [{ field: 'id', direction: 'asc', query: 'x' }],
    ])
      expect(() => parseGridSort(bad, ['id'])).toThrow();
  });
});

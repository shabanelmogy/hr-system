import { signal } from '@angular/core';
import { createLocalCollection } from './local-collection';

describe('Loaded local collection adapter', () => {
  const initialRows = [
    { id: 0, label: 'Zulu', value: 10 },
    { id: 1, label: null, value: 2 },
    { id: 2, label: 'Alpha', value: 3 },
    { id: 3, label: 'Alpha', value: 1 },
  ] as const;
  function setup() {
    const rows =
      signal<readonly { id: number; label: string | null; value: number }[]>(initialRows);
    const scope = signal('first');
    const collection = createLocalCollection({
      rows,
      scopeKey: scope,
      pageSizes: [2, 4],
      textFilterFields: ['label'],
      sortValues: { label: (row) => row.label, value: (row) => row.value },
    });
    return { collection, rows, scope };
  }
  it('sorts the complete immutable snapshot before paging and preserves equal-value order', () => {
    const { collection, rows } = setup();
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    collection.changeSort({ field: 'label', direction: 'asc' });
    expect(collection.source().query.pageIndex).toBe(0);
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([1, 2]);
    expect(collection.source().result?.total).toBe(4);
    expect(collection.source().result?.hasNextPage).toBe(true);
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([3, 0]);
    expect(collection.source().result?.hasNextPage).toBe(false);
    collection.changeSort({ field: 'label', direction: 'desc' });
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([0, 2]);
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([3, 1]);
    expect(rows()).toBe(initialRows);
    expect(rows().map((row) => row.id)).toEqual([0, 1, 2, 3]);
  });
  it('compares numbers numerically and changes the source criteria key with sort', () => {
    const { collection } = setup();
    const key = collection.source().query.criteriaKey;
    collection.changeSort({ field: 'value', direction: 'asc' });
    expect(collection.source().query.criteriaKey).not.toBe(key);
    expect(collection.source().result?.rows.map((row) => row.value)).toEqual([1, 2]);
    collection.changeSort({ field: 'value', direction: 'desc' });
    expect(collection.source().result?.rows.map((row) => row.value)).toEqual([10, 3]);
  });
  it('ignores unregistered/inherited sort fields and unavailable page requests', () => {
    const { collection } = setup();
    const original = collection.source();
    for (const field of ['not-a-column', 'toString', '__proto__'])
      collection.changeSort({ field, direction: 'asc' });
    for (const page of [
      { pageIndex: -1, pageSize: 2 },
      { pageIndex: 0.5, pageSize: 2 },
      { pageIndex: 2, pageSize: 2 },
      { pageIndex: 0, pageSize: 0 },
      { pageIndex: 0, pageSize: 3 },
    ])
      collection.changePage(page);
    expect(collection.source()).toBe(original);
  });
  it('resets page and sort immediately when rows or scope are replaced, including an empty snapshot', () => {
    const { collection, rows, scope } = setup();
    collection.changeSort({ field: 'value', direction: 'desc' });
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    rows.set([{ id: 10, label: 'Replacement', value: 7 }]);
    expect(collection.source().query.pageIndex).toBe(0);
    expect(collection.sort()).toBeUndefined();
    expect(collection.source().result?.rows[0]?.id).toBe(10);
    collection.changeSort({ field: 'label', direction: 'asc' });
    scope.set('second');
    expect(collection.sort()).toBeUndefined();
    expect(collection.source().query.scopeKey).toBe('second');
    rows.set([]);
    expect(collection.source().result).toMatchObject({ rows: [], total: 0, hasNextPage: false });
  });
  it('filters the entire snapshot before sorting/paging and retains criteria on invalid requests', () => {
    const { collection, rows } = setup();
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    expect(collection.changeFilter({ field: 'label', operator: 'equals', values: ['alpha'] })).toBe(
      true,
    );
    expect(collection.source().query.pageIndex).toBe(0);
    expect(collection.source().result?.total).toBe(2);
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([2, 3]);
    collection.changeSort({ field: 'value', direction: 'asc' });
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([3, 2]);
    collection.changePage({ pageIndex: 1, pageSize: 2 });
    expect(collection.source().query.pageIndex).toBe(0);
    expect(collection.changeFilter({ field: 'value', operator: 'contains', values: ['3'] })).toBe(
      false,
    );
    expect(collection.filter()?.field).toBe('label');
    collection.changeFilter({ field: 'label', operator: 'isEmpty', values: [] });
    expect(collection.source().result?.rows.map((row) => row.id)).toEqual([1]);
    collection.changeFilter(null);
    expect(collection.source().result?.total).toBe(4);
    rows.set([...initialRows]);
    expect(collection.filter()).toBeNull();
  });
});

import { collectExportPages, collectExportCursor, projectTabularRows } from './tabular-export';

describe('All-filtered tabular source boundaries', () => {
  it('loads every page in source order and rejects changing totals or duplicate identities', async () => {
    const signal = new AbortController().signal;
    const read = vi.fn(async (page: number) => ({
      rows: [{ id: page, text: 'Filtered ' + page }],
      total: 3,
    }));
    expect(
      await collectExportPages({ signal, read, rowId: (row: { id: string | number }) => row.id }),
    ).toEqual([1, 2, 3].map((id) => ({ id, text: 'Filtered ' + id })));
    await expect(
      collectExportPages({
        signal,
        rowId: (row: { id: string | number }) => row.id,
        read: async (page) => ({ rows: [{ id: 1 }], total: page === 1 ? 2 : 3 }),
      }),
    ).rejects.toMatchObject({ reason: 'changed' });
    await expect(
      collectExportPages({
        signal,
        rowId: (row: { id: string | number }) => row.id,
        read: async () => ({ rows: [{ id: 1 }], total: 2 }),
      }),
    ).rejects.toMatchObject({ reason: 'changed' });
  });
  it('stops before reading remaining pages when cancelled or over a domain limit', async () => {
    const controller = new AbortController();
    const read = vi.fn(async () => {
      controller.abort();
      return { rows: [{ id: 1 }], total: 2 };
    });
    await expect(
      collectExportPages({
        signal: controller.signal,
        read,
        rowId: (row: { id: string | number }) => row.id,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(read).toHaveBeenCalledTimes(1);
    await expect(
      collectExportPages({
        signal: new AbortController().signal,
        rowId: (row: { id: string | number }) => row.id,
        maximumRows: 1,
        read: async () => ({ rows: [{ id: 1 }], total: 2 }),
      }),
    ).rejects.toMatchObject({ reason: 'limit' });
  });
  it('follows all cursor pages and detects loops', async () => {
    const signal = new AbortController().signal;
    const read = vi.fn(async (cursor: string | null) => ({
      rows: [{ id: cursor ?? 'first' }],
      nextCursor: cursor === null ? 'second' : null,
    }));
    expect(
      await collectExportCursor({ signal, read, rowId: (row: { id: string | number }) => row.id }),
    ).toEqual([{ id: 'first' }, { id: 'second' }]);
    await expect(
      collectExportCursor({
        signal,
        rowId: (row: { id: string | number }) => row.id,
        read: async (cursor) => ({ rows: [{ id: cursor ?? 'first' }], nextCursor: 'repeat' }),
      }),
    ).rejects.toMatchObject({ reason: 'changed' });
  });
  it('exports only explicit scalar column projections and disambiguates duplicate translated labels', () => {
    const columns = [
      { key: 'name', header: 'اسم', value: (row: { name: string }) => row.name },
      { key: 'code', header: 'اسم', value: () => 12 },
      { key: 'actions', header: 'Actions', value: () => 'hidden', exportable: false },
    ];
    expect(projectTabularRows(columns, [{ name: 'القاهرة, مصر' }])).toEqual([
      { اسم: 'القاهرة, مصر', 'اسم (2)': 12 },
    ]);
  });
});

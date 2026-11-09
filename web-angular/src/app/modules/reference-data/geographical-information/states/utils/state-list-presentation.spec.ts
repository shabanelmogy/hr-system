import { stateColumns, stateRowActions } from './state-list-presentation';

describe('State collection server capabilities', () => {
  it('exposes only server supported sorts and keeps dependent counts display-only', () => {
    const columns = stateColumns({
      text: (key) => key,
      stateText: (key) => key,
      date: (value) => value ?? '',
      country: (row) => row.country.nameEn,
      status: (row) => (row.isDeleted ? 'archived' : 'active'),
    });
    expect(columns.flatMap((column) => (column.sortField ? [column.sortField] : []))).toEqual([
      'id',
      'nameAr',
      'nameEn',
      'code',
      'country',
      'createdOn',
    ]);
    expect(columns.find((column) => column.key === 'districtsCount')?.sortField).toBeUndefined();
    expect(columns.every((column) => column.filter === undefined)).toBe(true);
  });
  it('derives visible lifecycle actions independently from exact owner capabilities', () => {
    expect(
      stateRowActions({ edit: false, archive: false, restore: true }, (key) => key).map(
        (action) => action.id,
      ),
    ).toEqual(['view', 'restore']);
  });
});

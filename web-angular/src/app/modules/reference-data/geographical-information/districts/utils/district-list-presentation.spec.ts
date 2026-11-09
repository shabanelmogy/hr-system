import { districtColumns, districtRowActions } from './district-list-presentation';

describe('District collection server capabilities', () => {
  it('exposes only server supported sorts and keeps dependent counts display-only', () => {
    const columns = districtColumns({
      text: (key) => key,
      districtText: (key) => key,
      date: (value) => value ?? '',
      state: (row) => row.state.nameEn,
      status: (row) => (row.isDeleted ? 'archived' : 'active'),
    });
    expect(columns.flatMap((column) => (column.sortField ? [column.sortField] : []))).toEqual([
      'id',
      'nameAr',
      'nameEn',
      'code',
      'state',
      'createdOn',
    ]);
    expect(columns.find((column) => column.key === 'addressesCount')?.sortField).toBeUndefined();
    expect(columns.every((column) => column.filter === undefined)).toBe(true);
  });
  it('derives visible lifecycle actions independently from exact owner capabilities', () => {
    expect(
      districtRowActions({ edit: false, archive: false, restore: true }, (key) => key).map(
        (action) => action.id,
      ),
    ).toEqual(['view', 'restore']);
  });
});

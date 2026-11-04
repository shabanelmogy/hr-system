import { countryColumns, countryRowActions } from './country-list-presentation';

describe('Country list presentation contracts', () => {
  it('derives actions from supplied permissions without granting an absent capability', () => {
    expect(
      countryRowActions({ edit: false, archive: false, restore: false }, (key) => key).map(
        (action) => action.id,
      ),
    ).toEqual(['view']);
    expect(
      countryRowActions({ edit: true, archive: true, restore: false }, (key) => key).map(
        (action) => action.id,
      ),
    ).toEqual(['view', 'edit', 'archive']);
    expect(
      countryRowActions({ edit: false, archive: false, restore: true }, (key) => key).map(
        (action) => action.id,
      ),
    ).toEqual(['view', 'restore']);
  });
  it('keeps each displayed column bound to its own structured filter definition', () => {
    const columns = countryColumns({
      text: (key) => key,
      countryText: (key) => key,
      date: (value) => value ?? '—',
      status: (row) => (row.isDeleted ? 'archived' : 'active'),
    });
    expect(columns).toHaveLength(11);
    expect(new Set(columns.map((column) => column.key)).size).toBe(columns.length);
    for (const column of columns) expect(column.filter?.field).toBe(column.key);
  });
});

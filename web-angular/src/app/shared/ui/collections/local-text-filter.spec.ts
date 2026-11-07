import {
  matchesLocalTextFilter,
  parseLocalTextFilter,
  type LocalTextOperator,
} from './local-text-filter';

describe('Local text snapshot filtering', () => {
  it.each<[LocalTextOperator, string | null, readonly string[], boolean]>([
    ['contains', 'Department Name', ['name'], true],
    ['contains', null, ['name'], false],
    ['contains', 'A.*B', ['.*'], true],
    ['notContains', null, ['name'], true],
    ['notContains', 'Department Name', ['NAME'], false],
    ['equals', 'Café', ['cafe'], true],
    ['equals', null, ['value'], false],
    ['notEquals', 'Alpha', ['alpha'], false],
    ['notEquals', null, ['value'], true],
    ['startsWith', 'Department Name', ['DEPARTMENT'], true],
    ['endsWith', 'Department Name', ['name'], true],
    ['isEmpty', null, [], true],
    ['isEmpty', '', [], true],
    ['isEmpty', ' ', [], false],
    ['isNotEmpty', '', [], false],
    ['isNotEmpty', ' ', [], true],
    ['isAnyOf', 'Café', ['other', 'cafe'], true],
    ['isAnyOf', null, ['value'], false],
  ])('%s matches raw snapshot %s', (operator, value, values, expected) => {
    expect(matchesLocalTextFilter(value, { field: 'field', operator, values })).toBe(expected);
  });
  it('trims query values, deduplicates lists, clears incomplete criteria and never trims snapshots', () => {
    expect(
      parseLocalTextFilter(
        { field: 'field', operator: 'isAnyOf', values: [' first ', 'second', 'first'] },
        ['field'],
      ),
    ).toEqual({ field: 'field', operator: 'isAnyOf', values: ['first', 'second'] });
    expect(
      parseLocalTextFilter({ field: 'field', operator: 'contains', values: [' '] }, ['field']),
    ).toBeNull();
    expect(parseLocalTextFilter(null, ['field'])).toBeNull();
    expect(
      matchesLocalTextFilter(' Alpha ', { field: 'field', operator: 'equals', values: ['Alpha'] }),
    ).toBe(false);
  });
  it.each([
    { field: 'unknown', operator: 'contains', values: ['one'] },
    { field: 'field', operator: 'arbitrary', values: ['one'] },
    { field: 'field', operator: 'contains', values: ['one', 'two'] },
    { field: 'field', operator: 'contains', values: [1] },
    { field: 'field', operator: 'contains', values: ['x'.repeat(2001)] },
    { field: 'field', operator: 'isAnyOf', values: Array.from({ length: 101 }, () => 'one') },
  ])('rejects malformed or unregistered criteria', (value) => {
    expect(() => parseLocalTextFilter(value, ['field'])).toThrow();
  });
});

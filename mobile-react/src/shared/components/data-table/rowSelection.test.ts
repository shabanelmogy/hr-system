import { toggleDataTableRowSelection } from './rowSelection';

describe('AppDataTable row selection', () => {
  it('adds an unselected key without changing the existing order', () => {
    expect(toggleDataTableRowSelection([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('removes a selected key and normalizes duplicates', () => {
    expect(toggleDataTableRowSelection([1, 2, 2, 3], 2)).toEqual([1, 3]);
  });

  it('keeps string and numeric keys distinct', () => {
    expect(toggleDataTableRowSelection([1], '1')).toEqual([1, '1']);
  });
});

import { fixtureBuffer } from '../../../testing/fixture-item';
import { spreadsheetRows, validateWorkbookZip } from './spreadsheet-parser';
import { utils, write } from 'xlsx';
import { SpreadsheetFiles, SpreadsheetError, validateSpreadsheetFile } from './spreadsheet-import';
describe('Bounded spreadsheet import', () => {
  const policy = { headers: ['first', 'second'], maxRows: 2, maxBytes: 5 * 1048576 };
  const sheet = (rows: unknown[][]) => utils.aoa_to_sheet(rows);
  it('preserves actual row numbers, trims scalar text and omits empty rows', () => {
    expect(
      spreadsheetRows(sheet([['first', 'second'], [' A ', 42], [], ['B', false]]), policy),
    ).toEqual([
      { rowNumber: 2, values: ['A', '42'] },
      { rowNumber: 4, values: ['B', 'false'] },
    ]);
  });
  it('requires exact ordered headers, forbids duplicate names and additional columns', () => {
    for (const rows of [
      [
        ['second', 'first'],
        ['A', 'B'],
      ],
      [
        ['first', 'first'],
        ['A', 'B'],
      ],
      [
        ['first', 'second', 'third'],
        ['A', 'B'],
      ],
      [
        ['first', 'second'],
        ['A', 'B', 'C'],
      ],
    ])
      expect(() => spreadsheetRows(sheet(rows), policy)).toThrow(SpreadsheetError);
  });
  it('rejects formulas even in otherwise empty cells and rows past the allowed count', () => {
    const value = sheet([
      ['first', 'second'],
      ['A', 'B'],
    ]);
    value['B2'] = { t: 'n', v: 2, f: '1+1' };
    expect(() => spreadsheetRows(value, policy)).toThrow('formulaNotAllowed');
    try {
      spreadsheetRows(value, policy);
    } catch (error) {
      expect(error).toBeInstanceOf(SpreadsheetError);
      expect((error as SpreadsheetError).details).toEqual({ row: 2, cell: 'B2' });
    }
    expect(() =>
      spreadsheetRows(sheet([['first', 'second'], ['A'], ['B'], ['C']]), policy),
    ).toThrow('rowLimitExceeded');
    expect(() => spreadsheetRows(sheet([['first', 'second']]), policy)).toThrow('emptyFile');
  });
  it('validates extension/MIME/bytes before reading untrusted content', () => {
    const file = { name: 'test.xlsx', size: 50, type: '' };
    expect(() => validateSpreadsheetFile(file, policy)).not.toThrow();
    for (const overrides of [
      { name: 'test.xls' },
      { size: 0 },
      { size: policy.maxBytes + 1 },
      { type: 'text/html' },
    ])
      expect(() => validateSpreadsheetFile({ ...file, ...overrides }, policy)).toThrow(
        SpreadsheetError,
      );
  });
  it('reads only the first worksheet and creates an exact header-only template', async () => {
    const files = new SpreadsheetFiles(),
      book = utils.book_new();
    utils.book_append_sheet(
      book,
      sheet([
        ['first', 'second'],
        ['A', 'B'],
      ]),
      'First',
    );
    utils.book_append_sheet(book, sheet([['wrong'], ['ignored']]), 'Second');
    const bytes: ArrayBuffer = fixtureBuffer(
      write(book, { type: 'array', bookType: 'xlsx', compression: true }),
    );
    const file = {
      name: 'test.xlsx',
      size: bytes.byteLength,
      type: '',
      arrayBuffer: async () => bytes,
    } as File;
    expect(await files.parse(file, policy)).toEqual([{ rowNumber: 2, values: ['A', 'B'] }]);
    expect((await files.template(policy.headers)).size).toBeGreaterThan(0);
  });
  it('rejects invalid zip and excessive inflated size before library parsing', () => {
    expect(() => validateWorkbookZip(new ArrayBuffer(30))).toThrow('invalidWorkbook');
    const book = utils.book_new();
    utils.book_append_sheet(
      book,
      sheet([
        ['first', 'second'],
        ['A', 'B'],
      ]),
      'First',
    );
    const bytes: ArrayBuffer = fixtureBuffer(write(book, { type: 'array', bookType: 'xlsx' })),
      view = new DataView(bytes);
    for (let i = 0; i < view.byteLength - 46; i++)
      if (view.getUint32(i, true) === 0x02014b50) {
        view.setUint32(i + 24, 33 * 1048576, true);
        break;
      }
    expect(() => validateWorkbookZip(bytes)).toThrow('invalidWorkbook');
  });
});

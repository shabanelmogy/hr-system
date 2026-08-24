import * as XLSX from 'xlsx';

import {
  isAmbiguousImportError,
  parseSpreadsheetBuffer,
  SpreadsheetImportError,
  validateSpreadsheetFile,
  type SpreadsheetImportPolicy,
} from './native-spreadsheet';

const policy: SpreadsheetImportPolicy = { headers: ['nameAr', 'nameEn'], maxRows: 2, maxBytes: 1000 };

describe('native spreadsheet import', () => {
  it('parses exact headers and bounded rows from the first worksheet', () => {
    const result = parseSpreadsheetBuffer(workbookBuffer([
      ['nameAr', 'nameEn'], ['مصر', 'Egypt'], ['المغرب', 'Morocco'],
    ]), policy);
    expect(result.rows).toEqual([
      { rowNumber: 2, values: ['مصر', 'Egypt'] },
      { rowNumber: 3, values: ['المغرب', 'Morocco'] },
    ]);
  });

  it.each([
    [['nameEn', 'nameAr'], 'invalidHeaders'],
    [['nameAr', 'nameAr'], 'duplicateHeaders'],
  ] as const)('rejects an invalid header contract', (headers, code) => {
    expectImportError(() => parseSpreadsheetBuffer(workbookBuffer([headers, ['Egypt', 'مصر']]), policy), code);
  });

  it('rejects formula cells and row counts above the policy limit', () => {
    const formulaSheet = XLSX.utils.aoa_to_sheet([['nameAr', 'nameEn'], ['مصر', 'Egypt']]);
    formulaSheet.B2 = { t: 'n', f: '1+1', v: 2 };
    expectImportError(() => parseSpreadsheetBuffer(sheetBuffer(formulaSheet), policy), 'formulaNotAllowed');
    expectImportError(() => parseSpreadsheetBuffer(workbookBuffer([
      ['nameAr', 'nameEn'], ['مصر', 'Egypt'], ['المغرب', 'Morocco'], ['تونس', 'Tunisia'],
    ]), policy), 'rowLimitExceeded');
  });

  it('validates extension, MIME type, size, and ambiguous submission status', () => {
    expect(validateSpreadsheetFile({ name: 'data.csv', size: 10, mimeType: 'text/csv' }, policy)?.code).toBe('unsupportedExtension');
    expect(validateSpreadsheetFile({ name: 'data.xlsx', size: 10, mimeType: 'text/plain' }, policy)?.code).toBe('unsupportedMime');
    expect(validateSpreadsheetFile({ name: 'data.xlsx', size: 1001, mimeType: null }, policy)?.code).toBe('fileTooLarge');
    expect(isAmbiguousImportError({ status: 0 })).toBe(true);
    expect(isAmbiguousImportError({ status: 503 })).toBe(true);
    expect(isAmbiguousImportError({ status: 409 })).toBe(false);
  });
});

function workbookBuffer(rows: readonly (readonly unknown[])[]): ArrayBuffer {
  return sheetBuffer(XLSX.utils.aoa_to_sheet(rows.map((row) => [...row])));
}
function sheetBuffer(sheet: XLSX.WorkSheet): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Import');
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}
function expectImportError(action: () => unknown, code: SpreadsheetImportError['code']) {
  try { action(); throw new Error('Expected SpreadsheetImportError'); }
  catch (error) { expect(error).toBeInstanceOf(SpreadsheetImportError); expect((error as SpreadsheetImportError).code).toBe(code); }
}

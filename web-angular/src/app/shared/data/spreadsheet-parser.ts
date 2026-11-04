import type { WorkSheet } from 'xlsx';
import {
  SpreadsheetError,
  type SpreadsheetPolicy,
  type SpreadsheetRow,
} from './spreadsheet-contracts';
/** Bound ZIP inflation before handing untrusted workbook bytes to the library. No ZIP64/encrypted imports. */
export function validateWorkbookZip(buffer: ArrayBuffer): void {
  const view = new DataView(buffer);
  if (view.byteLength < 22 || view.getUint32(0, true) !== 0x04034b50)
    throw new SpreadsheetError('invalidWorkbook');
  let end = -1;
  for (let i = view.byteLength - 22; i >= Math.max(0, view.byteLength - 65557); i--) {
    if (
      view.getUint32(i, true) === 0x06054b50 &&
      i + 22 + view.getUint16(i + 20, true) === view.byteLength
    ) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new SpreadsheetError('invalidWorkbook');
  const count = view.getUint16(end + 10, true),
    size = view.getUint32(end + 12, true);
  let offset = view.getUint32(end + 16, true),
    expanded = 0;
  if (
    !count ||
    count > 10000 ||
    view.getUint16(end + 4, true) ||
    view.getUint16(end + 6, true) ||
    offset + size > end
  )
    throw new SpreadsheetError('invalidWorkbook');
  for (let i = 0; i < count; i++) {
    if (
      offset + 46 > end ||
      view.getUint32(offset, true) !== 0x02014b50 ||
      view.getUint16(offset + 8, true) & 1
    )
      throw new SpreadsheetError('invalidWorkbook');
    expanded += view.getUint32(offset + 24, true);
    if (expanded > 32 * 1048576) throw new SpreadsheetError('invalidWorkbook');
    offset +=
      46 +
      view.getUint16(offset + 28, true) +
      view.getUint16(offset + 30, true) +
      view.getUint16(offset + 32, true);
  }
  if (offset > end) throw new SpreadsheetError('invalidWorkbook');
}
export function spreadsheetRows(
  sheet: WorkSheet,
  policy: SpreadsheetPolicy,
): readonly SpreadsheetRow[] {
  const headers: string[] = [],
    rows = new Map<number, string[]>();
  const cells: Record<string, unknown> = sheet;
  for (const [address, cell] of Object.entries(cells)) {
    if (address.startsWith('!')) continue;
    const match = /^([A-Z]+)([1-9]\d*)$/.exec(address);
    if (!match?.[1] || !match[2]) throw new SpreadsheetError('invalidWorkbook');
    let column = 0;
    for (const character of match[1]) column = column * 26 + character.charCodeAt(0) - 64;
    column--;
    const row = Number(match[2]);
    if (!Number.isSafeInteger(row) || row > 1048576) throw new SpreadsheetError('invalidWorkbook');
    if (!cell || typeof cell !== 'object') throw new SpreadsheetError('invalidWorkbook');
    if ('f' in cell && cell.f) throw new SpreadsheetError('formulaNotAllowed');
    const value: unknown = 'v' in cell ? cell.v : null;
    if (
      value !== null &&
      value !== undefined &&
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean'
    )
      throw new SpreadsheetError('invalidWorkbook');
    const text = value === null || value === undefined ? '' : String(value).trim();
    if (row === 1) {
      if (text && column >= policy.headers.length)
        throw new SpreadsheetError('invalidHeaders', {
          expectedHeaders: policy.headers.join(', '),
        });
      if (column < policy.headers.length) headers[column] = text;
      continue;
    }
    if (!text) continue;
    if (column >= policy.headers.length) throw new SpreadsheetError('unexpectedColumns');
    if (!rows.has(row) && rows.size >= policy.maxRows)
      throw new SpreadsheetError('rowLimitExceeded', { maxRows: policy.maxRows });
    const values = rows.get(row) ?? [];
    values[column] = text;
    rows.set(row, values);
  }
  const actual = policy.headers.map((_, i) => headers[i] ?? ''),
    nonempty = actual.filter(Boolean).map((v) => v.toLowerCase());
  if (new Set(nonempty).size !== nonempty.length) throw new SpreadsheetError('duplicateHeaders');
  if (actual.some((value, i) => value !== policy.headers[i]))
    throw new SpreadsheetError('invalidHeaders', { expectedHeaders: policy.headers.join(', ') });
  if (!rows.size) throw new SpreadsheetError('emptyFile');
  return [...rows]
    .sort(([a], [b]) => a - b)
    .map(([rowNumber, values]) => ({
      rowNumber,
      values: policy.headers.map((_, i) => values[i] ?? ''),
    }));
}

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const DEFAULT_IMPORT_MAX_BYTES = 5 * 1024 * 1024;

const DEFAULT_ALLOWED_MIME_TYPES = [XLSX_MIME_TYPE, 'application/octet-stream'] as const;

export type SpreadsheetImportErrorCode =
  | 'unsupportedExtension'
  | 'unsupportedMime'
  | 'fileTooLarge'
  | 'emptyFile'
  | 'invalidWorkbook'
  | 'missingWorksheet'
  | 'duplicateHeaders'
  | 'invalidHeaders'
  | 'unexpectedColumns'
  | 'formulaNotAllowed'
  | 'rowLimitExceeded'
  | 'parseFailed';

export class SpreadsheetImportError extends Error {
  constructor(
    public readonly code: SpreadsheetImportErrorCode,
    public readonly details: Record<string, string | number> = {},
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = 'SpreadsheetImportError';
  }
}

export interface NativeSpreadsheetFile {
  uri: string;
  name: string;
  size: number;
  mimeType?: string | null;
}

export interface SpreadsheetImportPolicy {
  headers: readonly string[];
  maxRows: number;
  maxBytes?: number;
  allowedMimeTypes?: readonly string[];
  worksheetIndex?: number;
}

export interface SpreadsheetImportRow {
  rowNumber: number;
  values: string[];
}

export interface SpreadsheetImportResult {
  sheetName: string;
  rows: SpreadsheetImportRow[];
}

export async function pickNativeSpreadsheet(): Promise<NativeSpreadsheetFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: XLSX_MIME_TYPE,
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    size: asset.size ?? new File(asset.uri).size,
    mimeType: asset.mimeType,
  };
}

export function validateSpreadsheetFile(
  file: Pick<NativeSpreadsheetFile, 'name' | 'size' | 'mimeType'>,
  policy: SpreadsheetImportPolicy,
): SpreadsheetImportError | null {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return new SpreadsheetImportError('unsupportedExtension');
  }
  const allowedMimeTypes = policy.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  if (file.mimeType && !allowedMimeTypes.includes(file.mimeType.toLowerCase())) {
    return new SpreadsheetImportError('unsupportedMime');
  }
  const maxBytes = policy.maxBytes ?? DEFAULT_IMPORT_MAX_BYTES;
  if (file.size > maxBytes) {
    return new SpreadsheetImportError('fileTooLarge', {
      maxSizeMb: Math.floor(maxBytes / (1024 * 1024)),
    });
  }
  if (file.size === 0) return new SpreadsheetImportError('emptyFile');
  return null;
}

export async function parseNativeSpreadsheet(
  file: NativeSpreadsheetFile,
  policy: SpreadsheetImportPolicy,
): Promise<SpreadsheetImportResult> {
  const fileError = validateSpreadsheetFile(file, policy);
  if (fileError) throw fileError;
  return parseSpreadsheetBuffer(await new File(file.uri).arrayBuffer(), policy);
}

export function parseSpreadsheetBuffer(
  buffer: ArrayBuffer,
  policy: SpreadsheetImportPolicy,
): SpreadsheetImportResult {
  try {
    if (!hasZipSignature(buffer)) throw new SpreadsheetImportError('invalidWorkbook');
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: false,
      cellFormula: true,
      cellHTML: false,
      cellStyles: false,
      bookDeps: false,
      bookVBA: false,
    });
    const sheetName = workbook.SheetNames[policy.worksheetIndex ?? 0];
    const worksheet = sheetName ? workbook.Sheets[sheetName] : undefined;
    if (!sheetName || !worksheet) throw new SpreadsheetImportError('missingWorksheet');

    const headers: string[] = [];
    const rowValues = new Map<number, string[]>();
    for (const address of Object.keys(worksheet)) {
      if (address.startsWith('!')) continue;
      const cell = worksheet[address] as XLSX.CellObject | undefined;
      if (!cell) continue;
      const { r: rowIndex, c: columnIndex } = XLSX.utils.decode_cell(address);
      if (cell.f) throw new SpreadsheetImportError('formulaNotAllowed');
      const value = normalizeCellValue(cell.v);
      if (rowIndex === 0) {
        headers[columnIndex] = value;
        continue;
      }
      if (!value) continue;
      if (columnIndex >= policy.headers.length) {
        throw new SpreadsheetImportError('unexpectedColumns');
      }
      const values = rowValues.get(rowIndex) ?? [];
      values[columnIndex] = value;
      rowValues.set(rowIndex, values);
    }

    validateHeaders(headers, policy.headers);
    if (rowValues.size > policy.maxRows) {
      throw new SpreadsheetImportError('rowLimitExceeded', { maxRows: policy.maxRows });
    }
    const rows = [...rowValues.entries()]
      .sort(([left], [right]) => left - right)
      .map(([rowIndex, values]) => ({
        rowNumber: rowIndex + 1,
        values: policy.headers.map((_, columnIndex) => values[columnIndex] ?? ''),
      }));
    if (rows.length === 0) throw new SpreadsheetImportError('emptyFile');
    return { sheetName, rows };
  } catch (error) {
    if (error instanceof SpreadsheetImportError) throw error;
    throw new SpreadsheetImportError('parseFailed', {}, { cause: error });
  }
}

export async function shareSpreadsheetTemplate(
  headers: readonly string[],
  fileName: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('sharingUnavailable');
  const worksheet = XLSX.utils.aoa_to_sheet([[...headers]]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import');
  const bytes = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
    compression: true,
  }) as ArrayBuffer;
  const target = new File(Paths.cache, ensureXlsxExtension(fileName));
  target.create({ overwrite: true, intermediates: true });
  target.write(new Uint8Array(bytes));
  await Sharing.shareAsync(target.uri, { mimeType: XLSX_MIME_TYPE, dialogTitle: fileName });
}

export function isAmbiguousImportError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' && (status === 0 || status >= 500);
}

function validateHeaders(actualHeaders: string[], expectedHeaders: readonly string[]) {
  const actual = trimTrailingEmpty(actualHeaders).map((value) => value.trim());
  const expected = expectedHeaders.map((value) => value.trim());
  const nonEmpty = actual.filter(Boolean).map((value) => value.toLocaleLowerCase('en-US'));
  if (new Set(nonEmpty).size !== nonEmpty.length) {
    throw new SpreadsheetImportError('duplicateHeaders');
  }
  if (actual.length !== expected.length || expected.some((header, index) => actual[index] !== header)) {
    throw new SpreadsheetImportError('invalidHeaders', { expectedHeaders: expected.join(', ') });
  }
}

function normalizeCellValue(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function trimTrailingEmpty(values: string[]): string[] {
  const result = [...values];
  while (result.length && !result.at(-1)?.trim()) result.pop();
  return result;
}

function hasZipSignature(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const signature = new Uint8Array(buffer, 0, 4);
  return signature[0] === 0x50 && signature[1] === 0x4b
    && ((signature[2] === 0x03 && signature[3] === 0x04)
      || (signature[2] === 0x05 && signature[3] === 0x06)
      || (signature[2] === 0x07 && signature[3] === 0x08));
}

function ensureXlsxExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
}

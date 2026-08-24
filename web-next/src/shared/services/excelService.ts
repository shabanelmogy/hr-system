import * as XLSX from "xlsx";

export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const XLSX_FILE_ACCEPT = `.xlsx,${XLSX_MIME_TYPE}`;
export const DEFAULT_IMPORT_MAX_BYTES = 5 * 1024 * 1024;

const DEFAULT_ALLOWED_MIME_TYPES = [
  XLSX_MIME_TYPE,
  "application/octet-stream",
] as const;

export type SpreadsheetImportErrorCode =
  | "unsupportedExtension"
  | "unsupportedMime"
  | "fileTooLarge"
  | "emptyFile"
  | "invalidWorkbook"
  | "missingWorksheet"
  | "duplicateHeaders"
  | "invalidHeaders"
  | "unexpectedColumns"
  | "formulaNotAllowed"
  | "rowLimitExceeded"
  | "parseFailed";

export class SpreadsheetImportError extends Error {
  constructor(
    public readonly code: SpreadsheetImportErrorCode,
    public readonly details: Record<string, string | number> = {},
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "SpreadsheetImportError";
  }
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

export type SpreadsheetImportViewState =
  | "idle"
  | "parsing"
  | "preview"
  | "submitting"
  | "succeeded"
  | "failed"
  | "uncertain";

export type SpreadsheetImportRowStatus =
  | "pending"
  | "invalid"
  | "submitted"
  | "uploaded"
  | "failed"
  | "uncertain";

type SpreadsheetFileMetadata = Pick<File, "name" | "size" | "type">;

export function validateSpreadsheetImportFile(
  file: SpreadsheetFileMetadata,
  policy: SpreadsheetImportPolicy,
): SpreadsheetImportError | null {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return new SpreadsheetImportError("unsupportedExtension");
  }

  const allowedMimeTypes = policy.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  if (file.type && !allowedMimeTypes.includes(file.type.toLowerCase())) {
    return new SpreadsheetImportError("unsupportedMime");
  }

  const maxBytes = policy.maxBytes ?? DEFAULT_IMPORT_MAX_BYTES;
  if (file.size > maxBytes) {
    return new SpreadsheetImportError("fileTooLarge", {
      maxSizeMb: Math.floor(maxBytes / (1024 * 1024)),
    });
  }

  if (file.size === 0) {
    return new SpreadsheetImportError("emptyFile");
  }

  return null;
}

export async function parseSpreadsheetImportFile(
  file: File,
  policy: SpreadsheetImportPolicy,
): Promise<SpreadsheetImportResult> {
  const fileError = validateSpreadsheetImportFile(file, policy);
  if (fileError) throw fileError;

  try {
    const fileBuffer = await file.arrayBuffer();
    if (!hasZipSignature(fileBuffer)) {
      throw new SpreadsheetImportError("invalidWorkbook");
    }

    const workbook = XLSX.read(fileBuffer, {
      type: "array",
      cellDates: false,
      // SheetJS does not execute formulas. Keep formula metadata so imports can
      // reject formula cells instead of accepting cached, potentially stale values.
      cellFormula: true,
      cellHTML: false,
      cellStyles: false,
      bookDeps: false,
      bookVBA: false,
    });
    const worksheetIndex = policy.worksheetIndex ?? 0;
    const sheetName = workbook.SheetNames[worksheetIndex];
    const worksheet = sheetName ? workbook.Sheets[sheetName] : undefined;

    if (!sheetName || !worksheet) {
      throw new SpreadsheetImportError("missingWorksheet");
    }

    const headerValues: string[] = [];

    for (const address of Object.keys(worksheet)) {
      if (address.startsWith("!")) continue;

      const cell = worksheet[address] as XLSX.CellObject | undefined;
      if (!cell) continue;
      const { r: rowIndex, c: columnIndex } = XLSX.utils.decode_cell(address);
      if (rowIndex !== 0) continue;
      if (cell.f) throw new SpreadsheetImportError("formulaNotAllowed");
      headerValues[columnIndex] = normalizeCellValue(cell.v);
    }

    validateHeaders(headerValues, policy.headers);

    const rowValues = new Map<number, string[]>();
    for (const address of Object.keys(worksheet)) {
      if (address.startsWith("!")) continue;

      const cell = worksheet[address] as XLSX.CellObject | undefined;
      if (!cell) continue;
      const { r: rowIndex, c: columnIndex } = XLSX.utils.decode_cell(address);
      if (rowIndex === 0) continue;
      if (cell.f) throw new SpreadsheetImportError("formulaNotAllowed");

      const value = normalizeCellValue(cell.v);
      if (!value) continue;
      if (columnIndex >= policy.headers.length) {
        throw new SpreadsheetImportError("unexpectedColumns");
      }

      if (!rowValues.has(rowIndex) && rowValues.size >= policy.maxRows) {
        throw new SpreadsheetImportError("rowLimitExceeded", {
          maxRows: policy.maxRows,
        });
      }

      const values = rowValues.get(rowIndex) ?? [];
      values[columnIndex] = value;
      rowValues.set(rowIndex, values);
    }

    const rows = [...rowValues.entries()]
      .sort(([left], [right]) => left - right)
      .map(([rowIndex, values]) => ({
        rowNumber: rowIndex + 1,
        values: policy.headers.map((_, columnIndex) => values[columnIndex] ?? ""),
      }));

    if (rows.length === 0) {
      throw new SpreadsheetImportError("emptyFile");
    }
    return { sheetName, rows };
  } catch (error) {
    if (error instanceof SpreadsheetImportError) throw error;
    throw new SpreadsheetImportError("parseFailed", {}, { cause: error });
  }
}

export function downloadSpreadsheetImportTemplate(
  headers: readonly string[],
  fileName: string,
) {
  const worksheet = XLSX.utils.aoa_to_sheet([[...headers]]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Import");
  XLSX.writeFile(workbook, ensureXlsxExtension(fileName), {
    bookType: "xlsx",
    compression: true,
  });
}

export function isAmbiguousImportSubmissionError(error: unknown): boolean {
  const status = getNumericProperty(error, "status");
  return status === 0 || (status !== null && status >= 500);
}

export function toSpreadsheetImportError(error: unknown): SpreadsheetImportError {
  return error instanceof SpreadsheetImportError
    ? error
    : new SpreadsheetImportError("parseFailed", {}, { cause: error });
}

function validateHeaders(actualHeaders: string[], expectedHeaders: readonly string[]) {
  const actual = trimTrailingEmptyValues(actualHeaders).map((value) => value.trim());
  const expected = expectedHeaders.map((value) => value.trim());
  const nonEmptyHeaders = actual.filter(Boolean).map(normalizeHeaderForDuplicateCheck);

  if (new Set(nonEmptyHeaders).size !== nonEmptyHeaders.length) {
    throw new SpreadsheetImportError("duplicateHeaders");
  }

  if (
    actual.length !== expected.length ||
    expected.some((header, index) => actual[index] !== header)
  ) {
    throw new SpreadsheetImportError("invalidHeaders", {
      expectedHeaders: expectedHeaders.join(", "),
    });
  }
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeHeaderForDuplicateCheck(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function trimTrailingEmptyValues(values: string[]): string[] {
  const result = [...values];
  while (result.length > 0 && !result.at(-1)?.trim()) result.pop();
  return result;
}

function ensureXlsxExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
}

function hasZipSignature(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const signature = new Uint8Array(buffer, 0, 4);
  return (
    signature[0] === 0x50 &&
    signature[1] === 0x4b &&
    ((signature[2] === 0x03 && signature[3] === 0x04) ||
      (signature[2] === 0x05 && signature[3] === 0x06) ||
      (signature[2] === 0x07 && signature[3] === 0x08))
  );
}

function getNumericProperty(value: unknown, property: string): number | null {
  if (!value || typeof value !== "object") return null;
  const candidate = (value as Record<string, unknown>)[property];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : null;
}

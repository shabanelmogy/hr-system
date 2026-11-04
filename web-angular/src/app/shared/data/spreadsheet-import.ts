import { Injectable } from '@angular/core';
import { downloadBlob } from './blob-download';

import {
  SpreadsheetError,
  type SpreadsheetPolicy,
  type SpreadsheetRow,
} from './spreadsheet-contracts';
export {
  SpreadsheetError,
  type SpreadsheetPolicy,
  type SpreadsheetRow,
  type ImportRowStatus,
  type ImportPhase,
} from './spreadsheet-contracts';
export const spreadsheetMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export function downloadSpreadsheetBlob(blob: Blob, fileName: string): void {
  downloadBlob(blob, fileName);
}
export function validateSpreadsheetFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
  policy: SpreadsheetPolicy,
): void {
  if (!file.name.toLowerCase().endsWith('.xlsx'))
    throw new SpreadsheetError('unsupportedExtension');
  if (file.type && ![spreadsheetMime, 'application/octet-stream'].includes(file.type.toLowerCase()))
    throw new SpreadsheetError('unsupportedMime');
  if (file.size > policy.maxBytes)
    throw new SpreadsheetError('fileTooLarge', { maxSizeMb: policy.maxBytes / 1048576 });
  if (!file.size) throw new SpreadsheetError('emptyFile');
}
@Injectable({ providedIn: 'root' })
export class SpreadsheetFiles {
  async parse(file: File, policy: SpreadsheetPolicy): Promise<readonly SpreadsheetRow[]> {
    validateSpreadsheetFile(file, policy);
    try {
      const buffer = await file.arrayBuffer(),
        parser = await import('./spreadsheet-parser');
      parser.validateWorkbookZip(buffer);
      const XLSX = await import('xlsx');
      const book = XLSX.read(buffer, {
        type: 'array',
        sheets: 0,
        cellFormula: true,
        cellDates: false,
        cellHTML: false,
        cellStyles: false,
        bookVBA: false,
        bookDeps: false,
      });
      const firstSheet = book.SheetNames[0];
      const sheet = firstSheet === undefined ? undefined : book.Sheets[firstSheet];
      if (!sheet) throw new SpreadsheetError('missingWorksheet');
      return parser.spreadsheetRows(sheet, policy);
    } catch (error) {
      if (error instanceof SpreadsheetError) throw error;
      throw new SpreadsheetError('parseFailed');
    }
  }
  async template(headers: readonly string[]): Promise<Blob> {
    const XLSX = await import('xlsx'),
      book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([[...headers]]), 'Import');
    return new Blob([XLSX.write(book, { type: 'array', bookType: 'xlsx', compression: true })], {
      type: spreadsheetMime,
    });
  }
}

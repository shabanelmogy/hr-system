import type { TFunction } from 'i18next';

import { SpreadsheetImportError } from './native-spreadsheet';

export function spreadsheetErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof SpreadsheetImportError) {
    return t(`spreadsheetImport.errors.${error.code}`, error.details);
  }
  if (error instanceof Error && error.message === 'sharingUnavailable') {
    return t('spreadsheetImport.errors.sharingUnavailable');
  }
  return error instanceof Error && error.message
    ? error.message
    : t('spreadsheetImport.errors.parseFailed');
}

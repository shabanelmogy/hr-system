import type { TFunction } from 'i18next';

import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseNativeSpreadsheet,
  type NativeSpreadsheetFile,
  type SpreadsheetImportPolicy,
  type SpreadsheetImportRow,
} from '@/src/shared/importing';
import type { CountryRequest } from '../../types/country';
import { createCountryRequestSchema } from '../../validation/country-request-schema';

export const COUNTRY_IMPORT_HEADERS = [
  'nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode',
] as const;
export const COUNTRY_IMPORT_MAX_ROWS = 100;
export const COUNTRY_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const COUNTRY_IMPORT_TEMPLATE_FILE = 'countries-import-template.xlsx';
export const COUNTRY_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: COUNTRY_IMPORT_HEADERS,
  maxRows: COUNTRY_IMPORT_MAX_ROWS,
  maxBytes: COUNTRY_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export type CountryImportRowStatus = 'ready' | 'invalid' | 'uploaded' | 'failed' | 'uncertain';
export interface CountryImportRow {
  rowNumber: number;
  values: Record<(typeof COUNTRY_IMPORT_HEADERS)[number], string>;
  request: CountryRequest | null;
  status: CountryImportRowStatus;
  error?: string;
}

export async function parseCountryImport(
  file: NativeSpreadsheetFile,
  t: TFunction,
): Promise<CountryImportRow[]> {
  const result = await parseNativeSpreadsheet(file, COUNTRY_IMPORT_POLICY);
  return buildCountryImportRows(result.rows, t);
}

export function buildCountryImportRows(
  rows: readonly SpreadsheetImportRow[],
  t: TFunction,
): CountryImportRow[] {
  const schema = createCountryRequestSchema(t);
  const duplicateTracker = createDuplicateTracker();
  return rows.map(({ rowNumber, values }) => {
    const raw = {
      nameAr: values[0], nameEn: values[1], alpha2Code: values[2],
      alpha3Code: values[3], phoneCode: values[4], currencyCode: values[5],
    };
    const validation = schema.safeParse(raw);
    if (!validation.success) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: validation.error.issues[0]?.message };
    }
    const request: CountryRequest = {
      nameAr: validation.data.nameAr.trim(),
      nameEn: validation.data.nameEn.trim(),
      alpha2Code: nullableUpper(validation.data.alpha2Code),
      alpha3Code: nullableUpper(validation.data.alpha3Code),
      phoneCode: nullable(validation.data.phoneCode),
      currencyCode: nullableUpper(validation.data.currencyCode),
    };
    if (registerDuplicate(duplicateTracker, request)) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: t('countries.import.duplicate') };
    }
    return { rowNumber, values: raw, request, status: 'ready' };
  });
}

function createDuplicateTracker() {
  return { nameAr: new Set<string>(), nameEn: new Set<string>(), alpha2: new Set<string>(), alpha3: new Set<string>() };
}

function registerDuplicate(tracker: ReturnType<typeof createDuplicateTracker>, request: CountryRequest): boolean {
  const nameAr = normalize(request.nameAr); const nameEn = normalize(request.nameEn);
  const alpha2 = normalize(request.alpha2Code); const alpha3 = normalize(request.alpha3Code);
  if (tracker.nameAr.has(nameAr) || tracker.nameEn.has(nameEn)
    || (alpha2 && tracker.alpha2.has(alpha2)) || (alpha3 && tracker.alpha3.has(alpha3))) return true;
  tracker.nameAr.add(nameAr); tracker.nameEn.add(nameEn);
  if (alpha2) tracker.alpha2.add(alpha2); if (alpha3) tracker.alpha3.add(alpha3);
  return false;
}

function normalize(value: string | null | undefined): string { return value?.trim().toLocaleLowerCase('en-US') ?? ''; }
function nullable(value: string): string | null { return value.trim() || null; }
function nullableUpper(value: string): string | null { return value.trim() ? value.trim().toUpperCase() : null; }

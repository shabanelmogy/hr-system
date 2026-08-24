import type { TFunction } from 'i18next';

import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseNativeSpreadsheet,
  type NativeSpreadsheetFile,
  type SpreadsheetImportPolicy,
  type SpreadsheetImportRow,
} from '@/src/shared/importing';
import type { StateRequest } from '../../types/state';
import { createStateRequestSchema } from '../../validation/state-request-schema';

export const STATE_IMPORT_HEADERS = ['nameAr', 'nameEn', 'code', 'countryName'] as const;
export const STATE_IMPORT_MAX_ROWS = 100;
export const STATE_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const STATE_IMPORT_TEMPLATE_FILE = 'states-import-template.xlsx';
export const STATE_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: STATE_IMPORT_HEADERS,
  maxRows: STATE_IMPORT_MAX_ROWS,
  maxBytes: STATE_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export interface ImportCountryLookup { id: number; nameAr: string; nameEn: string; isDeleted: boolean; }
export type StateImportRowStatus = 'ready' | 'invalid' | 'uploaded' | 'failed' | 'uncertain';
export interface StateImportRow {
  rowNumber: number;
  values: Record<(typeof STATE_IMPORT_HEADERS)[number], string>;
  request: StateRequest | null;
  status: StateImportRowStatus;
  error?: string;
}

export async function parseStateImport(
  file: NativeSpreadsheetFile,
  countries: readonly ImportCountryLookup[],
  t: TFunction,
): Promise<StateImportRow[]> {
  const result = await parseNativeSpreadsheet(file, STATE_IMPORT_POLICY);
  return buildStateImportRows(result.rows, countries, t);
}

export function buildStateImportRows(
  rows: readonly SpreadsheetImportRow[],
  countries: readonly ImportCountryLookup[],
  t: TFunction,
): StateImportRow[] {
  const schema = createStateRequestSchema(t);
  const lookup = createCountryLookup(countries.filter((country) => !country.isDeleted));
  const duplicates = createDuplicateTracker();
  return rows.map(({ rowNumber, values }) => {
    const raw = { nameAr: values[0], nameEn: values[1], code: values[2], countryName: values[3] };
    const countryId = lookup.get(normalize(raw.countryName));
    if (!countryId) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: t('states.import.unknownCountry', { name: raw.countryName || '—' }) };
    }
    const validation = schema.safeParse({ nameAr: raw.nameAr, nameEn: raw.nameEn, code: raw.code, countryId });
    if (!validation.success) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: validation.error.issues[0]?.message };
    }
    const request: StateRequest = {
      nameAr: validation.data.nameAr.trim(), nameEn: validation.data.nameEn.trim(),
      code: validation.data.code.trim().toUpperCase(), countryId,
    };
    if (registerDuplicate(duplicates, request)) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: t('states.import.duplicate') };
    }
    return { rowNumber, values: raw, request, status: 'ready' };
  });
}

export function createCountryLookup(countries: readonly ImportCountryLookup[]): ReadonlyMap<string, number | null> {
  const lookup = new Map<string, number | null>();
  countries.forEach((country) => {
    registerCountryName(lookup, normalize(country.nameEn), country.id);
    registerCountryName(lookup, normalize(country.nameAr), country.id);
  });
  return lookup;
}

function registerCountryName(lookup: Map<string, number | null>, name: string, id: number) {
  const current = lookup.get(name);
  lookup.set(name, current === undefined || current === id ? id : null);
}

function createDuplicateTracker() {
  return { nameAr: new Set<string>(), nameEn: new Set<string>(), code: new Set<string>() };
}
function registerDuplicate(tracker: ReturnType<typeof createDuplicateTracker>, request: StateRequest): boolean {
  const prefix = `${request.countryId}|`;
  const nameAr = prefix + normalize(request.nameAr); const nameEn = prefix + normalize(request.nameEn); const code = prefix + normalize(request.code);
  if (tracker.nameAr.has(nameAr) || tracker.nameEn.has(nameEn) || tracker.code.has(code)) return true;
  tracker.nameAr.add(nameAr); tracker.nameEn.add(nameEn); tracker.code.add(code); return false;
}
function normalize(value: string): string { return value.trim().toLocaleLowerCase('en-US'); }

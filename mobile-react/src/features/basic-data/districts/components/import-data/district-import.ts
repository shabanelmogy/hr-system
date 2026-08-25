import type { TFunction } from 'i18next';

import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseNativeSpreadsheet,
  type NativeSpreadsheetFile,
  type SpreadsheetImportPolicy,
  type SpreadsheetImportRow,
} from '@/src/shared/importing';
import type { DistrictRequest } from '../../types/district';
import { createDistrictRequestSchema } from '../../validation/district-request-schema';

export const DISTRICT_IMPORT_HEADERS = ['nameAr', 'nameEn', 'code', 'stateName'] as const;
export const DISTRICT_IMPORT_MAX_ROWS = 100;
export const DISTRICT_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const DISTRICT_IMPORT_TEMPLATE_FILE = 'districts-import-template.xlsx';
export const DISTRICT_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: DISTRICT_IMPORT_HEADERS,
  maxRows: DISTRICT_IMPORT_MAX_ROWS,
  maxBytes: DISTRICT_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export interface ImportStateLookup { id: number; nameAr: string; nameEn: string; }
export type DistrictImportRowStatus = 'ready' | 'invalid' | 'uploaded' | 'failed' | 'uncertain';
export interface DistrictImportRow {
  rowNumber: number;
  values: Record<(typeof DISTRICT_IMPORT_HEADERS)[number], string>;
  request: DistrictRequest | null;
  status: DistrictImportRowStatus;
  error?: string;
}

export async function parseDistrictImport(
  file: NativeSpreadsheetFile,
  states: readonly ImportStateLookup[],
  t: TFunction,
): Promise<DistrictImportRow[]> {
  const result = await parseNativeSpreadsheet(file, DISTRICT_IMPORT_POLICY);
  return buildDistrictImportRows(result.rows, states, t);
}

export function buildDistrictImportRows(
  rows: readonly SpreadsheetImportRow[],
  states: readonly ImportStateLookup[],
  t: TFunction,
): DistrictImportRow[] {
  const schema = createDistrictRequestSchema(t);
  const lookup = createStateLookup(states);
  const duplicates = createDuplicateTracker();
  return rows.map(({ rowNumber, values }) => {
    const raw = { nameAr: values[0], nameEn: values[1], code: values[2], stateName: values[3] };
    const stateId = lookup.get(normalize(raw.stateName));
    if (!stateId) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: t('districts.import.unknownState', { name: raw.stateName || '—' }) };
    }
    const validation = schema.safeParse({ nameAr: raw.nameAr, nameEn: raw.nameEn, code: raw.code, stateId });
    if (!validation.success) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: validation.error.issues[0]?.message };
    }
    const request: DistrictRequest = {
      nameAr: validation.data.nameAr.trim(),
      nameEn: validation.data.nameEn.trim(),
      code: validation.data.code.trim().toUpperCase(),
      stateId,
    };
    if (registerDuplicate(duplicates, request)) {
      return { rowNumber, values: raw, request: null, status: 'invalid', error: t('districts.import.duplicate') };
    }
    return { rowNumber, values: raw, request, status: 'ready' };
  });
}

export function createStateLookup(states: readonly ImportStateLookup[]): ReadonlyMap<string, number | null> {
  const lookup = new Map<string, number | null>();
  states.forEach((state) => {
    registerStateName(lookup, normalize(state.nameEn), state.id);
    registerStateName(lookup, normalize(state.nameAr), state.id);
  });
  return lookup;
}

function registerStateName(lookup: Map<string, number | null>, name: string, id: number) {
  const current = lookup.get(name);
  lookup.set(name, current === undefined || current === id ? id : null);
}

function createDuplicateTracker() {
  return { nameAr: new Set<string>(), nameEn: new Set<string>(), code: new Set<string>() };
}

function registerDuplicate(tracker: ReturnType<typeof createDuplicateTracker>, request: DistrictRequest): boolean {
  const prefix = `${request.stateId}|`;
  const nameAr = prefix + normalize(request.nameAr);
  const nameEn = prefix + normalize(request.nameEn);
  const code = prefix + normalize(request.code);
  if (tracker.nameAr.has(nameAr) || tracker.nameEn.has(nameEn) || tracker.code.has(code)) return true;
  tracker.nameAr.add(nameAr);
  tracker.nameEn.add(nameEn);
  tracker.code.add(code);
  return false;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('en-US');
}

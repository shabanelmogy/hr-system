import type { TFunction } from 'i18next';
import { DEFAULT_IMPORT_MAX_BYTES, parseNativeSpreadsheet, type NativeSpreadsheetFile, type SpreadsheetImportPolicy, type SpreadsheetImportRow } from '@/src/shared/importing';
import type { AddressTypeRequest } from '../../types/address-type';
import { createAddressTypeRequestSchema } from '../../validation/address-type-request-schema';

export const ADDRESS_TYPE_IMPORT_HEADERS = ['nameAr', 'nameEn'] as const;
export const ADDRESS_TYPE_IMPORT_MAX_ROWS = 100;
export const ADDRESS_TYPE_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const ADDRESS_TYPE_IMPORT_TEMPLATE_FILE = 'address-types-import-template.xlsx';
export const ADDRESS_TYPE_IMPORT_POLICY: SpreadsheetImportPolicy = { headers: ADDRESS_TYPE_IMPORT_HEADERS, maxRows: ADDRESS_TYPE_IMPORT_MAX_ROWS, maxBytes: ADDRESS_TYPE_IMPORT_MAX_BYTES, worksheetIndex: 0 };
export type AddressTypeImportRowStatus = 'ready' | 'invalid' | 'uploaded' | 'failed' | 'uncertain';
export interface AddressTypeImportRow { rowNumber: number; values: Record<(typeof ADDRESS_TYPE_IMPORT_HEADERS)[number], string>; request: AddressTypeRequest | null; status: AddressTypeImportRowStatus; error?: string; }
export async function parseAddressTypeImport(file: NativeSpreadsheetFile, t: TFunction): Promise<AddressTypeImportRow[]> { return buildAddressTypeImportRows((await parseNativeSpreadsheet(file, ADDRESS_TYPE_IMPORT_POLICY)).rows, t); }
export function buildAddressTypeImportRows(rows: readonly SpreadsheetImportRow[], t: TFunction): AddressTypeImportRow[] {
  const schema = createAddressTypeRequestSchema(t); const nameAr = new Set<string>(); const nameEn = new Set<string>();
  return rows.map(({ rowNumber, values }) => {
    const raw = { nameAr: values[0], nameEn: values[1] }; const validation = schema.safeParse(raw);
    if (!validation.success) return { rowNumber, values: raw, request: null, status: 'invalid', error: validation.error.issues[0]?.message };
    const request = { nameAr: validation.data.nameAr.trim(), nameEn: validation.data.nameEn.trim() }; const ar = request.nameAr.toLocaleLowerCase('ar'); const en = request.nameEn.toLocaleLowerCase('en-US');
    if (nameAr.has(ar) || nameEn.has(en)) return { rowNumber, values: raw, request: null, status: 'invalid', error: t('addressTypes.import.duplicate') };
    nameAr.add(ar); nameEn.add(en); return { rowNumber, values: raw, request, status: 'ready' };
  });
}

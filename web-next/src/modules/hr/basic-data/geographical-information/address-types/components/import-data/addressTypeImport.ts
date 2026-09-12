import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "@/shared/services/excelService";
import type { CreateAddressTypeRequest } from "../../types/AddressType";
import type { AddressTypeImportRow } from "./types";

export const ADDRESS_TYPE_IMPORT_HEADERS = ["nameAr", "nameEn"] as const;
export const ADDRESS_TYPE_IMPORT_MAX_ROWS = 100;
export const ADDRESS_TYPE_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const ADDRESS_TYPE_IMPORT_TEMPLATE_FILE = "address-types-import-template.xlsx";

export const ADDRESS_TYPE_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: ADDRESS_TYPE_IMPORT_HEADERS,
  maxRows: ADDRESS_TYPE_IMPORT_MAX_ROWS,
  maxBytes: ADDRESS_TYPE_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export async function parseAddressTypeImportFile(
  file: File,
  pendingLabel: string,
): Promise<AddressTypeImportRow[]> {
  const { rows } = await parseSpreadsheetImportFile(file, ADDRESS_TYPE_IMPORT_POLICY);
  return rows.map(({ rowNumber, values }) => ({
    nameAr: values[0],
    nameEn: values[1],
    rowNumber,
    uploadStatus: "pending",
    importStatus: pendingLabel,
  }));
}

export function createAddressTypeImportDuplicateTracker() {
  return { nameAr: new Set<string>(), nameEn: new Set<string>() };
}

export function registerAddressTypeImportValues(
  tracker: ReturnType<typeof createAddressTypeImportDuplicateTracker>,
  item: CreateAddressTypeRequest,
): boolean {
  const nameAr = normalize(item.nameAr, "ar");
  const nameEn = normalize(item.nameEn, "en-US");
  if (tracker.nameAr.has(nameAr) || tracker.nameEn.has(nameEn)) return true;
  tracker.nameAr.add(nameAr);
  tracker.nameEn.add(nameEn);
  return false;
}

function normalize(value: string, locale: string): string {
  return value.trim().toLocaleLowerCase(locale);
}

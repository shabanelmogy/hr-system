import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "@/shared/services/excelService";
import type { CountryLookup } from "../../../countries";
import type { ImportState } from "./types";

export const STATE_IMPORT_HEADERS = [
  "nameAr",
  "nameEn",
  "code",
  "countryName",
] as const;
export const STATE_IMPORT_MAX_ROWS = 100;
export const STATE_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const STATE_IMPORT_TEMPLATE_FILE = "states-import-template.xlsx";

export type CountryLookupState =
  | "loading"
  | "ready"
  | "empty"
  | "forbidden"
  | "error";

export interface CountryLookupStatusInput {
  canViewCountries: boolean;
  isPending: boolean;
  isError: boolean;
  countryCount: number;
}

export const STATE_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: STATE_IMPORT_HEADERS,
  maxRows: STATE_IMPORT_MAX_ROWS,
  maxBytes: STATE_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export async function parseStateImportFile(
  file: File,
  pendingLabel: string,
): Promise<ImportState[]> {
  const { rows } = await parseSpreadsheetImportFile(file, STATE_IMPORT_POLICY);
  return rows.map(({ rowNumber, values }) => ({
    nameAr: values[0],
    nameEn: values[1],
    code: values[2],
    countryName: values[3],
    rowNumber,
    uploadStatus: "pending",
    importStatus: pendingLabel,
  }));
}

export function createCountryLookupIndex(
  countries: readonly CountryLookup[],
): ReadonlyMap<string, CountryLookup> {
  const byName = new Map<string, CountryLookup>();
  countries.forEach((country) => {
    byName.set(normalizeLookupName(country.nameEn), country);
    byName.set(normalizeLookupName(country.nameAr), country);
  });
  return byName;
}

export function resolveCountryId(
  lookupIndex: ReadonlyMap<string, CountryLookup>,
  countryName: string,
): number | undefined {
  return lookupIndex.get(normalizeLookupName(countryName))?.id;
}

export function getCountryLookupState({
  canViewCountries,
  isPending,
  isError,
  countryCount,
}: CountryLookupStatusInput): CountryLookupState {
  if (!canViewCountries) return "forbidden";
  if (isPending) return "loading";
  if (isError) return "error";
  return countryCount === 0 ? "empty" : "ready";
}

function normalizeLookupName(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "@/shared/services/excelService";
import type { CreateCountryRequest } from "../../types/Country";
import type { ImportCountry } from "./types";

export const COUNTRY_IMPORT_HEADERS = [
  "nameAr",
  "nameEn",
  "alpha2Code",
  "alpha3Code",
  "phoneCode",
  "currencyCode",
] as const;
export const COUNTRY_IMPORT_MAX_ROWS = 100;
export const COUNTRY_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const COUNTRY_IMPORT_TEMPLATE_FILE = "countries-import-template.xlsx";

export const COUNTRY_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: COUNTRY_IMPORT_HEADERS,
  maxRows: COUNTRY_IMPORT_MAX_ROWS,
  maxBytes: COUNTRY_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export async function parseCountryImportFile(
  file: File,
  pendingLabel: string,
): Promise<ImportCountry[]> {
  const { rows } = await parseSpreadsheetImportFile(file, COUNTRY_IMPORT_POLICY);
  return rows.map(({ rowNumber, values }) => ({
    nameAr: values[0],
    nameEn: values[1],
    alpha2Code: values[2],
    alpha3Code: values[3],
    phoneCode: values[4],
    currencyCode: values[5],
    rowNumber,
    uploadStatus: "pending",
    importStatus: pendingLabel,
  }));
}

export interface CountryImportDuplicateTracker {
  nameAr: Set<string>;
  nameEn: Set<string>;
  alpha2Code: Set<string>;
  alpha3Code: Set<string>;
}

export function createCountryImportDuplicateTracker(): CountryImportDuplicateTracker {
  return {
    nameAr: new Set<string>(),
    nameEn: new Set<string>(),
    alpha2Code: new Set<string>(),
    alpha3Code: new Set<string>(),
  };
}

export function registerCountryImportValues(
  tracker: CountryImportDuplicateTracker,
  country: CreateCountryRequest,
): boolean {
  const values = {
    nameAr: normalize(country.nameAr),
    nameEn: normalize(country.nameEn),
    alpha2Code: normalize(country.alpha2Code),
    alpha3Code: normalize(country.alpha3Code),
  };

  if (
    tracker.nameAr.has(values.nameAr) ||
    tracker.nameEn.has(values.nameEn) ||
    hasOptionalValue(tracker.alpha2Code, values.alpha2Code) ||
    hasOptionalValue(tracker.alpha3Code, values.alpha3Code)
  ) {
    return true;
  }

  tracker.nameAr.add(values.nameAr);
  tracker.nameEn.add(values.nameEn);
  if (values.alpha2Code) tracker.alpha2Code.add(values.alpha2Code);
  if (values.alpha3Code) tracker.alpha3Code.add(values.alpha3Code);
  return false;
}

function normalize(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("en-US") ?? "";
}

function hasOptionalValue(values: Set<string>, value: string): boolean {
  return value.length > 0 && values.has(value);
}

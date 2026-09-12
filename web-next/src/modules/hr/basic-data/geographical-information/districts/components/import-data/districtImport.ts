import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "@/shared/services/excelService";
import type { StateLookup } from "../../../states";
import type { ImportDistrict } from "./types";

export const DISTRICT_IMPORT_HEADERS = [
  "nameAr",
  "nameEn",
  "code",
  "stateName",
] as const;
export const DISTRICT_IMPORT_MAX_ROWS = 100;
export const DISTRICT_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
export const DISTRICT_IMPORT_TEMPLATE_FILE = "districts-import-template.xlsx";

export type StateLookupState =
  | "loading"
  | "ready"
  | "empty"
  | "forbidden"
  | "error";

export interface StateLookupStatusInput {
  canViewStates: boolean;
  isPending: boolean;
  isError: boolean;
  stateCount: number;
}

export const DISTRICT_IMPORT_POLICY: SpreadsheetImportPolicy = {
  headers: DISTRICT_IMPORT_HEADERS,
  maxRows: DISTRICT_IMPORT_MAX_ROWS,
  maxBytes: DISTRICT_IMPORT_MAX_BYTES,
  worksheetIndex: 0,
};

export async function parseDistrictImportFile(
  file: File,
  pendingLabel: string,
): Promise<ImportDistrict[]> {
  const { rows } = await parseSpreadsheetImportFile(file, DISTRICT_IMPORT_POLICY);
  return rows.map(({ rowNumber, values }) => ({
    nameAr: values[0],
    nameEn: values[1],
    code: values[2],
    stateName: values[3],
    rowNumber,
    uploadStatus: "pending",
    importStatus: pendingLabel,
  }));
}

export function createStateLookupIndex(
  states: readonly StateLookup[],
): ReadonlyMap<string, StateLookup> {
  const byName = new Map<string, StateLookup>();
  states.forEach((state) => {
    byName.set(normalizeLookupName(state.nameEn), state);
    byName.set(normalizeLookupName(state.nameAr), state);
  });
  return byName;
}

export function resolveStateId(
  lookupIndex: ReadonlyMap<string, StateLookup>,
  stateName: string,
): number | undefined {
  return lookupIndex.get(normalizeLookupName(stateName))?.id;
}

export function getStateLookupState({
  canViewStates,
  isPending,
  isError,
  stateCount,
}: StateLookupStatusInput): StateLookupState {
  if (!canViewStates) return "forbidden";
  if (isPending) return "loading";
  if (isError) return "error";
  return stateCount === 0 ? "empty" : "ready";
}

function normalizeLookupName(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

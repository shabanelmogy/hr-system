import type {
  SpreadsheetPolicy,
  SpreadsheetRow,
  ImportRowStatus,
} from '../../../../../shared/data/spreadsheet-public-api';
import type { CountryLookup } from '../../countries/lookup.public-api';
import { stateFieldError, parseStateMutation, type StateDraft } from './state-mutation';

export const stateImportFields = ['nameAr', 'nameEn', 'code', 'countryName'] as const;
export type StateImportField = (typeof stateImportFields)[number];
export const stateImportPolicy: SpreadsheetPolicy = {
  headers: stateImportFields,
  maxRows: 100,
  maxBytes: 5 * 1048576,
};
export interface StateImportIssue {
  readonly field: StateImportField | null;
  readonly kind:
    | 'required'
    | 'minlength'
    | 'maxlength'
    | 'invalidText'
    | 'pattern'
    | 'unknownCountry'
    | 'ambiguousCountry'
    | 'duplicate'
    | 'server'
    | 'batchRejected'
    | 'notSent'
    | 'uncertain';
  readonly relatedRow?: number;
  readonly message?: string;
}
export interface StateImportRow {
  readonly rowNumber: number;
  readonly draft: Readonly<Record<StateImportField, string>>;
  readonly countryId: number | null;
  readonly status: ImportRowStatus;
  readonly issues: readonly StateImportIssue[];
}
const normalize = (value: string) => value.trim().normalize('NFC').toLocaleLowerCase('en-US');

export function stateImportRows(rows: readonly SpreadsheetRow[]): readonly StateImportRow[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    draft: {
      nameAr: row.values[0] ?? '',
      nameEn: row.values[1] ?? '',
      code: row.values[2] ?? '',
      countryName: row.values[3] ?? '',
    },
    countryId: null,
    status: 'pending',
    issues: [],
  }));
}
export function validateStateImport(
  rows: readonly StateImportRow[],
  countries: readonly CountryLookup[],
): { rows: readonly StateImportRow[]; valid: readonly StateDraft[] } {
  const parentNames = new Map<string, Set<number>>();
  for (const country of countries) {
    if (country.isDeleted) continue;
    for (const name of [country.nameAr, country.nameEn]) {
      const key = normalize(name);
      const ids = parentNames.get(key) ?? new Set<number>();
      ids.add(country.id);
      parentNames.set(key, ids);
    }
  }
  const seen = {
    nameAr: new Map<string, number>(),
    nameEn: new Map<string, number>(),
    code: new Map<string, number>(),
  };
  const valid: StateDraft[] = [];
  const checked = rows.map((row): StateImportRow => {
    if (row.status !== 'pending') return row;
    const issues: StateImportIssue[] = [];
    for (const field of ['nameAr', 'nameEn', 'code'] as const) {
      const errors = stateFieldError(field, row.draft[field]);
      if (errors)
        issues.push({
          field,
          kind:
            'required' in errors
              ? 'required'
              : 'minlength' in errors
                ? 'minlength'
                : 'maxlength' in errors
                  ? 'maxlength'
                  : 'invalidText' in errors
                    ? 'invalidText'
                    : 'pattern',
        });
    }
    const parent = normalize(row.draft.countryName);
    const ids = parentNames.get(parent);
    const countryId = ids?.size === 1 ? ([...ids][0] ?? null) : null;
    if (!parent) issues.push({ field: 'countryName', kind: 'required' });
    else if (!ids?.size) issues.push({ field: 'countryName', kind: 'unknownCountry' });
    else if (ids.size > 1) issues.push({ field: 'countryName', kind: 'ambiguousCountry' });
    if (issues.length || countryId === null)
      return { ...row, countryId, status: 'invalid', issues };
    const mutation = parseStateMutation({
      nameAr: row.draft.nameAr,
      nameEn: row.draft.nameEn,
      code: row.draft.code,
      countryId,
    });
    for (const field of ['nameAr', 'nameEn', 'code'] as const) {
      const relatedRow = seen[field].get(countryId + '\0' + normalize(mutation[field]));
      if (relatedRow !== undefined) issues.push({ field, kind: 'duplicate', relatedRow });
    }
    if (issues.length) return { ...row, countryId, status: 'invalid', issues };
    for (const field of ['nameAr', 'nameEn', 'code'] as const)
      seen[field].set(countryId + '\0' + normalize(mutation[field]), row.rowNumber);
    valid.push(mutation);
    return { ...row, countryId, status: 'submitted', issues: [] };
  });
  return { rows: checked, valid };
}

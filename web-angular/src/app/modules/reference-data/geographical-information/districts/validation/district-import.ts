import type {
  SpreadsheetPolicy,
  SpreadsheetRow,
  ImportRowStatus,
} from '../../../../../shared/data/spreadsheet-public-api';
import type { StateLookup } from '../../states/lookup.public-api';
import { districtFieldError, parseDistrictMutation, type DistrictDraft } from './district-mutation';

export const districtImportFields = ['nameAr', 'nameEn', 'code', 'stateName'] as const;
export type DistrictImportField = (typeof districtImportFields)[number];
export const districtImportPolicy: SpreadsheetPolicy = {
  headers: districtImportFields,
  maxRows: 100,
  maxBytes: 5 * 1048576,
};
export interface DistrictImportIssue {
  readonly field: DistrictImportField | null;
  readonly kind:
    | 'required'
    | 'minlength'
    | 'maxlength'
    | 'invalidText'
    | 'pattern'
    | 'unknownState'
    | 'ambiguousState'
    | 'duplicate'
    | 'server'
    | 'batchRejected'
    | 'notSent'
    | 'uncertain';
  readonly relatedRow?: number;
  readonly message?: string;
}
export interface DistrictImportRow {
  readonly rowNumber: number;
  readonly draft: Readonly<Record<DistrictImportField, string>>;
  readonly stateId: number | null;
  readonly status: ImportRowStatus;
  readonly issues: readonly DistrictImportIssue[];
}
const normalize = (value: string) => value.trim().normalize('NFC').toLocaleLowerCase('en-US');

export function districtImportRows(rows: readonly SpreadsheetRow[]): readonly DistrictImportRow[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    draft: {
      nameAr: row.values[0] ?? '',
      nameEn: row.values[1] ?? '',
      code: row.values[2] ?? '',
      stateName: row.values[3] ?? '',
    },
    stateId: null,
    status: 'pending',
    issues: [],
  }));
}
export function validateDistrictImport(
  rows: readonly DistrictImportRow[],
  states: readonly StateLookup[],
): { rows: readonly DistrictImportRow[]; valid: readonly DistrictDraft[] } {
  const parentNames = new Map<string, Set<number>>();
  for (const state of states) {
    for (const name of [state.nameAr, state.nameEn]) {
      const key = normalize(name);
      const ids = parentNames.get(key) ?? new Set<number>();
      ids.add(state.id);
      parentNames.set(key, ids);
    }
  }
  const seen = {
    nameAr: new Map<string, number>(),
    nameEn: new Map<string, number>(),
    code: new Map<string, number>(),
  };
  const valid: DistrictDraft[] = [];
  const checked = rows.map((row): DistrictImportRow => {
    if (row.status !== 'pending') return row;
    const issues: DistrictImportIssue[] = [];
    for (const field of ['nameAr', 'nameEn', 'code'] as const) {
      const errors = districtFieldError(field, row.draft[field]);
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
    const parent = normalize(row.draft.stateName);
    const ids = parentNames.get(parent);
    const stateId = ids?.size === 1 ? ([...ids][0] ?? null) : null;
    if (!parent) issues.push({ field: 'stateName', kind: 'required' });
    else if (!ids?.size) issues.push({ field: 'stateName', kind: 'unknownState' });
    else if (ids.size > 1) issues.push({ field: 'stateName', kind: 'ambiguousState' });
    if (issues.length || stateId === null) return { ...row, stateId, status: 'invalid', issues };
    const mutation = parseDistrictMutation({
      nameAr: row.draft.nameAr,
      nameEn: row.draft.nameEn,
      code: row.draft.code,
      stateId,
    });
    for (const field of ['nameAr', 'nameEn', 'code'] as const) {
      const relatedRow = seen[field].get(stateId + '\0' + normalize(mutation[field]));
      if (relatedRow !== undefined) issues.push({ field, kind: 'duplicate', relatedRow });
    }
    if (issues.length) return { ...row, stateId, status: 'invalid', issues };
    for (const field of ['nameAr', 'nameEn', 'code'] as const)
      seen[field].set(stateId + '\0' + normalize(mutation[field]), row.rowNumber);
    valid.push(mutation);
    return { ...row, stateId, status: 'submitted', issues: [] };
  });
  return { rows: checked, valid };
}

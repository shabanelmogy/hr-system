import {
  countryFieldError,
  countryMutationFields,
  parseCountryMutation,
  type CountryDraft,
  type CountryMutation,
  type CountryMutationField,
} from './country-mutation';
import type {
  SpreadsheetPolicy,
  SpreadsheetRow,
  ImportRowStatus,
} from '../../../../../shared/data/spreadsheet-public-api';
export const countryImportPolicy: SpreadsheetPolicy = {
  headers: countryMutationFields,
  maxRows: 100,
  maxBytes: 5 * 1048576,
};
export interface CountryImportRow {
  readonly rowNumber: number;
  readonly draft: CountryDraft;
  readonly status: ImportRowStatus;
  readonly errors: readonly string[];
  readonly issues: readonly CountryImportIssue[];
}
export interface CountryImportIssue {
  readonly field: CountryMutationField | null;
  readonly kind:
    | 'required'
    | 'minlength'
    | 'maxlength'
    | 'invalidText'
    | 'pattern'
    | 'duplicate'
    | 'server'
    | 'batchRejected'
    | 'notSent'
    | 'uncertain';
  readonly relatedRow?: number;
  readonly message?: string;
}
export function validateCountryImport(rows: readonly CountryImportRow[]): {
  rows: readonly CountryImportRow[];
  valid: readonly CountryDraft[];
} {
  const seen = {
      nameAr: new Map<string, number>(),
      nameEn: new Map<string, number>(),
      alpha2Code: new Map<string, number>(),
      alpha3Code: new Map<string, number>(),
    },
    valid: CountryDraft[] = [];
  return {
    rows: rows.map((row) => {
      if (row.status !== 'pending') return row;
      const issues: CountryImportIssue[] = countryMutationFields.flatMap((field) => {
        const details = countryFieldError(field, row.draft[field]);
        if (!details) return [];
        const kind =
          'required' in details
            ? 'required'
            : 'minlength' in details
              ? 'minlength'
              : 'maxlength' in details
                ? 'maxlength'
                : 'invalidText' in details
                  ? 'invalidText'
                  : 'pattern';
        return [{ field, kind }];
      });
      const errors: string[] = issues.flatMap((issue) => (issue.field ? [issue.field] : []));
      let mutation: CountryMutation | null = null;
      if (!errors.length) {
        mutation = parseCountryMutation(row.draft);
        for (const field of Object.keys(seen) as (keyof typeof seen)[]) {
          const value = mutation[field];
          const relatedRow = value ? seen[field].get(value.toLocaleLowerCase('en-US')) : undefined;
          if (relatedRow !== undefined) issues.push({ field, kind: 'duplicate', relatedRow });
        }
        if (issues.length) errors.push('duplicate');
      }
      if (errors.length) return { ...row, status: 'invalid', errors, issues };
      if (!mutation) return row;
      for (const field of Object.keys(seen) as (keyof typeof seen)[]) {
        const value = mutation[field];
        if (value) seen[field].set(value.toLocaleLowerCase('en-US'), row.rowNumber);
      }
      valid.push(row.draft);
      return { ...row, status: 'submitted', errors: [], issues: [] };
    }),
    valid,
  };
}
export function countryImportRows(rows: readonly SpreadsheetRow[]): readonly CountryImportRow[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    draft: {
      nameAr: row.values[0] ?? '',
      nameEn: row.values[1] ?? '',
      alpha2Code: row.values[2] ?? '',
      alpha3Code: row.values[3] ?? '',
      phoneCode: row.values[4] ?? '',
      currencyCode: row.values[5] ?? '',
    },
    status: 'pending',
    errors: [],
    issues: [],
  }));
}
export function countryBulkPayload(input: readonly CountryDraft[]): readonly CountryMutation[] {
  if (!Array.isArray(input) || !input.length || input.length > 100)
    throw Error('Invalid import batch');
  const checked = validateCountryImport(
    input.map((draft: CountryDraft, i) => ({
      draft,
      rowNumber: i + 2,
      status: 'pending',
      errors: [],
      issues: [],
    })),
  );
  if (checked.valid.length !== input.length) throw Error('Invalid import batch');
  return input.map(parseCountryMutation);
}
export function parseCountryCreatedCount(value: unknown, expected: number): number {
  if (
    typeof value !== 'object' ||
    !value ||
    !('createdCount' in value) ||
    value.createdCount !== expected
  )
    throw Error('Invalid import result');
  return expected;
}

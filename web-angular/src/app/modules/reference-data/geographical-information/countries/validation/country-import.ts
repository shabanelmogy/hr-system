import {
  countryFieldError,
  countryMutationFields,
  parseCountryMutation,
  type CountryDraft,
  type CountryMutation,
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
}
export function validateCountryImport(rows: readonly CountryImportRow[]): {
  rows: readonly CountryImportRow[];
  valid: readonly CountryDraft[];
} {
  const seen = {
      nameAr: new Set<string>(),
      nameEn: new Set<string>(),
      alpha2Code: new Set<string>(),
      alpha3Code: new Set<string>(),
    },
    valid: CountryDraft[] = [];
  return {
    rows: rows.map((row) => {
      if (row.status !== 'pending') return row;
      const errors: string[] = countryMutationFields
        .filter((field) => countryFieldError(field, row.draft[field]))
        .map((field) => field);
      let mutation: CountryMutation | null = null;
      if (!errors.length) {
        mutation = parseCountryMutation(row.draft);
        if (
          (Object.keys(seen) as (keyof typeof seen)[]).some(
            (field) =>
              !!mutation![field] && seen[field].has(mutation![field].toLocaleLowerCase('en-US')),
          )
        )
          errors.push('duplicate');
      }
      if (errors.length) return { ...row, status: 'invalid', errors };
      for (const field of Object.keys(seen) as (keyof typeof seen)[]) {
        const value = mutation![field];
        if (value) seen[field].add(value.toLocaleLowerCase('en-US'));
      }
      valid.push(row.draft);
      return { ...row, status: 'submitted', errors: [] };
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

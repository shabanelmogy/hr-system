import type { CommandFailure } from '../../../../../shared/data/public-api';
import { countryMutationFields } from './country-mutation';
import type { CountryImportIssue, CountryImportRow } from './country-import';

/** A batch conflict identifies the batch, never an individual Excel row. */
export function countryImportDuplicate(failure: CommandFailure): boolean {
  return failure.codes.some((code) =>
    ['Country.Duplicated', 'Country.CountryExists'].includes(code),
  );
}

export function countryImportFailureRows(
  rows: readonly CountryImportRow[],
  failure: CommandFailure,
): readonly CountryImportRow[] {
  const submitted = rows.filter((row) => row.status === 'submitted');
  const issuesByRow = new Map<number, CountryImportIssue[]>();
  for (const [path, message] of Object.entries(failure.fieldErrors)) {
    const match = /^countries\[(\d+)\]\.([A-Za-z0-9_]+)$/i.exec(path);
    const index = match?.[1];
    const name = match?.[2];
    const field = countryMutationFields.find(
      (field) => field.toLowerCase() === name?.toLowerCase(),
    );
    const row = index === undefined ? undefined : submitted[Number(index)];
    if (!row || !field) continue;
    const issues = issuesByRow.get(row.rowNumber) ?? [];
    issues.push({ field, kind: 'server', message });
    issuesByRow.set(row.rowNumber, issues);
  }
  const kind =
    failure.outcome === 'uncertain'
      ? 'uncertain'
      : failure.outcome === 'not-sent'
        ? 'notSent'
        : 'batchRejected';
  return rows.map((row) =>
    row.status !== 'submitted'
      ? row
      : {
          ...row,
          status: failure.outcome === 'uncertain' ? 'uncertain' : 'failed',
          issues: issuesByRow.get(row.rowNumber) ?? [{ field: null, kind }],
        },
  );
}

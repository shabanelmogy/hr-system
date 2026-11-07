import type { CommandFailure } from '../../../../../shared/data/public-api';
import {
  districtImportFields,
  type DistrictImportIssue,
  type DistrictImportRow,
} from './district-import';

export const districtImportDuplicate = (failure: CommandFailure): boolean =>
  failure.codes.includes('District.Duplicated');
export function districtImportFailureRows(
  rows: readonly DistrictImportRow[],
  failure: CommandFailure,
): readonly DistrictImportRow[] {
  const submitted = rows.filter((row) => row.status === 'submitted');
  const byRow = new Map<number, DistrictImportIssue[]>();
  for (const [path, message] of Object.entries(failure.fieldErrors)) {
    const match = /^districts\[(\d+)\]\.([A-Za-z0-9_]+)$/i.exec(path);
    const index = match?.[1];
    const name = match?.[2]?.toLowerCase();
    const field =
      name === 'stateid'
        ? 'stateName'
        : districtImportFields.find((field) => field.toLowerCase() === name);
    const row = index === undefined ? undefined : submitted[Number(index)];
    if (!row || !field) continue;
    const issues = byRow.get(row.rowNumber) ?? [];
    issues.push({ field, kind: 'server', message });
    byRow.set(row.rowNumber, issues);
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
          issues: byRow.get(row.rowNumber) ?? [{ field: null, kind }],
        },
  );
}

import { parseDistrictId } from './district';
export type DistrictLifecycleAction = 'archive' | 'restore' | 'bulk';
export function parseDistrictBatch(input: readonly number[]): readonly number[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100)
    throw Error('Invalid District batch');
  const ids = input.map(parseDistrictId);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate District IDs');
  return ids;
}
export function parseDistrictArchivedCount(value: unknown, maximum: number): number {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('archivedCount' in value) ||
    typeof value.archivedCount !== 'number' ||
    !Number.isInteger(value.archivedCount) ||
    value.archivedCount < 0 ||
    value.archivedCount > maximum
  )
    throw Error('Invalid archive response');
  return value.archivedCount;
}
export function districtLifecycleError(
  codes: readonly string[],
  action: DistrictLifecycleAction,
): string {
  const messages: Readonly<Record<string, string>> = {
    'District.DistrictInUseByAddress': 'districts.deleteError',
    'District.DistrictNotFound': 'districts.notFound',
    'District.StateNotFound': 'districts.restoreError',
  };
  return (
    codes.map((code) => messages[code]).find(Boolean) ??
    (action === 'restore'
      ? 'districts.restoreError'
      : action === 'bulk'
        ? 'districts.bulkArchiveError'
        : 'districts.deleteError')
  );
}

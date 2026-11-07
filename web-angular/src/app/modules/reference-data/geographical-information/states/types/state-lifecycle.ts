import { parseStateId } from './state';
export type StateLifecycleAction = 'archive' | 'restore' | 'bulk';
export function parseStateBatch(input: readonly number[]): readonly number[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100)
    throw Error('Invalid State batch');
  const ids = input.map(parseStateId);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate State IDs');
  return ids;
}
export function parseStateArchivedCount(value: unknown, maximum: number): number {
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
export function stateLifecycleError(
  codes: readonly string[],
  action: StateLifecycleAction,
): string {
  const messages: Readonly<Record<string, string>> = {
    'State.StateInUseByDistrict': 'states.deleteError',
    'State.StateInUseByAddress': 'states.deleteError',
    'State.StateNotFound': 'states.notFound',
    'State.CountryNotFound': 'states.restoreError',
  };
  return (
    codes.map((code) => messages[code]).find(Boolean) ??
    (action === 'restore'
      ? 'states.restoreError'
      : action === 'bulk'
        ? 'states.bulkArchiveError'
        : 'states.deleteError')
  );
}

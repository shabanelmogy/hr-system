export interface BulkSelectionResult {
  ids: number[];
  exceedsLimit: boolean;
}

export function normalizeBulkSelection(
  requestedIds: readonly number[],
  eligibleIds: ReadonlySet<number>,
  maximumItems: number,
): BulkSelectionResult {
  const ids = [...new Set(requestedIds)].filter(
    (id) => Number.isInteger(id) && id > 0 && eligibleIds.has(id),
  );

  return {
    ids,
    exceedsLimit: ids.length > maximumItems,
  };
}

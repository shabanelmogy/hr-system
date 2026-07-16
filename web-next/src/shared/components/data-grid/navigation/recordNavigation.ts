import type { GridRowId } from "@mui/x-data-grid";

export function getActiveRecordIndex(
  orderedIds: readonly GridRowId[],
  focusedId: GridRowId | undefined,
  page: number,
  pageSize: number,
) {
  if (orderedIds.length === 0) return -1;

  const pageStart = Math.min(page * pageSize, orderedIds.length - 1);
  const pageEnd = Math.min(pageStart + pageSize, orderedIds.length);
  const focusedIndex = focusedId == null ? -1 : orderedIds.indexOf(focusedId);

  return focusedIndex >= pageStart && focusedIndex < pageEnd
    ? focusedIndex
    : pageStart;
}

export function getPageForRecord(recordIndex: number, pageSize: number) {
  return Math.floor(recordIndex / Math.max(1, pageSize));
}

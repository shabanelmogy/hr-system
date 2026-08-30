import type { GridRowId } from "@mui/x-data-grid";

export function getActiveRecordIndex(
  orderedIds: readonly GridRowId[],
  selectedId: GridRowId | undefined,
  page: number,
  pageSize: number,
) {
  if (orderedIds.length === 0) return -1;

  const pageStart = Math.min(page * pageSize, orderedIds.length - 1);
  const pageEnd = Math.min(pageStart + pageSize, orderedIds.length);
  const selectedIndex =
    selectedId == null ? -1 : orderedIds.indexOf(selectedId);

  return selectedIndex >= pageStart && selectedIndex < pageEnd
    ? selectedIndex
    : pageStart;
}

export function getPageForRecord(recordIndex: number, pageSize: number) {
  return Math.floor(recordIndex / Math.max(1, pageSize));
}

/**
 * Returns the next record target for the shared footer. When a page has not
 * acquired an active row yet (for example during a server-page transition),
 * navigation starts at that page's first item instead of skipping to item two.
 */
export function getNextRecordIndex(
  activeIndex: number,
  hasCurrentRecordOnPage: boolean,
  page: number,
  pageSize: number,
  totalRowCount: number,
) {
  if (totalRowCount <= 0) return -1;

  const target = hasCurrentRecordOnPage
    ? activeIndex + 1
    : Math.max(0, page) * Math.max(1, pageSize);

  return Math.min(Math.max(0, target), totalRowCount - 1);
}

export function getServerRecordIndex(
  visibleIds: readonly GridRowId[],
  selectedId: GridRowId | undefined,
  page: number,
  pageSize: number,
  totalRowCount: number,
) {
  if (visibleIds.length === 0 || totalRowCount <= 0) return -1;

  const selectedIndex = selectedId == null ? -1 : visibleIds.indexOf(selectedId);
  const localIndex = selectedIndex >= 0 ? selectedIndex : 0;
  return Math.min(
    Math.max(0, page) * Math.max(1, pageSize) + localIndex,
    totalRowCount - 1,
  );
}

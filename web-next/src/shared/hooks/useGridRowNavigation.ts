import type { GridApi } from "@mui/x-data-grid";
import { useEffect, type RefObject } from "react";
import type { CrudItemId } from "./useGridCrudController";

type IdentifiedItem = { id: CrudItemId };

type UseGridRowNavigationOptions<TItem extends IdentifiedItem> = {
  apiRef: RefObject<GridApi | null>;
  items: TItem[];
  isLoading: boolean;
  isFetching: boolean;
  lastAddedId: CrudItemId | null;
  lastEditedId: CrudItemId | null;
  lastDeletedIndex: number | null;
  clearLastAdded: () => void;
  clearLastEdited: () => void;
  clearLastDeleted: () => void;
};

const highlightDurationMs = 4_000;

export function useGridRowNavigation<TItem extends IdentifiedItem>({
  apiRef,
  items,
  isLoading,
  isFetching,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  clearLastAdded,
  clearLastEdited,
  clearLastDeleted,
}: UseGridRowNavigationOptions<TItem>) {
  useEffect(() => {
    if (lastAddedId == null || isLoading || isFetching) return;
    const index = findRowIndex(items, lastAddedId);
    if (index < 0) return;

    focusRow(apiRef, index, lastAddedId);
    const timer = window.setTimeout(clearLastAdded, highlightDurationMs);
    return () => window.clearTimeout(timer);
  }, [apiRef, clearLastAdded, isFetching, isLoading, items, lastAddedId]);

  useEffect(() => {
    if (lastEditedId == null || isLoading || isFetching) return;
    const index = findRowIndex(items, lastEditedId);
    if (index < 0) return;

    focusRow(apiRef, index, lastEditedId);
    const timer = window.setTimeout(clearLastEdited, highlightDurationMs);
    return () => window.clearTimeout(timer);
  }, [apiRef, clearLastEdited, isFetching, isLoading, items, lastEditedId]);

  useEffect(() => {
    if (lastDeletedIndex == null || isLoading || isFetching) return;
    if (items.length > 0) {
      const index = Math.max(0, Math.min(lastDeletedIndex - 1, items.length - 1));
      focusRow(apiRef, index, items[index].id);
    }
    const timer = window.setTimeout(clearLastDeleted, highlightDurationMs);
    return () => window.clearTimeout(timer);
  }, [apiRef, clearLastDeleted, isFetching, isLoading, items, lastDeletedIndex]);
}

function findRowIndex<TItem extends IdentifiedItem>(items: TItem[], id: CrudItemId) {
  return items.findIndex((item) => String(item.id) === String(id));
}

function focusRow(
  apiRef: RefObject<GridApi | null>,
  rowIndex: number,
  rowId: CrudItemId,
) {
  const api = apiRef.current;
  if (!api) return;

  const pageSize = api.state.pagination.paginationModel.pageSize;
  api.setPage(Math.floor(rowIndex / pageSize));
  api.setRowSelectionModel({ type: "include", ids: new Set([rowId]) });
  window.setTimeout(() => {
    apiRef.current?.scrollToIndexes({ rowIndex, colIndex: 0 });
  }, 300);
}

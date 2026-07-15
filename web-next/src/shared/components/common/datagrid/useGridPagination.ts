import React, { useState, useCallback, useRef, useEffect } from "react";
import type {
  GridApi,
  GridPaginationModel,
  GridRowId,
  GridRowIdGetter,
  GridRowsProp,
  GridSortModel,
} from "@mui/x-data-grid";

interface UseGridPaginationProps {
  apiRef: React.RefObject<GridApi | null> | null;
  rows: GridRowsProp;
  rowId: GridRowIdGetter;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  paginationDirectionRef?: React.MutableRefObject<"forward" | "backward" | null>;
  onNavigationUpdate?: (updateFn: () => void) => void;
}

export const useGridPagination = ({
  apiRef,
  rows = [],
  rowId,
  paginationModel,
  onPaginationModelChange,
  paginationDirectionRef,
  onNavigationUpdate,
}: UseGridPaginationProps) => {
  const [navigationCounter, setNavigationCounter] = useState(1);
  const navigationInProgressRef = useRef(false);

  const getOrderedIds = useCallback(() => {
    const api = apiRef?.current;
    if (api && typeof api.getSortedRowIds === "function") {
      const sorted = api.getSortedRowIds();
      if (sorted.length > 0) return sorted;
    }
    return rows.map(rowId);
  }, [apiRef, rowId, rows]);

  const syncNavigationWithSelection = useCallback(() => {
    const orderedIds = getOrderedIds();
    if (!apiRef?.current || orderedIds.length === 0) {
      setNavigationCounter(orderedIds.length > 0 ? 1 : 0);
      return;
    }

    const selection = apiRef.current.getSelectedRows();
    if (selection && selection.size > 0) {
      const selectedId = Array.from(selection.keys())[0];
      const rowIndex = orderedIds.findIndex((id: GridRowId) => id === selectedId);
      if (rowIndex !== -1) {
        setNavigationCounter(rowIndex + 1);
        return;
      }
    }
    setNavigationCounter(1);
  }, [apiRef, getOrderedIds]);

  useEffect(() => {
    if (onNavigationUpdate) {
      onNavigationUpdate(syncNavigationWithSelection);
    }
  }, [onNavigationUpdate, syncNavigationWithSelection]);

  useEffect(() => {
    const timer = setTimeout(syncNavigationWithSelection, 0);
    return () => clearTimeout(timer);
  }, [syncNavigationWithSelection]);

  useEffect(() => {
    if (!apiRef?.current) return;

    const unsubscribeSelection = apiRef.current.subscribeEvent(
      "rowSelectionChange",
      () => {} 
    );

    const unsubscribeSort = apiRef.current.subscribeEvent(
      "sortModelChange",
      (model: GridSortModel) => {
        if (model.length > 0) {
          setTimeout(syncNavigationWithSelection, 100);
        }
      }
    );

    const unsubscribePagination = apiRef.current.subscribeEvent(
      "paginationModelChange",
      () => {
        const isMovingToPreviousPage =
          paginationDirectionRef?.current === "backward";

        if (navigationInProgressRef.current) return;
        
        setTimeout(() => {
          if (!apiRef.current) return;
          const state = apiRef.current.state;
          const page = state?.pagination?.paginationModel?.page ?? 0;
          const pageSize = state?.pagination?.paginationModel?.pageSize ?? 5;

          const orderedIds = apiRef.current.getSortedRowIds?.() ?? [];
          if (orderedIds.length === 0) return;

          const firstIndexOnPage = page * pageSize;
          const selectedId = Array.from(
            apiRef.current.getSelectedRows?.().keys?.() ?? []
          )[0];
          const selectedIndex = orderedIds.findIndex((id: GridRowId) => id === selectedId);
          const movedBackFromLaterPage =
            selectedIndex >= firstIndexOnPage + pageSize;

          const targetIndex = (isMovingToPreviousPage || movedBackFromLaterPage)
            ? Math.min(firstIndexOnPage + pageSize - 1, orderedIds.length - 1)
            : firstIndexOnPage;

          apiRef.current.setRowSelectionModel?.({
            type: "include",
            ids: new Set([orderedIds[targetIndex]]),
          });

          const rowIndexOnPage = targetIndex % pageSize;
          apiRef.current.scrollToIndexes?.({ rowIndex: rowIndexOnPage });

          setNavigationCounter(targetIndex + 1);
        }, 100);
      }
    );

    return () => {
      unsubscribeSelection();
      unsubscribeSort();
      unsubscribePagination();
    };
  }, [apiRef, paginationDirectionRef, syncNavigationWithSelection]);

  const navigateToIndex = useCallback(
    (targetIndex: number) => {
      const orderedIds = getOrderedIds();
      if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

      const targetRowId = orderedIds[targetIndex];
      const { pageSize } = paginationModel;
      const targetPage = Math.floor(targetIndex / pageSize);
      const rowIndexOnPage = targetIndex % pageSize;

      setNavigationCounter(targetIndex + 1);
      navigationInProgressRef.current = true;
      onPaginationModelChange({ ...paginationModel, page: targetPage });

      setTimeout(() => {
        apiRef?.current?.setRowSelectionModel({
          type: "include",
          ids: new Set([targetRowId]),
        });
        apiRef?.current?.scrollToIndexes({ rowIndex: rowIndexOnPage });
        navigationInProgressRef.current = false;
      }, 150);
    },
    [apiRef, getOrderedIds, paginationModel, onPaginationModelChange]
  );

  return {
    navigationCounter,
    displayPaginationModel: paginationModel,
    orderedCount: rows.length,
    navigateToIndex,
    handleGoToFirstRecord: () => navigateToIndex(0),
    handleGoToLastRecord: () => navigateToIndex(getOrderedIds().length - 1),
    handleGoToPreviousRecord: () => navigateToIndex(navigationCounter - 2),
    handleGoToNextRecord: () => navigateToIndex(navigationCounter),
  };
};

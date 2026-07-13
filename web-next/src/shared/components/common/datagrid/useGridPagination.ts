import React, { useState, useCallback, useRef, useEffect } from "react";
import { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

interface UseGridPaginationProps {
  apiRef: any;
  rows: any[];
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  paginationDirectionRef?: React.MutableRefObject<"forward" | "backward" | null>;
  onNavigationUpdate?: (updateFn: () => void) => void;
}

export const useGridPagination = ({
  apiRef,
  rows = [],
  paginationModel,
  onPaginationModelChange,
  paginationDirectionRef,
  onNavigationUpdate,
}: UseGridPaginationProps) => {
  const [displayPaginationModel, setDisplayPaginationModel] = useState(paginationModel);
  const [navigationCounter, setNavigationCounter] = useState(1);
  const navigationInProgressRef = useRef(false);

  useEffect(() => {
    setDisplayPaginationModel(paginationModel);
  }, [paginationModel]);

  const getOrderedIds = useCallback(() => {
    const api = apiRef?.current;
    if (api && typeof api.getSortedRowIds === "function") {
      const sorted = api.getSortedRowIds();
      if (sorted.length > 0) return sorted;
    }
    return rows.map((r) => r.id);
  }, [apiRef, rows]);

  const syncNavigationWithSelection = useCallback(() => {
    const orderedIds = getOrderedIds();
    if (!apiRef?.current || orderedIds.length === 0) {
      setNavigationCounter(orderedIds.length > 0 ? 1 : 0);
      return;
    }

    const selection = apiRef.current.getSelectedRows();
    if (selection && selection.size > 0) {
      const selectedId = Array.from(selection.keys())[0];
      const rowIndex = orderedIds.findIndex((id) => id === selectedId);
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
    const orderedIds = getOrderedIds();
    if (orderedIds.length > 0) {
      syncNavigationWithSelection();
    } else {
      setNavigationCounter(0);
    }
  }, [getOrderedIds, syncNavigationWithSelection]);

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
      (model: GridPaginationModel) => {
        if (!model) return;

        const isMovingToPreviousPage =
          paginationDirectionRef?.current === "backward";

        const nextModel = {
          page: model.page ?? 0,
          pageSize: model.pageSize ?? displayPaginationModel.pageSize,
        };

        setDisplayPaginationModel(nextModel);

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
          const selectedIndex = orderedIds.findIndex((id) => id === selectedId);
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
  }, [apiRef, paginationDirectionRef, displayPaginationModel, syncNavigationWithSelection]);

  const navigateToIndex = useCallback(
    (targetIndex: number) => {
      const orderedIds = getOrderedIds();
      if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

      const targetRowId = orderedIds[targetIndex];
      const { pageSize } = displayPaginationModel;
      const targetPage = Math.floor(targetIndex / pageSize);
      const rowIndexOnPage = targetIndex % pageSize;

      setNavigationCounter(targetIndex + 1);
      setDisplayPaginationModel((prev) => ({
        ...prev,
        page: targetPage,
      }));

      navigationInProgressRef.current = true;
      onPaginationModelChange({ ...displayPaginationModel, page: targetPage });

      setTimeout(() => {
        apiRef?.current?.setRowSelectionModel({
          type: "include",
          ids: new Set([targetRowId]),
        });
        apiRef?.current?.scrollToIndexes({ rowIndex: rowIndexOnPage });
        navigationInProgressRef.current = false;
      }, 150);
    },
    [apiRef, getOrderedIds, displayPaginationModel, onPaginationModelChange]
  );

  return {
    navigationCounter,
    displayPaginationModel,
    orderedCount: getOrderedIds().length,
    navigateToIndex,
    handleGoToFirstRecord: () => navigateToIndex(0),
    handleGoToLastRecord: () => navigateToIndex(getOrderedIds().length - 1),
    handleGoToPreviousRecord: () => navigateToIndex(navigationCounter - 2),
    handleGoToNextRecord: () => navigateToIndex(navigationCounter),
  };
};

/* eslint-disable react/prop-types */
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
} from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import React from "react";
import { useTranslation } from "react-i18next";
import { MyCustomToolbar } from "./myCustomToolbar";

// Custom Footer Component with centered navigation and record info
const CustomFooterWithNavigation = ({
  apiRef,
  rows = [],
  onNavigationUpdate,
  paginationModel,
  onPaginationModelChange,
  paginationDirectionRef,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = theme.direction === "rtl";
  const [displayPaginationModel, setDisplayPaginationModel] =
    React.useState(paginationModel);

  React.useEffect(() => {
    setDisplayPaginationModel(paginationModel);
  }, [paginationModel]);

  // Get the current ordered row IDs (sorted order if grid sorting is active)
  const getOrderedIds = React.useCallback(() => {
    const api = apiRef?.current;
    if (api && typeof api.getSortedRowIds === "function") {
      const sorted = api.getSortedRowIds();
      // Only use sorted IDs if grid has actually processed the rows
      if (sorted.length > 0) return sorted;
    }
    return rows.map((r) => r.id);
  }, [apiRef, rows]);

  // Separate state for navigation counter - NEVER auto-updated
  const [navigationCounter, setNavigationCounter] = React.useState(1);

  // Function to sync navigation with current selection
  const syncNavigationWithSelection = React.useCallback(() => {
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

  // Expose the sync function to parent component
  React.useEffect(() => {
    if (onNavigationUpdate) {
      onNavigationUpdate(syncNavigationWithSelection);
    }
  }, [onNavigationUpdate, syncNavigationWithSelection]);

  // Initialize counter when data loads or order changes
  React.useEffect(() => {
    const orderedIds = getOrderedIds();
    if (orderedIds.length > 0) {
      syncNavigationWithSelection();
    } else {
      setNavigationCounter(0);
    }
  }, [getOrderedIds, syncNavigationWithSelection]);

  // Flag to suppress paginationModelChange auto-select when our own navigation caused the page change
  const navigationInProgressRef = React.useRef(false);

  // Listen to sort / pagination / selection changes to re-sync counter
  React.useEffect(() => {
    if (!apiRef?.current) return;

    const unsubscribeSelection = apiRef.current.subscribeEvent(
      "rowSelectionChange",
      () => {} // counter is controlled manually
    );

    const unsubscribeSort = apiRef.current.subscribeEvent(
      "sortModelChange",
      () => syncNavigationWithSelection()
    );

    // Re-sync when MUI built-in pagination controls change the page.
    // Skip if our own navigateToIndex triggered the page change.
    const unsubscribePagination = apiRef.current.subscribeEvent(
      "paginationModelChange",
      (model) => {
        const nextModel =
          model ??
          apiRef.current?.state?.pagination?.paginationModel ??
          paginationModel;
        const isMovingToPreviousPage =
          paginationDirectionRef?.current === "backward";

        setDisplayPaginationModel(nextModel);

        if (navigationInProgressRef.current) return;
        // Delay so the grid finishes rendering the new page first
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
          const targetIdOnPage = orderedIds[targetIndex];
          if (targetIdOnPage == null) return;
          const rowIndexOnPage = targetIndex % pageSize;

          // Select the edge row that matches pagination direction.
          apiRef.current.setRowSelectionModel({
            type: "include",
            ids: new Set([targetIdOnPage]),
          });
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
  }, [apiRef, paginationDirectionRef, paginationModel, syncNavigationWithSelection]);

  // Helper: navigate to a specific 0-based row index
  const navigateToIndex = React.useCallback(
    (targetIndex) => {
      const orderedIds = getOrderedIds();
      if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

      const targetRowId = orderedIds[targetIndex];
      const { pageSize } = paginationModel;
      const targetPage = Math.floor(targetIndex / pageSize);
      const rowIndexOnPage = targetIndex % pageSize;

      // Update counter immediately so UI reflects the change on this click
      setNavigationCounter(targetIndex + 1);
      setDisplayPaginationModel((prev) => ({
        ...prev,
        page: targetPage,
      }));

      // Mark that WE are causing the page change — suppress the paginationModelChange auto-select
      navigationInProgressRef.current = true;
      onPaginationModelChange((prev) => ({ ...prev, page: targetPage }));

      setTimeout(() => {
        apiRef?.current?.setRowSelectionModel({
          type: "include",
          ids: new Set([targetRowId]),
        });
        apiRef?.current?.scrollToIndexes({ rowIndex: rowIndexOnPage });
        // Release the guard after our own selection is done
        navigationInProgressRef.current = false;
      }, 150);
    },
    [apiRef, getOrderedIds, paginationModel, onPaginationModelChange]
  );

  const handleGoToFirstRecord = () => navigateToIndex(0);
  const handleGoToLastRecord = () => navigateToIndex(getOrderedIds().length - 1);
  const handleGoToPreviousRecord = () => navigateToIndex(navigationCounter - 2);
  const handleGoToNextRecord = () => navigateToIndex(navigationCounter);

  const orderedCount = getOrderedIds().length;
  const totalPages = Math.max(
    1,
    Math.ceil(orderedCount / displayPaginationModel.pageSize)
  );
  const currentPage = displayPaginationModel.page + 1;

  // Icon components based on direction
  const FirstIcon = isRTL ? LastPageIcon : FirstPageIcon;
  const LastIcon = isRTL ? FirstPageIcon : LastPageIcon;
  const PreviousIcon = isRTL ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <GridFooterContainer
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        minHeight: 52,
        paddingLeft: 2,
        paddingRight: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ flex: "0 0 150px" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          flex: "1",
        }}
      >
        <Tooltip title={t("pagination.goToFirstRecord") || "First Record"}>
          <span>
            <IconButton
              onClick={handleGoToFirstRecord}
              disabled={orderedCount === 0 || navigationCounter <= 1}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <FirstIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip
          title={t("pagination.goToPreviousRecord") || "Previous Record"}
        >
          <span>
            <IconButton
              onClick={handleGoToPreviousRecord}
              disabled={orderedCount === 0 || navigationCounter <= 1}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <PreviousIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: "120px",
            justifyContent: "center",
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            px: 2,
            py: 0.5,
            mx: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: "0.875rem",
              direction: "ltr", // Keep numbers in LTR even in RTL mode
            }}
          >
            {orderedCount > 0
              ? `${navigationCounter} / ${orderedCount}`
              : "0 / 0"}
          </Typography>
        </Box>

        <Tooltip title={t("pagination.goToNextRecord") || "Next Record"}>
          <span>
            <IconButton
              onClick={handleGoToNextRecord}
              disabled={orderedCount === 0 || navigationCounter >= orderedCount}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <NextIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("pagination.goToLastRecord") || "Last Record"}>
          <span>
            <IconButton
              onClick={handleGoToLastRecord}
              disabled={orderedCount === 0 || navigationCounter >= orderedCount}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <LastIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: "0 0 300px",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            minWidth: "80px",
            direction: "ltr", // Keep page numbers in LTR
          }}
        >
          {t("pagination.page") || "Page"} {currentPage}{" "}
          {t("pagination.of") || "of"} {totalPages}
        </Typography>

        <Box
          sx={{
            minWidth: "180px",
            "& .MuiTablePagination-root": {
              borderTop: "none",
              overflow: "visible",
            },
            "& .MuiTablePagination-toolbar": {
              minHeight: "52px",
              paddingLeft: 0,
              paddingRight: 0,
              overflow: "visible",
            },
            "& .MuiTablePagination-displayedRows": {
              display: "none",
            },
            "& .MuiTablePagination-actions": {
              display: "none",
            },
            "& .MuiTablePagination-select": {
              minWidth: "60px",
            },
            "& .MuiSelect-select": {
              paddingRight: "32px !important",
            },
            "& .MuiInputBase-root": {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        >
          <GridPagination />
        </Box>
      </Box>
    </GridFooterContainer>
  );
};

const dataGridStyles = {
  "& .highlighted-row": {
    backgroundColor: "#ffe0b2 !important",
    fontWeight: "bold",
  },
  "& .MuiDataGrid-footerContainer": {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: 52,
    borderTop: "1px solid",
    borderColor: "divider",
    padding: 0,
  },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    my: "auto",
  },
  "&.no-navigation .MuiDataGrid-footerContainer": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 16px",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: (theme) => theme.palette.primary.light + "30",
    "&:hover": {
      backgroundColor: (theme) => theme.palette.primary.light + "40",
    },
  },
};

const MyDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  apiRef = null,
  sortModel = [{ field: "id", sort: "asc" }],
  filterMode = "client",
  addNewRow = () => {},
  rowId = (row) => row.id,
  showAddButton = true,
  fileName,
  reportPdfHeader,
  showNavigationButtons = true,
  onNavigationUpdate = null,
  excludeColumnsFromExport = [],
  viewMode = "list",
  onViewModeChange = () => {},
  lastAddedId = null,
  lastEditedId = null,
  lastDeletedIndex = null,
  ...otherProps
}) => {
  const theme = useTheme();

  // Patch apiRef.current.setRowSelectionModel to support both old array syntax and new object syntax in MUI v9
  if (apiRef?.current) {
    const originalSetRowSelectionModel = apiRef.current.setRowSelectionModel;
    if (originalSetRowSelectionModel && !originalSetRowSelectionModel.isPatched) {
      const patched = function (model, reason) {
        if (Array.isArray(model)) {
          return originalSetRowSelectionModel.call(apiRef.current, {
            type: "include",
            ids: new Set(model),
          }, reason);
        }
        return originalSetRowSelectionModel.call(apiRef.current, model, reason);
      };
      patched.isPatched = true;
      apiRef.current.setRowSelectionModel = patched;
    }
  }

  // ── Controlled pagination ─────────────────────────────────────────────────
  // Using controlled paginationModel instead of initialState so we can clamp
  // the page whenever rows shrink (e.g. after a delete). With initialState the
  // DataGrid is uncontrolled and ignores external setPage calls during the same
  // render cycle, causing it to show only the leftover rows on a ghost page.
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 5,
  });
  const paginationDirectionRef = React.useRef("forward");

  const handlePaginationModelChange = React.useCallback((modelOrUpdater) => {
    setPaginationModel((prev) => {
      const next =
        typeof modelOrUpdater === "function"
          ? modelOrUpdater(prev)
          : modelOrUpdater;

      if (next?.pageSize !== prev.pageSize) {
        paginationDirectionRef.current = "forward";
      } else if (next?.page < prev.page) {
        paginationDirectionRef.current = "backward";
      } else if (next?.page > prev.page) {
        paginationDirectionRef.current = "forward";
      }

      if (
        !next ||
        (next.page === prev.page && next.pageSize === prev.pageSize)
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  // Clamp page to last valid page whenever row count changes.
  // This is the single source of truth — no apiRef.setPage needed.
  React.useEffect(() => {
    if (rows.length === 0) return;
    const lastValidPage = Math.max(
      0,
      Math.ceil(rows.length / paginationModel.pageSize) - 1
    );
    if (paginationModel.page > lastValidPage) {
      setPaginationModel((prev) => ({ ...prev, page: lastValidPage }));
    }
  }, [rows.length, paginationModel.pageSize, paginationModel.page]);

  // Store the navigation update function
  const navigationUpdateRef = React.useRef(null);

  // Effect to handle last added/edited/deleted row selection and scroll
  React.useEffect(() => {
    if (!apiRef?.current || rows.length === 0) return;

    const selectAndScroll = (id) => {
      const orderedIds = apiRef.current.getSortedRowIds();
      const rowIndex = orderedIds.findIndex((rId) => rId === id);
      if (rowIndex === -1) return;

      const { pageSize } = paginationModel;
      const targetPage = Math.floor(rowIndex / pageSize);
      const rowIndexOnPage = rowIndex % pageSize;

      setPaginationModel((prev) => ({ ...prev, page: targetPage }));

      setTimeout(() => {
        apiRef.current?.setRowSelectionModel({
          type: "include",
          ids: new Set([id]),
        });
        apiRef.current?.scrollToIndexes({ rowIndex: rowIndexOnPage });
        navigationUpdateRef.current?.();
      }, 200);
    };

    const timer = setTimeout(() => {
      if (lastAddedId && rows.some((row) => row.id === lastAddedId)) {
        selectAndScroll(lastAddedId);
      } else if (lastEditedId && rows.some((row) => row.id === lastEditedId)) {
        selectAndScroll(lastEditedId);
      } else if (lastDeletedIndex !== null) {
        const orderedIds = apiRef.current.getSortedRowIds();
        const targetIndex = Math.min(lastDeletedIndex, orderedIds.length - 1);
        if (targetIndex >= 0) {
          selectAndScroll(orderedIds[targetIndex]);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [apiRef, rows, lastAddedId, lastEditedId, lastDeletedIndex]);

  // ── Auto-select first row on initial data load ────────────────────────────
  // Fires once when rows first arrive (no pending add/edit/delete operation).
  const initialSelectionDone = React.useRef(false);
  React.useEffect(() => {
    if (
      !apiRef?.current ||
      rows.length === 0 ||
      initialSelectionDone.current ||
      lastAddedId ||
      lastEditedId ||
      lastDeletedIndex !== null
    )
      return;

    initialSelectionDone.current = true;

    setTimeout(() => {
      if (!apiRef.current) return;
      const orderedIds = apiRef.current.getSortedRowIds?.() ?? rows.map((r) => r.id);
      if (orderedIds.length === 0) return;
      const firstId = orderedIds[0];
      apiRef.current.setRowSelectionModel({
        type: "include",
        ids: new Set([firstId]),
      });
      apiRef.current.scrollToIndexes?.({ rowIndex: 0 });
      // Sync the navigation counter in the footer
      navigationUpdateRef.current?.();
    }, 150);
  }, [apiRef, rows, lastAddedId, lastEditedId, lastDeletedIndex]);

  const getLocaleText = () => {
    if (theme.direction !== "rtl") return {};
    return {
      ...arSD.components.MuiDataGrid.defaultProps.localeText,
      toolbarFilters: "تصفية البيانات",
      filterOperatorDoesNotContain: "لا يحتوى",
      filterOperatorDoesNotEqual: "لا يساوى",
    };
  };

  // Expose navigation update function to parent
  React.useEffect(() => {
    if (onNavigationUpdate && navigationUpdateRef.current) {
      onNavigationUpdate(navigationUpdateRef.current);
    }
  }, [onNavigationUpdate]);

  return (
    <Box sx={{ minWidth: "1200px" }}>
      <DataGrid
        checkboxSelection
        rows={rows}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode={filterMode}
        getRowId={rowId}
        localeText={getLocaleText()}
        initialState={{
          sorting: {
            sortModel: sortModel,
          },
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[5, 10, 25, 50]}
        sx={{
          ...dataGridStyles,
          ...(showNavigationButtons
            ? {}
            : { "&": { "&.no-navigation": true } }),
        }}
        slots={{
          toolbar: () => (
            <MyCustomToolbar
              showAddButton={showAddButton}
              addNewRow={addNewRow}
              fileName={fileName}
              reportPdfHeader={reportPdfHeader}
              excludeColumnsFromExport={excludeColumnsFromExport}
              viewMode={viewMode}
            />
          ),
          ...(showNavigationButtons && {
            footer: () => (
              <CustomFooterWithNavigation
                apiRef={apiRef}
                rows={rows}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                paginationDirectionRef={paginationDirectionRef}
                onNavigationUpdate={(updateFn) => {
                  navigationUpdateRef.current = updateFn;
                }}
              />
            ),
          }),
        }}
        {...otherProps}
      />
    </Box>
  );
};

export default MyDataGrid;

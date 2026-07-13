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
import { MyCustomToolbar } from "./MyCustomToolbar";
import { GridFooter } from "./GridFooter";

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

import type { MyDataGridProps } from "./types";

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
}: MyDataGridProps) => {
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
        sx={dataGridStyles}
        className={showNavigationButtons ? "" : "no-navigation"}
        slots={{
          toolbar: () => (
            <MyCustomToolbar
              showAddButton={showAddButton}
              addNewRow={addNewRow}
              fileName={fileName}
              reportPdfHeader={reportPdfHeader}
              excludeColumnsFromExport={excludeColumnsFromExport}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          ),
          ...(showNavigationButtons ? {
            footer: () => (
              <GridFooter
                apiRef={apiRef}
                rows={rows}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                paginationDirectionRef={paginationDirectionRef}
                onNavigationUpdate={(updateFn: any) => {
                  navigationUpdateRef.current = updateFn;
                }}
              />
            ),
          } : {}),
        }}
        {...otherProps}
      />
    </Box>
  );
};

export default MyDataGrid;

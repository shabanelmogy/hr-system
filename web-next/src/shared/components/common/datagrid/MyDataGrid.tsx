import { Box } from "@mui/material";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import type { GridPaginationModel, GridRowId } from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import React from "react";
import { MyCustomToolbar } from "./MyCustomToolbar";
import { GridFooter } from "./GridFooter";
import ClientDataGrid from "./ClientDataGrid";

const dataGridStyles: SxProps<Theme> = {
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
    backgroundColor: (theme: Theme) => theme.palette.primary.light + "30",
    "&:hover": {
      backgroundColor: (theme: Theme) => theme.palette.primary.light + "40",
    },
  },
};

import type { MyDataGridProps, NavigationUpdate } from "./types";

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
  onNavigationUpdate,
  excludeColumnsFromExport = [],
  viewMode = "list",
  onViewModeChange = () => {},
  lastAddedId = null,
  lastEditedId = null,
  lastDeletedIndex = null,
  ...otherProps
}: MyDataGridProps) => {
  const theme = useTheme();

  // ── Controlled pagination ─────────────────────────────────────────────────
  // Using controlled paginationModel instead of initialState so we can clamp
  // the page whenever rows shrink (e.g. after a delete). With initialState the
  // DataGrid is uncontrolled and ignores external setPage calls during the same
  // render cycle, causing it to show only the leftover rows on a ghost page.
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const pageSize = paginationModel.pageSize;
  const paginationDirectionRef = React.useRef<"forward" | "backward">("forward");

  const handlePaginationModelChange = React.useCallback((next: GridPaginationModel) => {
    setPaginationModel((prev) => {
      if (next.pageSize !== prev.pageSize) {
        paginationDirectionRef.current = "forward";
      } else if (next?.page < prev.page) {
        paginationDirectionRef.current = "backward";
      } else if (next?.page > prev.page) {
        paginationDirectionRef.current = "forward";
      }

      if (next.page === prev.page && next.pageSize === prev.pageSize) {
        return prev;
      }

      return next;
    });
  }, []);

  // Clamp page to last valid page whenever row count changes.
  // This is the single source of truth — no apiRef.setPage needed.
  const clampedPaginationModel = React.useMemo(() => {
    if (rows.length === 0) return { page: 0, pageSize };
    const lastValidPage = Math.max(
      0,
      Math.ceil(rows.length / pageSize) - 1
    );
    return { page: Math.min(paginationModel.page, lastValidPage), pageSize };
  }, [rows.length, pageSize, paginationModel.page]);

  // Store the navigation update function
  const navigationUpdateRef = React.useRef<NavigationUpdate | null>(null);

  // Effect to handle last added/edited/deleted row selection and scroll
  React.useEffect(() => {
    if (!apiRef?.current || rows.length === 0) return;
    const api = apiRef.current;

    const selectAndScroll = (id: GridRowId) => {
      const orderedIds = api.getSortedRowIds();
      const rowIndex = orderedIds.findIndex((rId) => rId === id);
      if (rowIndex === -1) return;

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
      if (lastAddedId != null && rows.some((row) => row.id === lastAddedId)) {
        selectAndScroll(lastAddedId);
      } else if (lastEditedId != null && rows.some((row) => row.id === lastEditedId)) {
        selectAndScroll(lastEditedId);
      } else if (lastDeletedIndex !== null) {
        const orderedIds = api.getSortedRowIds();
        const targetIndex = Math.min(lastDeletedIndex, orderedIds.length - 1);
        if (targetIndex >= 0) {
          selectAndScroll(orderedIds[targetIndex]);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [apiRef, rows, lastAddedId, lastEditedId, lastDeletedIndex, pageSize]);

  // ── Auto-select first row on initial data load ────────────────────────────
  // Fires once when rows first arrive (no pending add/edit/delete operation).
  const initialSelectionDone = React.useRef(false);
  React.useEffect(() => {
    if (
      !apiRef?.current ||
      rows.length === 0 ||
      initialSelectionDone.current ||
      lastAddedId != null ||
      lastEditedId != null ||
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
      <ClientDataGrid
        checkboxSelection
        rows={rows}
        columns={columns}
        loading={loading}
        apiRef={apiRef ?? undefined}
        filterMode={filterMode}
        getRowId={rowId}
        localeText={getLocaleText()}
        initialState={{
          sorting: {
            sortModel: sortModel,
          },
        }}
        paginationModel={clampedPaginationModel}
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
                rowId={rowId}
                paginationModel={clampedPaginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                paginationDirectionRef={paginationDirectionRef}
                onNavigationUpdate={(updateFn) => {
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

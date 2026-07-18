import { Box } from "@mui/material";
import {
  alpha,
  type SxProps,
  type Theme,
  useTheme,
} from "@mui/material/styles";
import {
  gridFilteredSortedRowIdsSelector,
  type GridRowClassNameParams,
  type GridRowId,
  type GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ClientDataGrid from "./ClientDataGrid";
import { DataGridShellContext } from "./context";
import type { MyDataGridProps } from "./types";
import { GridFooter } from "../navigation/GridFooter";
import { DataGridToolbar } from "../toolbar/DataGridToolbar";
import {
  DEFAULT_ROWS_PER_PAGE,
  DEFAULT_ROWS_PER_PAGE_OPTIONS,
} from "@/shared/constants/pagination";

const dataGridStyles: SxProps<Theme> = {
  "& .highlighted-row": {
    backgroundColor: "#ffe0b2 !important",
    fontWeight: "bold",
  },
  "& .edited-row": {
    backgroundColor: (theme: Theme) =>
      `${alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.2 : 0.12)} !important`,
    "&:hover": {
      backgroundColor: (theme: Theme) =>
        `${alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.3 : 0.2)} !important`,
    },
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
    backgroundColor: (theme: Theme) => `${theme.palette.primary.light}30`,
    "&:hover": {
      backgroundColor: (theme: Theme) => `${theme.palette.primary.light}40`,
    },
  },
};

export default function MyDataGrid<TRow extends GridValidRowModel>({
  rows = [],
  columns = [],
  apiRef,
  initialState,
  initialSortModel = [{ field: "id", sort: "asc" }],
  showNavigationButtons = true,
  onToolbarAdd,
  lastAddedId = null,
  lastEditedId = null,
  lastDeletedIndex = null,
  getRowId,
  getRowClassName,
  localeText,
  pageSizeOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  pagination = true,
  paginationMode = "client",
  rowCount,
  checkboxSelection = true,
  showToolbar,
  slots,
  sx,
  ...dataGridProps
}: MyDataGridProps<TRow>) {
  const theme = useTheme();
  const internalApiRef = useGridApiRef();
  const resolvedApiRef = apiRef ?? internalApiRef;
  const handledOperationRef = useRef<string | null>(null);
  const initialSelectionDoneRef = useRef(false);

  const resolvedInitialState = useMemo(
    () => ({
      ...initialState,
      sorting: {
        ...initialState?.sorting,
        sortModel: initialState?.sorting?.sortModel ?? initialSortModel,
      },
      pagination: {
        ...initialState?.pagination,
        paginationModel: {
          page: initialState?.pagination?.paginationModel?.page ?? 0,
          pageSize:
            initialState?.pagination?.paginationModel?.pageSize ??
            DEFAULT_ROWS_PER_PAGE,
        },
      },
    }),
    [initialSortModel, initialState],
  );

  const resolvedLocaleText = useMemo(
    () =>
      localeText ??
      (theme.direction === "rtl"
        ? arSD.components.MuiDataGrid.defaultProps.localeText
        : undefined),
    [localeText, theme.direction],
  );

  const resolvedSlots = useMemo(
    () => ({
      toolbar: DataGridToolbar,
      ...(showNavigationButtons ? { footer: GridFooter } : {}),
      ...slots,
    }),
    [showNavigationButtons, slots],
  );

  const shellContext = useMemo(
    () => ({
      showRecordNavigation: showNavigationButtons,
      onToolbarAdd,
    }),
    [onToolbarAdd, showNavigationButtons],
  );

  const resolvedSx = useMemo(
    () => [dataGridStyles, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])],
    [sx],
  );

  const resolveRowId = useCallback(
    (row: TRow) => getRowId?.(row) ?? row.id,
    [getRowId],
  );

  const resolvedGetRowClassName = useCallback(
    (params: GridRowClassNameParams<TRow>) => {
      const classes = [getRowClassName?.(params) ?? ""];
      if (idsEqual(params.id, lastAddedId)) {
        classes.push("highlighted-row");
      }
      if (idsEqual(params.id, lastEditedId)) {
        classes.push("edited-row");
      }
      return classes.filter(Boolean).join(" ");
    },
    [getRowClassName, lastAddedId, lastEditedId],
  );

  useEffect(() => {
    if (!pagination) return;
    const api = resolvedApiRef.current;
    if (!api) return;

    const model = api.state.pagination.paginationModel;
    const effectiveRowCount =
      paginationMode === "server" ? (rowCount ?? rows.length) : rows.length;
    const lastPage = Math.max(
      0,
      Math.ceil(effectiveRowCount / Math.max(1, model.pageSize)) - 1,
    );
    if (model.page > lastPage) {
      api.setPage(lastPage);
    }
  }, [pagination, paginationMode, resolvedApiRef, rowCount, rows.length]);

  useEffect(() => {
    const operation = getPendingOperation(
      lastAddedId,
      lastEditedId,
      lastDeletedIndex,
    );
    if (!operation) {
      handledOperationRef.current = null;
      return;
    }
    if (handledOperationRef.current === operation.key) return;

    const api = resolvedApiRef.current;
    if (!api || rows.length === 0) return;

    const fallbackIds = rows.map(resolveRowId);
    const visibleIds =
      paginationMode === "client"
        ? gridFilteredSortedRowIdsSelector(resolvedApiRef)
        : fallbackIds;
    const orderedIds = visibleIds.length > 0 ? visibleIds : fallbackIds;
    const targetIndex =
      operation.id == null
        ? Math.min(operation.index ?? 0, orderedIds.length - 1)
        : orderedIds.findIndex((id) => idsEqual(id, operation.id));

    if (targetIndex < 0) return;

    const targetId = orderedIds[targetIndex];
    const pageSize = api.state.pagination.paginationModel.pageSize;
    api.setPage(Math.floor(targetIndex / Math.max(1, pageSize)));
    api.setRowSelectionModel({ type: "include", ids: new Set([targetId]) });

    const scrollTimer = setTimeout(() => {
      api.scrollToIndexes({
        rowIndex: targetIndex % Math.max(1, pageSize),
      });
    }, 150);

    handledOperationRef.current = operation.key;

    return () => clearTimeout(scrollTimer);
  }, [
    lastAddedId,
    lastDeletedIndex,
    lastEditedId,
    paginationMode,
    resolveRowId,
    resolvedApiRef,
    rows,
  ]);

  useEffect(() => {
    if (rows.length === 0) {
      initialSelectionDoneRef.current = false;
      return;
    }
    if (
      initialSelectionDoneRef.current ||
      lastAddedId != null ||
      lastEditedId != null ||
      lastDeletedIndex != null
    ) {
      return;
    }

    const api = resolvedApiRef.current;
    if (!api) return;

    const selectionTimer = setTimeout(() => {
      if (api.getSelectedRows().size > 0) {
        initialSelectionDoneRef.current = true;
        return;
      }

      const orderedIds = gridFilteredSortedRowIdsSelector(resolvedApiRef);
      const firstId = orderedIds[0] ?? resolveRowId(rows[0]);
      api.setRowSelectionModel({ type: "include", ids: new Set([firstId]) });
      api.scrollToIndexes({ rowIndex: 0 });
      initialSelectionDoneRef.current = true;
    }, 150);

    return () => clearTimeout(selectionTimer);
  }, [
    lastAddedId,
    lastDeletedIndex,
    lastEditedId,
    resolveRowId,
    resolvedApiRef,
    rows,
  ]);

  return (
    <DataGridShellContext.Provider value={shellContext}>
      <Box sx={{ minWidth: "1200px" }}>
        <ClientDataGrid
          {...dataGridProps}
          rows={rows}
          columns={columns}
          apiRef={resolvedApiRef}
          getRowId={getRowId}
          getRowClassName={resolvedGetRowClassName}
          initialState={resolvedInitialState}
          localeText={resolvedLocaleText}
          pageSizeOptions={pageSizeOptions}
          pagination={pagination}
          paginationMode={paginationMode}
          rowCount={rowCount}
          checkboxSelection={checkboxSelection}
          showToolbar={showToolbar ?? Boolean(onToolbarAdd)}
          className={showNavigationButtons ? "" : "no-navigation"}
          slots={resolvedSlots}
          sx={resolvedSx}
        />
      </Box>
    </DataGridShellContext.Provider>
  );
}

function idsEqual(left: GridRowId, right: GridRowId | null) {
  return right != null && String(left) === String(right);
}

function getPendingOperation(
  lastAddedId: GridRowId | null,
  lastEditedId: GridRowId | null,
  lastDeletedIndex: number | null,
) {
  if (lastAddedId != null) {
    return { key: `added:${String(lastAddedId)}`, id: lastAddedId };
  }
  if (lastEditedId != null) {
    return { key: `edited:${String(lastEditedId)}`, id: lastEditedId };
  }
  if (lastDeletedIndex != null) {
    return {
      key: `deleted:${lastDeletedIndex}`,
      id: null,
      index: Math.max(0, lastDeletedIndex - 1),
    };
  }
  return null;
}

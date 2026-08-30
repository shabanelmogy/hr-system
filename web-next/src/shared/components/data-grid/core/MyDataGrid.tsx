import {
  alpha,
  type SxProps,
  type Theme,
  useTheme,
} from "@mui/material/styles";
import {
  gridFilteredSortedRowIdsSelector,
  type GridColDef,
  type GridEventListener,
  type GridRowClassNameParams,
  type GridRowId,
  type GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  width: "100%",
  minWidth: 0,
  "& .highlighted-row": {
    backgroundColor: "#ffe0b2 !important",
    fontWeight: "bold",
  },
  "& .edited-row": {
    backgroundColor: (theme: Theme) =>
      alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
    animation: "my-data-grid-edit-flash 1.2s ease-in-out 2",
    "&:hover": {
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.3 : 0.2),
    },
  },
  "@keyframes my-data-grid-edit-flash": {
    "0%, 100%": {
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
    },
    "35%, 65%": {
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.5 : 0.28),
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
  "& .MuiDataGrid-row.active-row": {
    backgroundColor: (theme: Theme) => `${theme.palette.primary.main}12`,
    boxShadow: (theme: Theme) => `inset 3px 0 0 ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: (theme: Theme) => `${theme.palette.primary.main}20`,
    },
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "nowrap",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& .edited-row": {
      animation: "none",
    },
  },
};

function getColumnMinWidth(column: GridColDef) {
  const header = column.headerName?.trim() || column.field;
  const headerMinWidth = header.length * 8 + 32;
  const contentMinWidth = column.type === "actions" ? 112 : 72;

  return Math.max(column.minWidth ?? 0, headerMinWidth, contentMinWidth);
}

export default function MyDataGrid<TRow extends GridValidRowModel>({
  rows = [],
  columns = [],
  apiRef,
  initialState,
  initialSortModel = [{ field: "id", sort: "asc" }],
  showNavigationButtons = true,
  showGridOptions = false,
  gridOptionsContent,
  onToolbarAdd,
  toolbarSearch,
  toolbarContent,
  autoActivateFirstRow = true,
  autoSelectFirstRow = true,
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
  onRowClick,
  ...dataGridProps
}: MyDataGridProps<TRow>) {
  const theme = useTheme();
  const internalApiRef = useGridApiRef();
  const resolvedApiRef = apiRef ?? internalApiRef;
  const handledOperationRef = useRef<string | null>(null);
  const initialSelectionDoneRef = useRef(false);
  const [activeRowId, setActiveRowId] = useState<GridRowId | null>(null);

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
    () => {
      const directionLocale = theme.direction === "rtl"
        ? arSD.components.MuiDataGrid.defaultProps.localeText
        : undefined;

      return localeText
        ? { ...directionLocale, ...localeText }
        : directionLocale;
    },
    [localeText, theme.direction],
  );

  const resolvedSlots = useMemo(
    () => ({
      toolbar: DataGridToolbar,
      footer: GridFooter,
      ...slots,
    }),
    [slots],
  );

  const resolvedColumns = useMemo(
    () => columns.map((column) => ({ ...column, minWidth: getColumnMinWidth(column) })),
    [columns],
  );

  const shellContext = useMemo(
    () => ({
      showRecordNavigation: showNavigationButtons,
      showColumnFilterButton: dataGridProps.filterMode !== "server",
      showGridOptions,
      gridOptionsContent,
      onToolbarAdd,
      toolbarSearch,
      toolbarContent,
      activeRowId,
      setActiveRowId,
      syncActiveRowSelection: !checkboxSelection,
    }),
    [
      dataGridProps.filterMode,
      gridOptionsContent,
      onToolbarAdd,
      showGridOptions,
      showNavigationButtons,
      toolbarContent,
      toolbarSearch,
      activeRowId,
      checkboxSelection,
    ],
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
      if (idsEqual(params.id, activeRowId)) {
        classes.push("active-row");
      }
      if (idsEqual(params.id, lastAddedId)) {
        classes.push("highlighted-row");
      }
      if (idsEqual(params.id, lastEditedId)) {
        classes.push("edited-row");
      }
      return classes.filter(Boolean).join(" ");
    },
    [activeRowId, getRowClassName, lastAddedId, lastEditedId],
  );

  const resolvedOnRowClick = useCallback<GridEventListener<"rowClick">>(
    (params, event, details) => {
      setActiveRowId(params.id);
      onRowClick?.(params, event, details);
    },
    [onRowClick],
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
    if (!checkboxSelection) {
      api.setRowSelectionModel({ type: "include", ids: new Set([targetId]) });
    }

    const scrollTimer = setTimeout(() => {
      setActiveRowId(targetId);
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
    checkboxSelection,
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
    if (!autoActivateFirstRow) return;

    const api = resolvedApiRef.current;
    if (!api) return;

    const activationTimer = setTimeout(() => {
      const orderedIds = gridFilteredSortedRowIdsSelector(resolvedApiRef);
      const firstId = orderedIds[0] ?? resolveRowId(rows[0]);
      const activeIsVisible = orderedIds.some((id) => idsEqual(id, activeRowId));

      if (activeIsVisible) {
        if (autoSelectFirstRow) initialSelectionDoneRef.current = true;
        return;
      }

      setActiveRowId(firstId);
      api.scrollToIndexes({ rowIndex: 0 });

      // Checkbox grids use row selection for bulk actions. Keep that selection
      // empty while still exposing the first row as the active record.
      if (
        autoSelectFirstRow &&
        !checkboxSelection &&
        !initialSelectionDoneRef.current &&
        lastAddedId == null &&
        lastEditedId == null &&
        lastDeletedIndex == null &&
        api.getSelectedRows().size === 0
      ) {
        api.setRowSelectionModel({ type: "include", ids: new Set([firstId]) });
        initialSelectionDoneRef.current = true;
      }
    }, 150);

    return () => clearTimeout(activationTimer);
  }, [
    activeRowId,
    autoActivateFirstRow,
    autoSelectFirstRow,
    checkboxSelection,
    lastAddedId,
    lastDeletedIndex,
    lastEditedId,
    resolveRowId,
    resolvedApiRef,
    rows,
  ]);

  return (
    <DataGridShellContext.Provider value={shellContext}>
      <ClientDataGrid
        {...dataGridProps}
        rows={rows}
        columns={resolvedColumns}
        apiRef={resolvedApiRef}
        getRowId={getRowId}
        getRowClassName={resolvedGetRowClassName}
        onRowClick={resolvedOnRowClick}
        initialState={resolvedInitialState}
        localeText={resolvedLocaleText}
        pageSizeOptions={pageSizeOptions}
        pagination={pagination}
        paginationMode={paginationMode}
        rowCount={rowCount}
        checkboxSelection={checkboxSelection}
        showToolbar={showToolbar ?? Boolean(onToolbarAdd || showGridOptions || toolbarSearch || toolbarContent || gridOptionsContent)}
        className={showNavigationButtons ? "" : "no-navigation"}
        slots={resolvedSlots}
        sx={resolvedSx}
      />
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

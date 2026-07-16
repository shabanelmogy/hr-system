import { Box } from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
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

const dataGridStyles: SxProps<Theme> = {
  width: "100%",
  minWidth: 0,
  "& .highlighted-row": {
    bgcolor: "action.selected",
    fontWeight: 600,
  },
  "& .MuiDataGrid-footerContainer": {
    borderColor: "divider",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    bgcolor: "action.selected",
    "&:hover": {
      bgcolor: "action.hover",
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
  pageSizeOptions = [5, 10, 25, 50],
  pagination = true,
  paginationMode = "client",
  rowCount,
  showToolbar,
  slots,
  sx,
  ...dataGridProps
}: MyDataGridProps<TRow>) {
  const theme = useTheme();
  const internalApiRef = useGridApiRef();
  const resolvedApiRef = apiRef ?? internalApiRef;
  const handledOperationRef = useRef<string | null>(null);

  const resolvedInitialState = useMemo(
    () => ({
      ...initialState,
      sorting: {
        ...initialState?.sorting,
        sortModel: initialState?.sorting?.sortModel ?? initialSortModel,
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
      footer: GridFooter,
      ...slots,
    }),
    [slots],
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
      if (
        idsEqual(params.id, lastAddedId) ||
        idsEqual(params.id, lastEditedId)
      ) {
        classes.push("highlighted-row");
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
    const visibleColumns = api.getVisibleColumns();
    const columnIndex = Math.max(
      0,
      visibleColumns.findIndex(
        (column) => column.field !== "__check__" && column.field !== "actions",
      ),
    );
    const targetColumn = visibleColumns[columnIndex];

    api.setPage(Math.floor(targetIndex / Math.max(1, pageSize)));
    if (targetColumn) api.setCellFocus(targetId, targetColumn.field);
    api.scrollToIndexes({ rowIndex: targetIndex, colIndex: columnIndex });
    handledOperationRef.current = operation.key;
  }, [
    lastAddedId,
    lastDeletedIndex,
    lastEditedId,
    paginationMode,
    resolveRowId,
    resolvedApiRef,
    rows,
  ]);

  return (
    <DataGridShellContext.Provider value={shellContext}>
      <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
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
          showToolbar={showToolbar ?? Boolean(onToolbarAdd)}
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

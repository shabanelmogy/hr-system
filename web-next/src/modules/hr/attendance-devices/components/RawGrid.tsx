"use client";

import { Alert, Box, Button, Paper } from "@mui/material";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { extractErrorMessage } from "@/shared/utils/errorUtils";

interface RawGridProps<T extends { id: number }> {
  rows: T[]; columns: GridColDef<T>[]; total: number; page: number; pageSize: number;
  loading: boolean; fetching?: boolean; error: Error | null; onRetry: () => void;
  onPaginationChange: (model: GridPaginationModel) => void; sortModel: GridSortModel;
  onSortChange: (model: GridSortModel) => void; searchValue: string; searchPlaceholder: string;
  onSearchChange: (value: string) => void; onReset: () => void;
}

export function RawGrid<T extends { id: number }>({ rows, columns, total, page, pageSize, loading, fetching, error, onRetry, onPaginationChange, sortModel, onSortChange, searchValue, searchPlaceholder, onSearchChange, onReset }: RawGridProps<T>) {
  return <Box sx={{ minHeight: 0, display: "flex", flexDirection: "column", gap: 1 }}>
    <Paper variant="outlined" sx={{ minHeight: 430, overflow: "auto", position: "relative" }}>
      <MyDataGrid rows={rows} columns={columns} loading={loading} checkboxSelection={false} autoSelectFirstRow={false}
        filterMode="server" sortingMode="server" sortModel={sortModel} onSortModelChange={onSortChange}
        pagination paginationMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={onPaginationChange}
        rowCount={total} pageSizeOptions={[5, 10, 25, 50]} showGridOptions
        toolbarSearch={{ value: searchValue, placeholder: searchPlaceholder, onChange: onSearchChange, onClear: () => onSearchChange("") }}
        toolbarContent={<ResetButton onReset={onReset} fullWidth={false} height={40} />}
      />
      {fetching && !loading ? <Box sx={{ position: "absolute", insetInline: 0, top: 0, height: 3, bgcolor: "primary.main" }} /> : null}
    </Paper>
    {error ? <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>{extractErrorMessage(error)}</Alert> : null}
  </Box>;
}

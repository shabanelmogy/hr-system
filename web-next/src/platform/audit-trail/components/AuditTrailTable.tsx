"use client";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { MyDataGrid } from "@/shared/components/data-grid";
import { auditTrailItemKey, type AuditTrailItem } from "../types/auditTrail";
import { AuditActionChip } from "./AuditActionChip";
import { entityLabel, formatAuditDate, moduleLabel } from "./auditTrailFormat";

interface AuditTrailTableProps {
  items: AuditTrailItem[]; onSelect: (item: AuditTrailItem) => void; showRecord?: boolean;
  loading?: boolean; page?: number; hasNextPage?: boolean; onPageChange?: (page: number) => void;
  toolbarFilters?: ReactNode; search?: string; onSearchChange?: (value: string) => void; emptyContent?: ReactNode;
}
export function AuditTrailTable({ items, onSelect, showRecord = true, loading = false, page = 0,
  hasNextPage, onPageChange, toolbarFilters, search = "", onSearchChange, emptyContent }: AuditTrailTableProps) {
  const { t, i18n } = useTranslation();
  const paginationMeta = useMemo(() => hasNextPage === undefined ? undefined : { hasNextPage }, [hasNextPage]);
  const columns = useMemo<GridColDef<AuditTrailItem>[]>(() => [
    { field: "occurredOn", headerName: t("auditLog.when"), width: 180, sortable: false, valueFormatter: value => formatAuditDate(String(value), i18n.language) },
    { field: "action", headerName: t("auditLog.action"), width: 140, sortable: false, renderCell: ({ row }) => <AuditActionChip action={row.action} /> },
    ...(showRecord ? [
      { field: "entityDisplay", headerName: t("auditLog.record"), minWidth: 200, flex: 1, sortable: false, valueGetter: (_value: unknown, row: AuditTrailItem) => `${entityLabel(t, row.entityName)} · ${row.entityDisplay ?? row.entityKey}` },
      { field: "moduleCode", headerName: t("auditLog.module"), width: 170, sortable: false, valueFormatter: (value: unknown) => moduleLabel(t, String(value)) },
    ] : []),
    { field: "userName", headerName: t("auditLog.user"), minWidth: 160, flex: 1, sortable: false, valueGetter: (_value, row) => row.userName ?? row.userId ?? t("auditLog.system") },
    { field: "changeCount", headerName: t("auditLog.changes"), width: 110, sortable: false },
  ], [i18n.language, showRecord, t]);
  return <MyDataGrid rows={items} columns={columns} getRowId={auditTrailItemKey} loading={loading}
    onRowClick={({ row }) => onSelect(row)} onCellKeyDown={({ row }, event) => { if (event.key === "Enter") onSelect(row); }}
    pagination paginationMode={onPageChange ? "server" : "client"} rowCount={onPageChange ? -1 : undefined}
    paginationMeta={onPageChange ? paginationMeta : undefined} pageSizeOptions={[50]}
    paginationModel={onPageChange ? { page, pageSize: 50 } : undefined}
    onPaginationModelChange={onPageChange ? (model: GridPaginationModel) => onPageChange(model.page) : undefined}
    disableColumnFilter disableRowSelectionOnClick showToolbar toolbarFilters={toolbarFilters} emptyContent={emptyContent}
    toolbarSearch={onSearchChange ? { value: search, onChange: onSearchChange, onClear: () => onSearchChange(""), placeholder: t("auditLog.recordKey") } : undefined}
    sx={{ height: "100%", minHeight: 280 }} />;
}

import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { Archive, Edit, LockClock, Restore, Visibility } from "@mui/icons-material";
import { Chip, Divider, ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FiscalYearLifecycleFilter, FiscalYearListItem, FiscalYearPermissions, FiscalYearRecordStatus, FiscalYearSearchField, FiscalYearSearchOperator, FiscalYearSortColumn } from "../types/FiscalYear";

interface Props {
  rows: FiscalYearListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number;
  sortColumn: FiscalYearSortColumn; sortDirection: "ASC" | "DESC"; searchValue: string; searchField: FiscalYearSearchField; searchOperator: FiscalYearSearchOperator;
  recordStatus: FiscalYearRecordStatus; lifecycleStatus: FiscalYearLifecycleFilter; permissions: FiscalYearPermissions; showFilterBar: boolean;
  onSearchChange: (value: string) => void; onSearchFieldChange: (value: FiscalYearSearchField) => void; onSearchOperatorChange: (value: FiscalYearSearchOperator) => void;
  onRecordStatusChange: (value: FiscalYearRecordStatus) => void; onLifecycleStatusChange: (value: FiscalYearLifecycleFilter) => void; onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void; onSortChange: (model: GridSortModel) => void;
  onView: (item: FiscalYearListItem) => void; onEdit: (item: FiscalYearListItem) => void; onArchive: (item: FiscalYearListItem) => void; onRestore: (item: FiscalYearListItem) => void; onLifecycle: (item: FiscalYearListItem) => void;
}

export default function FiscalYearsDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<FiscalYearListItem>[]>(() => [
    { field: "code", headerName: t("fiscalYears.fields.code"), minWidth: 130, flex: .7 },
    { field: "nameAr", headerName: t("general.nameAr"), minWidth: 170, flex: 1 },
    { field: "nameEn", headerName: t("general.nameEn"), minWidth: 170, flex: 1 },
    { field: "startDate", headerName: t("fiscalYears.fields.startDate"), minWidth: 125, flex: .65 },
    { field: "endDate", headerName: t("fiscalYears.fields.endDate"), minWidth: 125, flex: .65 },
    { field: "periodsCount", headerName: t("fiscalYears.fields.periods"), minWidth: 90, align: "center", headerAlign: "center", sortable: false },
    { field: "status", headerName: t("fiscalYears.fields.status"), minWidth: 120, renderCell: ({ row }) => <Chip size="small" color={row.status === 2 ? "success" : row.status === 5 ? "default" : row.status === 3 ? "warning" : "info"} label={t(`fiscalYears.status.${["", "draft", "open", "closing", "closed", "locked"][row.status]}`)} /> },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 185, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<Visibility />} label={t("actions.view")} onClick={() => props.onView(row)} showInMenu={false} />,
      <GridActionsCellItem key="edit" icon={<Edit />} label={t("actions.edit")} disabled={!props.permissions.canEdit || row.isDeleted || row.status !== 1} onClick={() => props.onEdit(row)} showInMenu={false} />,
      <GridActionsCellItem key="lifecycle" icon={<LockClock />} label={t("fiscalYears.actions.lifecycle")} disabled={!props.permissions.canManageLifecycle || row.isDeleted || row.status === 5} onClick={() => props.onLifecycle(row)} showInMenu />,
      row.isDeleted
        ? <GridActionsCellItem key="restore" icon={<Restore />} label={t("actions.restore")} disabled={!props.permissions.canDelete} onClick={() => props.onRestore(row)} showInMenu />
        : <GridActionsCellItem key="archive" icon={<Archive />} label={t("actions.archive")} disabled={!props.permissions.canDelete || row.status !== 1} onClick={() => props.onArchive(row)} showInMenu />,
    ] },
  ], [props, t]);
  const operators: FiscalYearSearchOperator[] = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
  const lifecycles: FiscalYearLifecycleFilter[] = ["all", "draft", "open", "closing", "closed", "locked"];
  return <ContentWrapper><MyDataGrid
    rows={props.rows} columns={columns} loading={props.loading} pagination paginationMode="server" filterMode="server" sortingMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }} onPaginationModelChange={props.onPaginationChange} rowCount={props.totalCount} pageSizeOptions={[5, 10, 25, 50]}
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={props.onSortChange}
    showToolbar={props.showFilterBar} showGridOptions
    toolbarSearch={{ value: props.searchValue, placeholder: t("fiscalYears.search.placeholder"), onChange: props.onSearchChange, onClear: () => props.onSearchChange(""),
      column: { label: t("fiscalYears.search.column"), value: props.searchField, onChange: value => props.onSearchFieldChange(value as FiscalYearSearchField), options: ["all", "code", "nameAr", "nameEn"].map(value => ({ value, label: t(`fiscalYears.search.fields.${value}`) })) },
      operator: { label: t("fiscalYears.search.condition"), value: props.searchOperator, onChange: value => props.onSearchOperatorChange(value as FiscalYearSearchOperator), options: operators.map(value => ({ value, label: t(`fiscalYears.search.operators.${value}`) })) } }}
    toolbarContent={<ResetButton onReset={props.onReset} fullWidth={false} height={40} />}
    gridOptionsContent={close => <>
      <MenuItem disabled><ListItemText primary={t("fiscalYears.filters.recordStatus")} /></MenuItem>
      {(["active", "archived", "all"] as const).map(value => <MenuItem key={value} selected={props.recordStatus === value} onClick={() => { close(); props.onRecordStatusChange(value); }}><ListItemIcon><Radio checked={props.recordStatus === value} size="small" /></ListItemIcon><ListItemText primary={t(`fiscalYears.recordStatus.${value}`)} /></MenuItem>)}
      <Divider component="li" /><MenuItem disabled><ListItemText primary={t("fiscalYears.filters.lifecycle")} /></MenuItem>
      {lifecycles.map(value => <MenuItem key={value} selected={props.lifecycleStatus === value} onClick={() => { close(); props.onLifecycleStatusChange(value); }}><ListItemIcon><Radio checked={props.lifecycleStatus === value} size="small" /></ListItemIcon><ListItemText primary={t(`fiscalYears.status.${value}`)} /></MenuItem>)}
    </>}
  /></ContentWrapper>;
}

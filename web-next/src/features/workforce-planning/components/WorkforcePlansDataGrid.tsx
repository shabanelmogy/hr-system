import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { Archive, CheckCircle, Edit, RateReview, Redo, Restore, Send, Undo, Visibility } from "@mui/icons-material";
import { Chip, MenuItem, Stack, TextField } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { WorkforcePlanListItem, WorkforcePlanPageQuery, WorkforcePlanPermissions } from "../types/WorkforcePlan";

interface LookupOption { id: number; label: string }
interface Props {
  rows: WorkforcePlanListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number;
  sortColumn: WorkforcePlanPageQuery["sortBy"]; sortDirection: "ASC" | "DESC"; searchValue: string; status: string; recordStatus: "active" | "archived" | "all"; fiscalYearId?: number;
  fiscalYears: LookupOption[]; permissions: WorkforcePlanPermissions; showFilterBar: boolean;
  onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onRecordStatusChange: (value: "active" | "archived" | "all") => void; onFiscalYearChange: (value?: number) => void; onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void; onSortChange: (model: GridSortModel) => void;
  onView: (item: WorkforcePlanListItem) => void; onEdit: (item: WorkforcePlanListItem) => void; onLifecycle: (item: WorkforcePlanListItem) => void; onReject: (item: WorkforcePlanListItem) => void; onArchive: (item: WorkforcePlanListItem) => void; onRestore: (item: WorkforcePlanListItem) => void;
}

const statusKeys = ["", "draft", "submitted", "underReview", "approved", "rejected", "superseded"];

export default function WorkforcePlansDataGrid(props: Props) {
  const { t } = useTranslation();
  const lifecycleIcon = (status: number) => status === 2 ? <RateReview /> : status === 3 ? <CheckCircle /> : status === 4 || status === 6 ? <Redo /> : <Send />;
  const lifecycleKey = (status: number) => status === 2 ? "beginReview" : status === 3 ? "approve" : status === 4 || status === 6 ? "createRevision" : "submit";
  const columns = useMemo<GridColDef<WorkforcePlanListItem>[]>(() => [
    { field: "planCode", headerName: t("workforcePlanning.fields.planCode"), minWidth: 140, flex: .7 },
    { field: "titleEn", headerName: t("workforcePlanning.fields.titleEn"), minWidth: 190, flex: 1 },
    { field: "revisionNumber", headerName: t("workforcePlanning.fields.revision"), width: 90, align: "center", headerAlign: "center" },
    { field: "linesCount", headerName: t("workforcePlanning.fields.lines"), width: 90, align: "center", headerAlign: "center", sortable: false },
    { field: "newHireSlots", headerName: t("workforcePlanning.fields.newHireSlots"), width: 135, align: "center", headerAlign: "center", sortable: false },
    { field: "replacementSlots", headerName: t("workforcePlanning.fields.replacementSlots"), width: 135, align: "center", headerAlign: "center", sortable: false },
    { field: "plannedHiringSlots", headerName: t("workforcePlanning.fields.plannedHiringSlots"), width: 135, align: "center", headerAlign: "center", sortable: false },
    { field: "status", headerName: t("workforcePlanning.fields.status"), minWidth: 170, renderCell: ({ row }) => <Stack direction="row" spacing={.5}><Chip size="small" color={row.status === 4 ? "success" : row.status === 5 ? "error" : row.status === 3 ? "warning" : "info"} label={t(`workforcePlanning.status.${statusKeys[row.status]}`)} />{row.isDeleted ? <Chip size="small" variant="outlined" label={t("workforcePlanning.recordStatus.archived")} /> : null}</Stack> },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 190, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<Visibility />} label={t("actions.view")} onClick={() => props.onView(row)} />,
      <GridActionsCellItem key="edit" icon={<Edit />} label={t("actions.edit")} disabled={row.isDeleted || !props.permissions.canEdit || ![1, 5].includes(row.status)} onClick={() => props.onEdit(row)} />,
      <GridActionsCellItem key="lifecycle" icon={lifecycleIcon(row.status)} label={t(`workforcePlanning.actions.${lifecycleKey(row.status)}`)} disabled={row.isDeleted || (row.status === 2 || row.status === 3 ? !props.permissions.canApprove : [4, 6].includes(row.status) ? !props.permissions.canCreate : !props.permissions.canEdit)} onClick={() => props.onLifecycle(row)} showInMenu />,
      <GridActionsCellItem key="reject" icon={<Undo />} label={t("workforcePlanning.actions.reject")} disabled={row.isDeleted || !props.permissions.canApprove || row.status !== 3} onClick={() => props.onReject(row)} showInMenu />,
      row.isDeleted
        ? <GridActionsCellItem key="restore" icon={<Restore />} label={t("workforcePlanning.actions.restore")} disabled={!props.permissions.canDelete} onClick={() => props.onRestore(row)} showInMenu />
        : <GridActionsCellItem key="archive" icon={<Archive />} label={t("workforcePlanning.actions.archive")} disabled={!props.permissions.canDelete || ![1, 5].includes(row.status)} onClick={() => props.onArchive(row)} showInMenu />,
    ] },
  ], [props, t]);

  return <ContentWrapper><MyDataGrid
    rows={props.rows} columns={columns} loading={props.loading} pagination paginationMode="server" filterMode="server" sortingMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }} onPaginationModelChange={props.onPaginationChange} rowCount={props.totalCount} pageSizeOptions={[5, 10, 25, 50]}
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={props.onSortChange}
    showToolbar={props.showFilterBar} showGridOptions
    toolbarSearch={{ value: props.searchValue, placeholder: t("workforcePlanning.search.placeholder"), onChange: props.onSearchChange, onClear: () => props.onSearchChange("") }}
    toolbarContent={<><TextField select size="small" label={t("workforcePlanning.filters.status")} value={props.status} onChange={event => props.onStatusChange(event.target.value)} sx={{ minWidth: 150 }}>{["all", "draft", "submitted", "underReview", "approved", "rejected", "superseded"].map(value => <MenuItem key={value} value={value}>{t(value === "all" ? "common.all" : `workforcePlanning.status.${value}`)}</MenuItem>)}</TextField><TextField select size="small" label={t("workforcePlanning.filters.recordStatus")} value={props.recordStatus} onChange={event => props.onRecordStatusChange(event.target.value as "active" | "archived" | "all")} sx={{ minWidth: 150 }}>{["active", "archived", "all"].map(value => <MenuItem key={value} value={value}>{t(`workforcePlanning.recordStatus.${value}`)}</MenuItem>)}</TextField><TextField select size="small" label={t("workforcePlanning.fields.fiscalYear")} value={props.fiscalYearId ?? 0} onChange={event => props.onFiscalYearChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.fiscalYears.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField><ResetButton onReset={props.onReset} fullWidth={false} height={40} /></>}
  /></ContentWrapper>;
}

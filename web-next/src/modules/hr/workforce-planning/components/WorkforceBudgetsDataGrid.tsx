import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { CheckCircle, Edit, Send, Undo, Visibility } from "@mui/icons-material";
import { Chip, MenuItem, Stack, TextField } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { WorkforceBudgetListItem, WorkforceBudgetPageQuery, WorkforceBudgetPermissions } from "../types/WorkforceBudget";

interface LookupOption { id: number; label: string }
interface Props {
  rows: WorkforceBudgetListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number;
  sortColumn: WorkforceBudgetPageQuery["sortBy"]; sortDirection: "ASC" | "DESC"; searchValue: string; status: string; fiscalYearId?: number;
  fiscalYears: LookupOption[]; plans: LookupOption[]; workforcePlanId?: number; permissions: WorkforceBudgetPermissions; showFilterBar: boolean;
  onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onFiscalYearChange: (value?: number) => void; onPlanChange: (value?: number) => void; onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void; onSortChange: (model: GridSortModel) => void;
  onView: (item: WorkforceBudgetListItem) => void; onEdit: (item: WorkforceBudgetListItem) => void; onLifecycle: (item: WorkforceBudgetListItem) => void; onReject: (item: WorkforceBudgetListItem) => void;
}

const statusKeys = ["", "draft", "submitted", "approved", "rejected", "superseded", "closed"];

export default function WorkforceBudgetsDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<WorkforceBudgetListItem>[]>(() => [
    { field: "budgetCode", headerName: t("workforceBudget.fields.budgetCode"), minWidth: 140, flex: .7 },
    { field: "currencyCode", headerName: t("workforceBudget.fields.currency"), width: 90, align: "center", headerAlign: "center" },
    { field: "revisionNumber", headerName: t("workforceBudget.fields.revision"), width: 90, align: "center", headerAlign: "center", sortable: false },
    { field: "totalAuthorizedHeadcount", headerName: t("workforceBudget.fields.headcount"), width: 130, align: "center", headerAlign: "center", sortable: false },
    { field: "totalSalaryBudget", headerName: t("workforceBudget.fields.salary"), width: 150, align: "center", headerAlign: "center", sortable: false, valueFormatter: value => Number(value ?? 0).toLocaleString() },
    { field: "totalRecruitmentBudget", headerName: t("workforceBudget.fields.recruitment"), width: 150, align: "center", headerAlign: "center", sortable: false, valueFormatter: value => Number(value ?? 0).toLocaleString() },
    { field: "grandTotalBudget", headerName: t("workforceBudget.fields.grandTotal"), width: 150, align: "center", headerAlign: "center", valueFormatter: value => Number(value ?? 0).toLocaleString() },
    {
      field: "status", headerName: t("workforceBudget.fields.status"), minWidth: 190,
      renderCell: ({ row }) => <Stack direction="row" spacing={.5} sx={{ height: "100%", alignItems: "center" }}><Chip size="small" color={row.status === 3 ? "success" : row.status === 4 ? "error" : row.status === 2 ? "warning" : "info"} label={t(`workforceBudget.status.${statusKeys[row.status]}`)} />{row.isEffective ? <Chip size="small" color="success" variant="outlined" label={t("workforceBudget.effective")} /> : null}</Stack>,
    },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 150, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<Visibility />} label={t("actions.view")} onClick={() => props.onView(row)} />,
      <GridActionsCellItem key="edit" icon={<Edit />} label={t("actions.edit")} disabled={!props.permissions.canManage || ![1, 4].includes(row.status)} onClick={() => props.onEdit(row)} />,
      <GridActionsCellItem key="lifecycle" icon={row.status === 2 ? <CheckCircle /> : <Send />} label={t(`workforceBudget.actions.${row.status === 2 ? "approve" : "submit"}`)} disabled={row.status === 2 ? !props.permissions.canApprove : !props.permissions.canManage || ![1, 4].includes(row.status)} onClick={() => props.onLifecycle(row)} showInMenu />,
      <GridActionsCellItem key="reject" icon={<Undo />} label={t("workforceBudget.actions.reject")} disabled={!props.permissions.canManage || row.status !== 2} onClick={() => props.onReject(row)} showInMenu />,
    ] },
  ], [props, t]);

  return <ContentWrapper><MyDataGrid
    rows={props.rows} columns={columns} loading={props.loading} pagination paginationMode="server" filterMode="server" sortingMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }} onPaginationModelChange={props.onPaginationChange} rowCount={props.totalCount} pageSizeOptions={[5, 10, 25, 50]}
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={props.onSortChange}
    showToolbar={props.showFilterBar} showGridOptions
    toolbarSearch={{ value: props.searchValue, placeholder: t("workforceBudget.search.placeholder"), onChange: props.onSearchChange, onClear: () => props.onSearchChange("") }}
    toolbarContent={<><TextField select size="small" label={t("workforceBudget.filters.status")} value={props.status} onChange={event => props.onStatusChange(event.target.value)} sx={{ minWidth: 150 }}>{["all", "draft", "submitted", "approved", "rejected", "superseded", "closed"].map(value => <MenuItem key={value} value={value}>{t(value === "all" ? "common.all" : `workforceBudget.status.${value}`)}</MenuItem>)}</TextField><TextField select size="small" label={t("workforceBudget.fields.fiscalYear")} value={props.fiscalYearId ?? 0} onChange={event => props.onFiscalYearChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.fiscalYears.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField><TextField select size="small" label={t("workforceBudget.fields.plan")} value={props.workforcePlanId ?? 0} onChange={event => props.onPlanChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.plans.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField><ResetButton onReset={props.onReset} fullWidth={false} height={40} /></>}
  /></ContentWrapper>;
}

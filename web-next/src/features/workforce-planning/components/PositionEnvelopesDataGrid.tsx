import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { Visibility } from "@mui/icons-material";
import { LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PositionEnvelopeListItem, PositionEnvelopePageQuery } from "../types/WorkforceBudget";

interface LookupOption { id: number; label: string }
interface Props {
  rows: PositionEnvelopeListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number;
  sortColumn: PositionEnvelopePageQuery["sortBy"]; sortDirection: "ASC" | "DESC"; searchValue: string; fiscalYearId?: number;
  fiscalYears: LookupOption[]; showFilterBar: boolean;
  onSearchChange: (value: string) => void; onFiscalYearChange: (value?: number) => void; onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void; onSortChange: (model: GridSortModel) => void;
  onView: (item: PositionEnvelopeListItem) => void;
}

function CapacityBar({ used, total }: { used: number; total: number }) {
  const ratio = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return <Stack spacing={.5} sx={{ minWidth: 120 }}><LinearProgress variant="determinate" value={ratio} aria-label={`${used}/${total}`} /><Typography variant="caption">{used}/{total}</Typography></Stack>;
}

export default function PositionEnvelopesDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<PositionEnvelopeListItem>[]>(() => [
    { field: "envelopeCode", headerName: t("envelopes.fields.envelopeCode"), minWidth: 160, flex: .8 },
    { field: "currencyCode", headerName: t("envelopes.fields.currency"), width: 90, align: "center", headerAlign: "center", sortable: false },
    {
      field: "availableHeadcount", headerName: t("envelopes.fields.headcountCapacity"), minWidth: 200, sortable: false,
      renderCell: ({ row }) => <CapacityBar used={row.authorizedHeadcount - row.availableHeadcount} total={row.authorizedHeadcount} />,
    },
    {
      field: "availableSalaryBudget", headerName: t("envelopes.fields.salaryCapacity"), minWidth: 220, sortable: false,
      renderCell: ({ row }) => <Typography variant="body2">{t("envelopes.capacity.salary", { available: row.availableSalaryBudget.toLocaleString(), total: row.authorizedSalaryBudget.toLocaleString(), currency: row.currencyCode })}</Typography>,
    },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 90, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<Visibility />} label={t("actions.view")} onClick={() => props.onView(row)} />,
    ] },
  ], [props, t]);

  return <ContentWrapper><MyDataGrid
    rows={props.rows} columns={columns} loading={props.loading} pagination paginationMode="server" filterMode="server" sortingMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }} onPaginationModelChange={props.onPaginationChange} rowCount={props.totalCount} pageSizeOptions={[5, 10, 25, 50]}
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={props.onSortChange}
    showToolbar={props.showFilterBar} showGridOptions
    toolbarSearch={{ value: props.searchValue, placeholder: t("envelopes.search.placeholder"), onChange: props.onSearchChange, onClear: () => props.onSearchChange("") }}
    toolbarContent={<><TextField select size="small" label={t("envelopes.fields.fiscalYear")} value={props.fiscalYearId ?? 0} onChange={event => props.onFiscalYearChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.fiscalYears.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField><ResetButton onReset={props.onReset} fullWidth={false} height={40} /></>}
  /></ContentWrapper>;
}

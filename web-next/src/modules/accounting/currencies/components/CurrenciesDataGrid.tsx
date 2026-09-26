import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import type { Currency, CurrencyRecordStatus, CurrencySearchField, CurrencySearchOperator, CurrencySortColumn } from "../types/Currency";

interface Props {
  rows: Currency[]; loading: boolean; page: number; pageSize: number; totalCount: number;
  sortColumn: CurrencySortColumn; sortDirection: "ASC" | "DESC";
  searchValue: string; searchField: CurrencySearchField; searchOperator: CurrencySearchOperator;
  recordStatus: CurrencyRecordStatus; canEdit: boolean; canArchive: boolean; canRestore: boolean;
  onSearchChange: (value: string) => void; onSearchFieldChange: (value: CurrencySearchField) => void;
  onSearchOperatorChange: (value: CurrencySearchOperator) => void; onRecordStatusChange: (value: CurrencyRecordStatus) => void;
  onReset: () => void; onPaginationChange: (model: GridPaginationModel) => void; onSortChange: (model: GridSortModel) => void;
  onView: (item: Currency) => void; onEdit: (item: Currency) => void; onArchive: (item: Currency) => void; onRestore: (item: Currency) => void;
}

export default function CurrenciesDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<Currency>[]>(() => [
    { field: "currencyCode", headerName: t("currencies.fields.currencyCode"), minWidth: 120, flex: 0.6 },
    { field: "nameAr", headerName: t("general.nameAr"), minWidth: 180, flex: 1 },
    { field: "nameEn", headerName: t("general.nameEn"), minWidth: 180, flex: 1 },
    { field: "symbol", headerName: t("currencies.fields.symbol"), minWidth: 110, flex: 0.5, align: "center", headerAlign: "center" },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 165, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<Visibility />} label={t("actions.view")} onClick={() => props.onView(row)} showInMenu={false} />,
      <GridActionsCellItem key="edit" icon={<Edit />} label={t("actions.edit")} disabled={!props.canEdit || row.isDeleted} onClick={() => props.onEdit(row)} showInMenu={false} />,
      row.isDeleted
        ? <GridActionsCellItem key="restore" icon={<Restore />} label={t("actions.restore")} disabled={!props.canRestore} onClick={() => props.onRestore(row)} showInMenu />
        : <GridActionsCellItem key="archive" icon={<Archive />} label={t("actions.archive")} disabled={!props.canArchive} onClick={() => props.onArchive(row)} showInMenu />,
    ] },
  ], [props, t]);
  const operators: CurrencySearchOperator[] = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
  const fields: CurrencySearchField[] = ["all", "currencyCode", "nameAr", "nameEn", "symbol"];

  return <ContentWrapper><MyDataGrid
    rows={props.rows} columns={columns} loading={props.loading}
    pagination paginationMode="server" filterMode="server" sortingMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }} onPaginationModelChange={props.onPaginationChange}
    rowCount={props.totalCount} pageSizeOptions={[5, 10, 25, 50]}
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={props.onSortChange}
    showToolbar showGridOptions
    toolbarSearch={{
      value: props.searchValue, placeholder: t("currencies.search.placeholder"), onChange: props.onSearchChange, onClear: () => props.onSearchChange(""),
      column: { label: t("currencies.search.column"), value: props.searchField, onChange: value => props.onSearchFieldChange(value as CurrencySearchField), options: fields.map(value => ({ value, label: t(`currencies.search.fields.${value}`) })) },
      operator: { label: t("currencies.search.condition"), value: props.searchOperator, onChange: value => props.onSearchOperatorChange(value as CurrencySearchOperator), options: operators.map(value => ({ value, label: t(`currencies.search.operators.${value}`) })) },
    }}
    toolbarContent={<ResetButton onReset={props.onReset} fullWidth={false} height={40} />}
    gridOptionsContent={close => <>{(["active", "archived", "all"] as const).map(value => <MenuItem key={value} selected={props.recordStatus === value} onClick={() => { close(); props.onRecordStatusChange(value); }}><ListItemIcon><Radio checked={props.recordStatus === value} size="small" /></ListItemIcon><ListItemText primary={t(`currencies.recordStatus.${value}`)} /></MenuItem>)}</>}
  /></ContentWrapper>;
}

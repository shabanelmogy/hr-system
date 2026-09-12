import { Archive } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { type GridPaginationModel, type GridRowSelectionModel, type GridSortModel } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import type { AddressType, AddressTypeSearchField, AddressTypeSearchOperator, AddressTypeSortColumn, AddressTypeStatus } from "../../types/AddressType";
import type { AddressTypePermissionSet } from "../../utils/addressTypePermissions";
import { makeAddressTypeActions } from "./GridActions";
import { useAddressTypeColumns } from "./Columns";

export interface AddressTypesDataGridProps {
  items: AddressType[];
  loading: boolean;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onRestore: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  permissions: AddressTypePermissionSet;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: AddressTypeSortColumn;
  sortDirection: "ASC" | "DESC";
  searchValue: string;
  searchField: AddressTypeSearchField;
  searchOperator: AddressTypeSearchOperator;
  status: AddressTypeStatus;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: AddressTypeSearchField) => void;
  onSearchOperatorChange: (value: AddressTypeSearchOperator) => void;
  onStatusChange: (value: AddressTypeStatus) => void;
  onReset: () => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving: boolean;
  showFilterBar: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
}

export default function AddressTypesDataGrid(props: AddressTypesDataGridProps) {
  const { t } = useTranslation();
  const getActions = useMemo(() => makeAddressTypeActions({ t, permissions: props.permissions, onView: props.onView, onEdit: props.onEdit, onDelete: props.onDelete, onRestore: props.onRestore }), [props.onDelete, props.onEdit, props.onRestore, props.onView, props.permissions, t]);
  const columns = useAddressTypeColumns({ t, permissions: props.permissions, getActions });
  const selection = useMemo<GridRowSelectionModel>(() => ({ type: "include", ids: new Set(props.selectedIds) }), [props.selectedIds]);
  return <ContentWrapper><MyDataGrid
    rows={props.items}
    columns={columns}
    loading={props.loading}
    filterMode="server"
    sortingMode="server"
    sortModel={[{ field: props.sortColumn, sort: props.sortDirection.toLowerCase() as "asc" | "desc" }]}
    onSortModelChange={props.onSortChange}
    pagination
    paginationMode="server"
    paginationModel={{ page: props.page, pageSize: props.pageSize }}
    onPaginationModelChange={props.onPaginationChange}
    rowCount={props.totalCount}
    pageSizeOptions={[5, 10, 25, 50]}
    showToolbar={props.showFilterBar}
    showGridOptions
    toolbarSearch={{
      value: props.searchValue,
      placeholder: t("addressTypes.search.placeholder"),
      onChange: props.onSearchChange,
      onClear: () => props.onSearchChange(""),
      column: { label: t("addressTypes.search.column"), value: props.searchField, onChange: (value) => props.onSearchFieldChange(value as AddressTypeSearchField), options: [{ value: "all", label: t("addressTypes.search.allColumns") }, { value: "nameAr", label: t("general.nameAr") }, { value: "nameEn", label: t("general.nameEn") }] },
      operator: { label: t("addressTypes.search.condition"), value: props.searchOperator, onChange: (value) => props.onSearchOperatorChange(value as AddressTypeSearchOperator), options: ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"].map((value) => ({ value, label: t(`addressTypes.search.operators.${value}`) })) },
    }}
    toolbarContent={<ResetButton onReset={props.onReset} fullWidth={false} height={40} />}
    gridOptionsContent={(closeMenu) => <><MenuItem disabled><ListItemText primary={t("addressTypes.status.label")} /></MenuItem>{(["active", "archived", "all"] as const).map((value) => <MenuItem key={value} selected={props.status === value} onClick={() => { closeMenu(); props.onStatusChange(value); }}><ListItemIcon><Radio checked={props.status === value} size="small" /></ListItemIcon><ListItemText primary={t(`addressTypes.status.${value}`)} /></MenuItem>)}{props.permissions.canDelete ? <><Divider component="li" /><MenuItem disabled={props.selectedIds.length === 0 || props.isBulkArchiving} onClick={() => { closeMenu(); props.onBulkArchive(); }} sx={{ color: "warning.main" }}><ListItemIcon><Archive fontSize="small" /></ListItemIcon><ListItemText primary={t("addressTypes.bulkArchiveAction", { count: props.selectedIds.length })} /></MenuItem></> : null}</>}
    checkboxSelection={props.permissions.canDelete}
    autoSelectFirstRow={false}
    disableRowSelectionExcludeModel
    rowSelectionModel={selection}
    onRowSelectionModelChange={(model) => props.onSelectedIdsChange([...model.ids].map(Number).filter((id) => Number.isInteger(id) && id > 0))}
    isRowSelectable={({ row }) => props.permissions.canDelete && !row.isDeleted}
  /></ContentWrapper>;
}

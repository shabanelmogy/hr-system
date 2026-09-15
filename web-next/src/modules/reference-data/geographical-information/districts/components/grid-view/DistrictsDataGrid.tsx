import React, { useMemo } from "react";
import { Archive } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { type GridApi, type GridPaginationModel, type GridRowSelectionModel, type GridSortModel } from "@mui/x-data-grid";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { useTranslation } from "react-i18next";
import type { DistrictListItem, DistrictSearchField, DistrictSearchOperator, DistrictSortColumn, DistrictStatus } from "../../types/District";
import type { DistrictPermissionSet } from "../../utils/districtPermissions";
import { makeStateActions } from "./GridActions";
import { useDistrictColumns } from "./Columns";

export interface DistrictsDataGridProps {
  districts: DistrictListItem[];
  paginationMode: "client" | "server";
  loading?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (state: DistrictListItem) => void;
  onDelete: (state: DistrictListItem) => void;
  onRestore: (state: DistrictListItem) => void;
  onView: (state: DistrictListItem) => void;
  permissions: DistrictPermissionSet;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: DistrictSortColumn;
  sortDirection: "ASC" | "DESC";
  searchValue: string;
  searchField: DistrictSearchField;
  searchOperator: DistrictSearchOperator;
  status: DistrictStatus;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: DistrictSearchField) => void;
  onSearchOperatorChange: (value: DistrictSearchOperator) => void;
  onStatusChange: (value: DistrictStatus) => void;
  onReset: () => void;
  selectedDistrictIds: number[];
  onSelectedDistrictIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving?: boolean;
  showFilterBar?: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const DistrictsDataGrid: React.FC<DistrictsDataGridProps> = ({
  districts, paginationMode, loading = false, apiRef, onEdit, onDelete, onRestore, onView, permissions,
  page, pageSize, totalCount, sortColumn, sortDirection, searchValue, searchField, searchOperator, status,
  onSearchChange, onSearchFieldChange, onSearchOperatorChange, onStatusChange, onReset,
  selectedDistrictIds, onSelectedDistrictIdsChange, onBulkArchive, isBulkArchiving = false,
  showFilterBar = true,
  onPaginationChange, onSortChange, lastAddedId, lastEditedId, lastDeletedIndex,
}) => {
  const { t } = useTranslation();
  const getActions = useMemo(
    () => makeStateActions({ t, permissions, onView, onEdit, onDelete, onRestore }),
    [onDelete, onEdit, onRestore, onView, permissions, t],
  );
  const columns = useDistrictColumns({ t, permissions, getActions });
  const rowSelectionModel = useMemo<GridRowSelectionModel>(() => ({ type: "include", ids: new Set(selectedDistrictIds) }), [selectedDistrictIds]);

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={districts} columns={columns} loading={loading} apiRef={apiRef}
        filterMode="server" sortingMode="server"
        sortModel={[{ field: sortColumn, sort: sortDirection.toLowerCase() as "asc" | "desc" }]}
        onSortModelChange={onSortChange}
        pagination paginationMode={paginationMode} paginationModel={{ page, pageSize }} onPaginationModelChange={onPaginationChange}
        rowCount={paginationMode === "server" ? totalCount : undefined} pageSizeOptions={[5, 10, 25, 50]} showToolbar={showFilterBar} showGridOptions
        toolbarSearch={{
          value: searchValue, placeholder: t("districts.search.placeholder"), onChange: onSearchChange, onClear: () => onSearchChange(""),
          column: {
            label: t("districts.search.column"), value: searchField,
            onChange: (value) => onSearchFieldChange(value as DistrictSearchField),
            options: [
              { value: "all", label: t("districts.search.allColumns") }, { value: "nameAr", label: t("general.nameAr") },
              { value: "nameEn", label: t("general.nameEn") }, { value: "code", label: t("districts.code") },
              { value: "state", label: t("districts.state") },
            ],
          },
          operator: {
            label: t("districts.search.condition"), value: searchOperator,
            onChange: (value) => onSearchOperatorChange(value as DistrictSearchOperator),
            options: [
              { value: "contains", label: t("districts.search.operators.contains") }, { value: "doesNotContain", label: t("districts.search.operators.doesNotContain") },
              { value: "equals", label: t("districts.search.operators.equals") }, { value: "doesNotEqual", label: t("districts.search.operators.doesNotEqual") },
              { value: "startsWith", label: t("districts.search.operators.startsWith") }, { value: "endsWith", label: t("districts.search.operators.endsWith") },
            ],
          },
        }}
        toolbarContent={<ResetButton onReset={onReset} fullWidth={false} height={40} />}
        gridOptionsContent={(closeMenu) => <>
          <MenuItem disabled><ListItemText primary={t("districts.status.label")} /></MenuItem>
          {(["active", "archived", "all"] as const).map((value) => (
            <MenuItem key={value} selected={status === value} onClick={() => { closeMenu(); onStatusChange(value); }}>
              <ListItemIcon><Radio checked={status === value} size="small" /></ListItemIcon><ListItemText primary={t(`districts.status.${value}`)} />
            </MenuItem>
          ))}
          {permissions.canDelete ? <><Divider component="li" /><MenuItem disabled={selectedDistrictIds.length === 0 || isBulkArchiving} onClick={() => { closeMenu(); onBulkArchive(); }} sx={{ color: "warning.main" }}>
            <ListItemIcon><Archive fontSize="small" /></ListItemIcon><ListItemText primary={t("districts.bulkArchiveAction", { count: selectedDistrictIds.length })} />
          </MenuItem></> : null}
        </>}
        checkboxSelection={permissions.canDelete} autoSelectFirstRow={false} disableRowSelectionExcludeModel
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(model) => onSelectedDistrictIdsChange([...model.ids].map(Number).filter((id) => Number.isInteger(id) && id > 0))}
        isRowSelectable={({ row }) => permissions.canDelete && !row.isDeleted}
        lastAddedId={lastAddedId} lastEditedId={lastEditedId} lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default DistrictsDataGrid;

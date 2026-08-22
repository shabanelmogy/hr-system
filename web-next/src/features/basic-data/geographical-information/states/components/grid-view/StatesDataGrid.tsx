import React, { useMemo } from "react";
import { Archive } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { type GridApi, type GridPaginationModel, type GridRowSelectionModel, type GridSortModel } from "@mui/x-data-grid";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { useTranslation } from "react-i18next";
import type { StateListItem, StateSearchField, StateSearchOperator, StateSortColumn, StateStatus } from "../../types/State";
import type { StatePermissionSet } from "../../utils/statePermissions";
import { makeStateActions } from "./GridActions";
import { useStateColumns } from "./Columns";

export interface StatesDataGridProps {
  states: StateListItem[];
  paginationMode: "client" | "server";
  loading?: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onRestore: (state: StateListItem) => void;
  onView: (state: StateListItem) => void;
  permissions: StatePermissionSet;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: StateSortColumn;
  sortDirection: "ASC" | "DESC";
  searchValue: string;
  searchField: StateSearchField;
  searchOperator: StateSearchOperator;
  status: StateStatus;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: StateSearchField) => void;
  onSearchOperatorChange: (value: StateSearchOperator) => void;
  onStatusChange: (value: StateStatus) => void;
  onReset: () => void;
  selectedStateIds: number[];
  onSelectedStateIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving?: boolean;
  showFilterBar?: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const StatesDataGrid: React.FC<StatesDataGridProps> = ({
  states, paginationMode, loading = false, isFetching = false, apiRef, onEdit, onDelete, onRestore, onView, permissions,
  page, pageSize, totalCount, sortColumn, sortDirection, searchValue, searchField, searchOperator, status,
  onSearchChange, onSearchFieldChange, onSearchOperatorChange, onStatusChange, onReset,
  selectedStateIds, onSelectedStateIdsChange, onBulkArchive, isBulkArchiving = false,
  showFilterBar = true,
  onPaginationChange, onSortChange, lastAddedId, lastEditedId, lastDeletedIndex,
}) => {
  const { t } = useTranslation();
  const getActions = useMemo(
    () => makeStateActions({ t, permissions, onView, onEdit, onDelete, onRestore }),
    [onDelete, onEdit, onRestore, onView, permissions, t],
  );
  const columns = useStateColumns({ t, permissions, getActions });
  const rowSelectionModel = useMemo<GridRowSelectionModel>(() => ({ type: "include", ids: new Set(selectedStateIds) }), [selectedStateIds]);

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={states} columns={columns} loading={loading || isFetching} apiRef={apiRef}
        filterMode="server" sortingMode="server"
        sortModel={[{ field: sortColumn, sort: sortDirection.toLowerCase() as "asc" | "desc" }]}
        onSortModelChange={onSortChange}
        pagination paginationMode={paginationMode} paginationModel={{ page, pageSize }} onPaginationModelChange={onPaginationChange}
        rowCount={paginationMode === "server" ? totalCount : undefined} pageSizeOptions={[5, 10, 25, 50]} showToolbar={showFilterBar} showGridOptions
        toolbarSearch={{
          value: searchValue, placeholder: t("states.search.placeholder"), onChange: onSearchChange, onClear: () => onSearchChange(""),
          column: {
            label: t("states.search.column"), value: searchField,
            onChange: (value) => onSearchFieldChange(value as StateSearchField),
            options: [
              { value: "all", label: t("states.search.allColumns") }, { value: "nameAr", label: t("general.nameAr") },
              { value: "nameEn", label: t("general.nameEn") }, { value: "code", label: t("states.code") },
              { value: "country", label: t("states.country") },
            ],
          },
          operator: {
            label: t("states.search.condition"), value: searchOperator,
            onChange: (value) => onSearchOperatorChange(value as StateSearchOperator),
            options: [
              { value: "contains", label: t("states.search.operators.contains") }, { value: "doesNotContain", label: t("states.search.operators.doesNotContain") },
              { value: "equals", label: t("states.search.operators.equals") }, { value: "doesNotEqual", label: t("states.search.operators.doesNotEqual") },
              { value: "startsWith", label: t("states.search.operators.startsWith") }, { value: "endsWith", label: t("states.search.operators.endsWith") },
            ],
          },
        }}
        toolbarContent={<ResetButton onReset={onReset} fullWidth={false} height={40} />}
        gridOptionsContent={(closeMenu) => <>
          <MenuItem disabled><ListItemText primary={t("states.status.label")} /></MenuItem>
          {(["active", "archived", "all"] as const).map((value) => (
            <MenuItem key={value} selected={status === value} onClick={() => { closeMenu(); onStatusChange(value); }}>
              <ListItemIcon><Radio checked={status === value} size="small" /></ListItemIcon><ListItemText primary={t(`states.status.${value}`)} />
            </MenuItem>
          ))}
          {permissions.canDelete ? <><Divider component="li" /><MenuItem disabled={selectedStateIds.length === 0 || isBulkArchiving} onClick={() => { closeMenu(); onBulkArchive(); }} sx={{ color: "warning.main" }}>
            <ListItemIcon><Archive fontSize="small" /></ListItemIcon><ListItemText primary={t("states.bulkArchiveAction", { count: selectedStateIds.length })} />
          </MenuItem></> : null}
        </>}
        checkboxSelection={permissions.canDelete} autoSelectFirstRow={false} disableRowSelectionExcludeModel
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(model) => onSelectedStateIdsChange([...model.ids].map(Number).filter((id) => Number.isInteger(id) && id > 0))}
        isRowSelectable={({ row }) => permissions.canDelete && !row.isDeleted}
        lastAddedId={lastAddedId} lastEditedId={lastEditedId} lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default StatesDataGrid;

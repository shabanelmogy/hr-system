import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Archive } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import {
  GridApi,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import type {
  CountryListItem,
  CountrySearchField,
  CountrySearchOperator,
  CountrySortColumn,
  CountryStatus,
} from "../../types/Country";
import type { CountryActionPermissions } from "../card-view/CountryCard.types";
import { makeCountryActions } from "./GridActions";
import { useCountryColumns } from "./Columns";

interface CountriesDataGridProps {
  countries: CountryListItem[];
  paginationMode: "client" | "server";
  loading?: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  permissions: CountryActionPermissions;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: CountrySortColumn;
  sortDirection: "ASC" | "DESC";
  searchValue: string;
  searchField: CountrySearchField;
  searchOperator: CountrySearchOperator;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (field: CountrySearchField) => void;
  onSearchOperatorChange: (operator: CountrySearchOperator) => void;
  status: CountryStatus;
  onStatusChange: (value: CountryStatus) => void;
  onReset: () => void;
  selectedCountryIds: number[];
  onSelectedCountryIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving?: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const CountriesDataGrid: React.FC<CountriesDataGridProps> = ({
  countries,
  paginationMode,
  loading = false,
  isFetching = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onRestore,
  permissions,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  page,
  pageSize,
  totalCount,
  sortColumn,
  sortDirection,
  searchValue,
  searchField,
  searchOperator,
  onSearchChange,
  onSearchFieldChange,
  onSearchOperatorChange,
  status,
  onStatusChange,
  onReset,
  selectedCountryIds,
  onSelectedCountryIdsChange,
  onBulkArchive,
  isBulkArchiving = false,
  onPaginationChange,
  onSortChange,
}) => {
  const { t } = useTranslation();

  const getActions = useMemo(
    () => makeCountryActions({ t, permissions, onView, onEdit, onDelete, onRestore }),
    [t, permissions, onView, onEdit, onDelete, onRestore]
  );

  const columns = useCountryColumns({ t, permissions, getActions });
  const rowSelectionModel = useMemo<GridRowSelectionModel>(() => ({
    type: "include",
    ids: new Set(selectedCountryIds),
  }), [selectedCountryIds]);

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={countries}
        columns={columns}
        loading={loading || isFetching}
        apiRef={apiRef}
        filterMode="server"
        sortingMode="server"
        sortModel={[{ field: sortColumn, sort: sortDirection.toLowerCase() as "asc" | "desc" }]}
        onSortModelChange={onSortChange}
        pagination
        paginationMode={paginationMode}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={onPaginationChange}
        rowCount={paginationMode === "server" ? totalCount : undefined}
        pageSizeOptions={[5, 10, 25, 50]}
        showGridOptions
        toolbarSearch={{
          value: searchValue,
          placeholder: t("countries.searchPlaceHolder"),
          onChange: onSearchChange,
          onClear: () => onSearchChange(""),
          column: {
            label: t("countries.search.column"),
            value: searchField,
            onChange: (value) => onSearchFieldChange(value as CountrySearchField),
            options: [
              { value: "all", label: t("countries.search.allColumns") },
              { value: "nameAr", label: t("general.nameAr") },
              { value: "nameEn", label: t("general.nameEn") },
              { value: "alpha2Code", label: t("countries.alpha2Code") },
              { value: "alpha3Code", label: t("countries.alpha3Code") },
              { value: "phoneCode", label: t("countries.phoneCode") },
              { value: "currencyCode", label: t("countries.currencyCode") },
            ],
          },
          operator: {
            label: t("countries.search.condition"),
            value: searchOperator,
            onChange: (value) =>
              onSearchOperatorChange(value as CountrySearchOperator),
            options: [
              { value: "contains", label: t("countries.search.operators.contains") },
              {
                value: "doesNotContain",
                label: t("countries.search.operators.doesNotContain"),
              },
              { value: "equals", label: t("countries.search.operators.equals") },
              {
                value: "doesNotEqual",
                label: t("countries.search.operators.doesNotEqual"),
              },
              {
                value: "startsWith",
                label: t("countries.search.operators.startsWith"),
              },
              { value: "endsWith", label: t("countries.search.operators.endsWith") },
            ],
          },
        }}
        toolbarContent={
          <ResetButton onReset={onReset} fullWidth={false} height={40} />
        }
        gridOptionsContent={(closeMenu) => (
          <>
            <MenuItem disabled>
              <ListItemText primary={t("countries.status.label")} />
            </MenuItem>
            {(["active", "archived", "all"] as const).map((value) => (
              <MenuItem
                key={value}
                selected={status === value}
                onClick={() => {
                  closeMenu();
                  onStatusChange(value);
                }}
              >
                <ListItemIcon>
                  <Radio checked={status === value} size="small" />
                </ListItemIcon>
                <ListItemText primary={t(`countries.status.${value}`)} />
              </MenuItem>
            ))}
            {permissions.canDelete ? (
              <>
                <Divider component="li" />
                <MenuItem
                  disabled={selectedCountryIds.length === 0 || isBulkArchiving}
                  onClick={() => {
                    closeMenu();
                    onBulkArchive();
                  }}
                  sx={{ color: "warning.main" }}
                >
                  <ListItemIcon>
                    <Archive fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("countries.bulkArchiveAction", {
                      count: selectedCountryIds.length,
                    })}
                  />
                </MenuItem>
              </>
            ) : null}
          </>
        )}
        checkboxSelection={permissions.canDelete}
        autoSelectFirstRow={false}
        disableRowSelectionExcludeModel
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(model) => {
          const ids = [...model.ids]
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0);
          onSelectedCountryIdsChange(ids);
        }}
        isRowSelectable={({ row }) => permissions.canDelete && !row.isDeleted}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default CountriesDataGrid;

export type { CountriesDataGridProps };

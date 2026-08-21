import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Archive } from "@mui/icons-material";
import { Button } from "@mui/material";
import {
  GridApi,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import type { CountryListItem, CountrySortColumn, CountryStatus } from "../../types/Country";
import type { CountryActionPermissions } from "../card-view/CountryCard.types";
import { makeCountryActions } from "./GridActions";
import { useCountryColumns } from "./Columns";
import CountryGridFilters from "./CountryGridFilters";

interface CountriesDataGridProps {
  countries: CountryListItem[];
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
  onSearchChange: (value: string) => void;
  status: CountryStatus;
  currencyCode: string;
  hasStates: "all" | "with" | "without";
  onStatusChange: (value: CountryStatus) => void;
  onCurrencyCodeChange: (value: string) => void;
  onHasStatesChange: (value: "all" | "with" | "without") => void;
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
  onSearchChange,
  status,
  currencyCode,
  hasStates,
  onStatusChange,
  onCurrencyCodeChange,
  onHasStatesChange,
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
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={onPaginationChange}
        rowCount={totalCount}
        pageSizeOptions={[5, 10, 25, 50]}
        showGridOptions
        toolbarSearch={{
          value: searchValue,
          placeholder: t("countries.searchPlaceHolder"),
          onChange: onSearchChange,
          onClear: () => onSearchChange(""),
        }}
        toolbarContent={(
          <>
            {permissions.canDelete ? (
              <Button
                color="warning"
                size="small"
                variant="outlined"
                startIcon={<Archive />}
                disabled={selectedCountryIds.length === 0 || isBulkArchiving}
                onClick={onBulkArchive}
              >
                {t("countries.bulkArchiveAction", { count: selectedCountryIds.length })}
              </Button>
            ) : null}
            <CountryGridFilters
              status={status}
              currencyCode={currencyCode}
              hasStates={hasStates}
              onStatusChange={onStatusChange}
              onCurrencyCodeChange={onCurrencyCodeChange}
              onHasStatesChange={onHasStatesChange}
              onReset={onReset}
            />
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
        showNavigationButtons={false}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default CountriesDataGrid;

export type { CountriesDataGridProps };

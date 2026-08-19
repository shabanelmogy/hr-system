import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GridApi, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import { useCountriesPermissions } from "@/shared/hooks/usePermissions";
import type { CountryListItem, CountrySortColumn } from "../../types/Country";
import { makeCountryActions } from "./GridActions";
import { useCountryColumns } from "./Columns";

interface CountriesDataGridProps {
  countries: CountryListItem[];
  loading?: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: CountrySortColumn;
  sortDirection: "ASC" | "DESC";
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
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  page,
  pageSize,
  totalCount,
  sortColumn,
  sortDirection,
  onPaginationChange,
  onSortChange,
}) => {
  const { t } = useTranslation();
  const permissions = useCountriesPermissions();

  const getActions = useMemo(
    () => makeCountryActions({ t, permissions, onView, onEdit, onDelete, onRestore }),
    [t, permissions, onView, onEdit, onDelete, onRestore]
  );

  const columns = useCountryColumns({ t, permissions, getActions });

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

/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GridApi } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/common";
import { useCountriesPermissions } from "@/shared/hooks/usePermissions";
import { Country } from "../../types/Country";
import { makeCountryActions } from "./GridActions";
import { useCountryColumns } from "./Columns";

interface CountriesDataGridProps {
  countries: Country[];
  loading?: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onAdd: () => void;
  onRefresh?: () => void;
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
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}) => {
  const { t } = useTranslation();
  const permissions = useCountriesPermissions();

  const getActions = useCallback(
    makeCountryActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  const columns = useCountryColumns({ t, permissions, getActions });

  const handleAddNew = useCallback(() => {
    if (permissions.canCreate) onAdd();
  }, [onAdd, permissions.canCreate]);

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={countries}
        columns={columns}
        loading={loading || isFetching}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "id", sort: "asc" }]}
        addNewRow={permissions.canCreate ? handleAddNew : undefined}
        pagination
        pageSizeOptions={[5, 10, 25]}
        fileName={t("countries.title")}
        reportPdfHeader={t("countries.title")}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default CountriesDataGrid;

export type { CountriesDataGridProps, Country };

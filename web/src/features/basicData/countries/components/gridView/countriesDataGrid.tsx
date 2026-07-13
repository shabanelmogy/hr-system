/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GridApiCommon } from "@mui/x-data-grid";
import { MyContentsWrapper } from "@/layouts";
import { MyDataGrid } from "@/shared/components";
import { useCountriesPermissions } from "@/shared/hooks/usePermissions";
import { Country } from "../../types/Country";
import { makeCountryActions } from "./gridActions";
import { useCountryColumns } from "./columns";

interface CountriesDataGridProps {
  countries: Country[];
  loading?: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onAdd: () => void;
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
    <MyContentsWrapper>
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
      />
    </MyContentsWrapper>
  );
};

export default CountriesDataGrid;

export type { CountriesDataGridProps, Country };
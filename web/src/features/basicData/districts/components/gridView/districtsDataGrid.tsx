/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { GridApiCommon } from "@mui/x-data-grid";
import { MyContentsWrapper } from "@/layouts";
import { MyDataGrid } from "@/shared/components";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { District } from "../../types/District";
import { makeDistrictActions } from "./gridActions";
import { useDistrictColumns } from "./columns";

// Define interfaces for better type safety
interface DistrictsDataGridProps {
  districts: District[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
  onView: (district: District) => void;
  onAdd: () => void;
}

const DistrictsDataGrid: React.FC<DistrictsDataGridProps> = ({
  districts,
  loading = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { t } = useTranslation();
  // Use generic module permissions for Districts
  const permissions = useModulePermissions("Districts");

  // Actions factory based on permissions and handlers
  const getActions = React.useCallback(
    makeDistrictActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  // Columns factory
  const columns = useDistrictColumns({ permissions, getActions });

  // Enhanced add button with permission check
  const handleAddNew = useCallback(() => {
    if (permissions.canCreate) {
      onAdd();
    }
  }, [onAdd, permissions.canCreate]);

  return (
    <MyContentsWrapper>
      <MyDataGrid
        rows={districts}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "id", sort: "asc" }]}
        addNewRow={permissions.canCreate ? handleAddNew : undefined}
        pagination
        pageSizeOptions={[5, 10, 25]}
        fileName={t("districts.title") || "Districts"}
        reportPdfHeader={t("districts.title") || "Districts"}
      />    </MyContentsWrapper>
  );
};

export default DistrictsDataGrid;

// Export types for use in other components
export type { DistrictsDataGridProps, District };
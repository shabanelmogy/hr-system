/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { GridApi } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import MyDataGrid from "@/shared/components/data-grid/MyDataGrid";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { District } from "../../types/District";
import { makeDistrictActions } from "./GridActions";
import { useDistrictColumns } from "./Columns";

// Define interfaces for better type safety
interface DistrictsDataGridProps {
  districts: District[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
  onView: (district: District) => void;
  onAdd: () => void;
  onRefresh?: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const DistrictsDataGrid: React.FC<DistrictsDataGridProps> = ({
  districts,
  loading = false,
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
    <ContentWrapper>
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
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default DistrictsDataGrid;

// Export types for use in other components
export type { DistrictsDataGridProps, District };

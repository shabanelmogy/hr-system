import React, { useMemo } from "react";
import { GridApi } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
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
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}) => {
  const { t } = useTranslation();
  // Use generic module permissions for Districts
  const permissions = useModulePermissions("Districts");

  // Actions factory based on permissions and handlers
  const getActions = useMemo(
    () => makeDistrictActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  // Columns factory
  const columns = useDistrictColumns({ permissions, getActions });

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={districts}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        initialSortModel={[{ field: "id", sort: "asc" }]}
        pagination
        pageSizeOptions={[5, 10, 25]}
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

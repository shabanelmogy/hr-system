/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { GridApiCommon } from "@mui/x-data-grid";
import { MyContentsWrapper } from "@/layouts";
import { MyDataGrid } from "@/shared/components";
import { useStatesPermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { State } from "../../types/State"
import { makeStateActions } from "./gridActions";
import { useStateColumns } from "./columns";

// Define interfaces for better type safety
interface StatesDataGridProps {
  states: State[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
  onAdd: () => void;
}

const StatesDataGrid: React.FC<StatesDataGridProps> = ({
  states,
  loading = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { t } = useTranslation();
  const permissions = useStatesPermissions();

  // Actions factory based on permissions and handlers
  const getActions = React.useCallback(
    makeStateActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  // Columns factory
  const columns = useStateColumns({ permissions, getActions });

  // Enhanced add button with permission check
  const handleAddNew = useCallback(() => {
    if (permissions.canCreate) {
      onAdd();
    }
  }, [onAdd, permissions.canCreate]);

  return (
    <MyContentsWrapper>
      <MyDataGrid
        rows={states}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "id", sort: "asc" }]}
        addNewRow={permissions.canCreate ? handleAddNew : undefined}
        pagination
        pageSizeOptions={[5, 10, 25]}
        fileName={t("states.title")}
        reportPdfHeader={t("states.title")}
      />
    </MyContentsWrapper>
  );
};

export default StatesDataGrid;

// Export types for use in other components
export type { StatesDataGridProps, State };
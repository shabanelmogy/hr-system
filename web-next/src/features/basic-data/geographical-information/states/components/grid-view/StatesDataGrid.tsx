import React, { useMemo } from "react";
import { GridApi } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import { useStatesPermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { State } from "../../types/State"
import { makeStateActions } from "./GridActions";
import { useStateColumns } from "./Columns";

// Define interfaces for better type safety
interface StatesDataGridProps {
  states: State[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const StatesDataGrid: React.FC<StatesDataGridProps> = ({
  states,
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
  const permissions = useStatesPermissions();

  // Actions factory based on permissions and handlers
  const getActions = useMemo(
    () => makeStateActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  // Columns factory
  const columns = useStateColumns({ permissions, getActions });

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={states}
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
        sx={{
          "& .MuiDataGrid-cell": {
            alignItems: "center",
          },
          "& .MuiDataGrid-cell--textCenter": {
            justifyContent: "center",
          },
          "& .MuiDataGrid-cellContent": {
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiDataGrid-actionsCell": {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      />
    </ContentWrapper>
  );
};

export default StatesDataGrid;

// Export types for use in other components
export type { StatesDataGridProps, State };

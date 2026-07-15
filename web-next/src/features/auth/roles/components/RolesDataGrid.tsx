import { Delete, Edit, Key, Visibility } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import {
  GridActionsCellItem,
  type GridActionsCellItemProps,
  type GridApi,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useCallback, useMemo, type ReactElement, type RefObject } from "react";

import MyDataGrid from "@/shared/components/common/datagrid/MyDataGrid";
import type { Role, Translator } from "../../types";

interface RolesDataGridProps {
  roles: Role[];
  loading: boolean;
  apiRef: RefObject<GridApi | null>;
  onEdit: (row: Role) => void;
  onDelete: (row: Role) => void;
  onView: (row: Role) => void;
  onManagePermissions: (row: Role) => void;
  onAdd: () => void;
  t: Translator;
}

const RolesDataGrid = ({
  roles,
  loading,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onManagePermissions,
  onAdd,
  t,
}: RolesDataGridProps) => {
  // Memoized action buttons
  const getActions = useCallback(
    (params: GridRowParams<Role>): ReactElement<GridActionsCellItemProps>[] => [
      <Tooltip title={t("actions.view")} key={`view-${params.row.id}`} arrow>
        <GridActionsCellItem
          icon={<Visibility sx={{ fontSize: 25, color: "info.main" }} />}
          label={t("actions.view")}
          onClick={() => onView(params.row)}
        />
      </Tooltip>,
      <Tooltip title={t("actions.edit")} key={`edit-${params.row.id}`} arrow>
        <GridActionsCellItem
          icon={<Edit sx={{ fontSize: 25 }} />}
          label={t("actions.edit")}
          color="primary"
          onClick={() => onEdit(params.row)}
        />
      </Tooltip>,
      <Tooltip
        title={t("roles.managePermissions")}
        key={`permissions-${params.row.id}`}
        arrow
      >
        <GridActionsCellItem
          icon={<Key sx={{ fontSize: 25, color: "secondary.main" }} />}
          label={t("roles.managePermissions")}
          onClick={() => onManagePermissions(params.row)}
        />
      </Tooltip>,
      <Tooltip
        title={t("actions.delete")}
        key={`delete-${params.row.id}`}
        arrow
      >
        <GridActionsCellItem
          icon={<Delete sx={{ fontSize: 25, color: "error.main" }} />}
          label={t("actions.delete")}
          onClick={() => onDelete(params.row)}
        />
      </Tooltip>,
    ],
    [t, onEdit, onDelete, onView, onManagePermissions]
  );

  // Memoized columns
  const columns = useMemo<GridColDef<Role>[]>(
    () => [
      {
        field: "id",
        headerName: t("general.id"),
        flex: 1.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "name",
        headerName: t("roles.name"),
        flex: 2,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "isDeleted",
        headerName: t("roles.status"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<Role, boolean>) => (
          <span
            style={{
              color: params.value ? "#d32f2f" : "#2e7d32",
              fontWeight: "bold",
            }}
          >
            {params.value ? t("actions.deleted") : t("actions.active")}
          </span>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: t("actions.buttons"),
        flex: 1.5,
        align: "center",
        headerAlign: "center",
        getActions,
      },
    ],
    [t, getActions]
  );

  return (
    <MyDataGrid
      rows={roles}
      columns={columns}
      loading={loading}
      apiRef={apiRef}
      filterMode="client"
      sortModel={[{ field: "id", sort: "asc" }]}
      addNewRow={onAdd}
      pagination
      pageSizeOptions={[5, 10, 25]}
      fileName={t("roles.name")}
      reportPdfHeader={t("roles.name")}
    />
  );
};

export default RolesDataGrid;

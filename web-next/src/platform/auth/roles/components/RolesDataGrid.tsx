import { Archive, Edit, Key, Restore, Visibility } from "@mui/icons-material";
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

import { MyDataGrid } from "@/shared/components/data-grid";
import type { Role, Translator } from "../../types";

interface RolesDataGridProps {
  roles: Role[];
  loading: boolean;
  apiRef: RefObject<GridApi | null>;
  onEdit: (row: Role) => void;
  onDelete: (row: Role) => void;
  onView: (row: Role) => void;
  onManagePermissions?: (row: Role) => void;
  onRestore: (row: Role) => void | Promise<unknown>;
  onAdd: () => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canEditPermissions: boolean;
  t: Translator;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const RolesDataGrid = ({
  roles,
  loading,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onManagePermissions,
  onRestore,
  onAdd,
  canCreate,
  canEdit,
  canDelete,
  canEditPermissions,
  t,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: RolesDataGridProps) => {
  // Memoized action buttons
  const getActions = useCallback(
    (params: GridRowParams<Role>): ReactElement<GridActionsCellItemProps>[] => {
      const actions: ReactElement<GridActionsCellItemProps>[] = [
        <Tooltip title={t("actions.view")} key={`view-${params.row.id}`} arrow>
          <GridActionsCellItem
            icon={<Visibility sx={{ fontSize: 25, color: "info.main" }} />}
            label={t("actions.view")}
            onClick={() => onView(params.row)}
          />
        </Tooltip>,
      ];

      if (!params.row.isDeleted && onManagePermissions) {
        const permissionLabel = params.row.isSystem || !canEditPermissions
          ? t("roles.viewPermissions")
          : t("roles.managePermissions");
        actions.push(
          <Tooltip title={permissionLabel} key={`permissions-${params.row.id}`} arrow>
            <GridActionsCellItem
              icon={<Key sx={{ fontSize: 25, color: "secondary.main" }} />}
              label={permissionLabel}
              onClick={() => onManagePermissions(params.row)}
            />
          </Tooltip>,
        );
      }

      if (params.row.isSystem) return actions;

      if (!params.row.isDeleted && canEdit) {
        actions.splice(1, 0,
          <Tooltip title={t("actions.edit")} key={`edit-${params.row.id}`} arrow>
            <GridActionsCellItem
              icon={<Edit sx={{ fontSize: 25 }} />}
              label={t("actions.edit")}
              color="primary"
              onClick={() => onEdit(params.row)}
            />
          </Tooltip>,
        );
      }

      if (canDelete) {
        actions.push(params.row.isDeleted ? (
          <Tooltip title={t("actions.restore")} key={`restore-${params.row.id}`} arrow>
            <GridActionsCellItem
              icon={<Restore sx={{ fontSize: 25, color: "success.main" }} />}
              label={t("actions.restore")}
              onClick={() => { void onRestore(params.row); }}
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("actions.archive")} key={`archive-${params.row.id}`} arrow>
            <GridActionsCellItem
              icon={<Archive sx={{ fontSize: 25, color: "warning.main" }} />}
              label={t("actions.archive")}
              onClick={() => onDelete(params.row)}
            />
          </Tooltip>
        ));
      }
      return actions;
    },
    [canDelete, canEdit, canEditPermissions, onDelete, onEdit, onManagePermissions, onRestore, onView, t]
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
      initialSortModel={[{ field: "id", sort: "asc" }]}
      onToolbarAdd={canCreate ? onAdd : undefined}
      pagination
      pageSizeOptions={[5, 10, 25]}
      lastAddedId={lastAddedId}
      lastEditedId={lastEditedId}
      lastDeletedIndex={lastDeletedIndex}
    />
  );
};

export default RolesDataGrid;

import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { State } from "../../types/State";

export interface StatesPermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: StatesPermissionsModel;
  onView: (state: State) => void;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
}

export const makeStateActions = ({ t, permissions, onView, onEdit, onDelete }: ActionFactoryProps) => {
  return (params: { row: State }): React.ReactElement<GridActionsCellItemProps>[] => {
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [];

    if (permissions.canView) {
      actions.push(
        <GridActionsCellItem
          key={`view-${params.row.id}`}
          icon={<Visibility sx={{ fontSize: 25 }} />}
          label={t("actions.view")}
          color="info"
          onClick={() => onView(params.row)}
        />
      );
    }

    if (permissions.canEdit) {
      actions.push(
        <GridActionsCellItem
          key={`edit-${params.row.id}`}
          icon={<Edit sx={{ fontSize: 25 }} />}
          label={t("actions.edit")}
          color="primary"
          onClick={() => onEdit(params.row)}
        />
      );
    }

    if (permissions.canDelete) {
      actions.push(
        <GridActionsCellItem
          key={`delete-${params.row.id}`}
          icon={<Delete sx={{ fontSize: 25 }} />}
          label={t("actions.delete")}
          color="error"
          onClick={() => onDelete(params.row)}
        />
      );
    }

    return actions;
  };
};

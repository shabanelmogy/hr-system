import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { District } from "../../types/District";

export interface DistrictsPermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: DistrictsPermissionsModel;
  onView: (district: District) => void;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
}

export const makeDistrictActions = ({ t, permissions, onView, onEdit, onDelete }: ActionFactoryProps) => {
  return (params: { row: District }): React.ReactElement<GridActionsCellItemProps>[] => {
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
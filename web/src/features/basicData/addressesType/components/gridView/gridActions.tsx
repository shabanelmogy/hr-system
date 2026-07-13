import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { AddressType } from "../../types/AddressType";

export interface AddressTypePermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AddressTypeActionFactoryProps {
  t: (key: string) => string;
  permissions: AddressTypePermissionsModel;
  onView: (item: AddressType) => void;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
}

export const makeAddressTypeActions = ({ t, permissions, onView, onEdit, onDelete }: AddressTypeActionFactoryProps) => {
  return (params: { row: AddressType }): React.ReactElement<GridActionsCellItemProps>[] => {
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

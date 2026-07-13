import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { Country } from "../../types/Country";

export interface CountriesPermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: CountriesPermissionsModel;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export const makeCountryActions = ({ t, permissions, onView, onEdit, onDelete }: ActionFactoryProps) => {
  return (params: { row: Country }): React.ReactElement<GridActionsCellItemProps>[] => {
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
      // If you need extra permission checks (e.g., DeleteCountries), ensure canDelete already reflects that.
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

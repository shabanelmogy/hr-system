import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import type { CountryListItem } from "../../types/Country";

export interface CountriesPermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: CountriesPermissionsModel;
  onView: (country: CountryListItem) => void;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
}

export const makeCountryActions = ({ t, permissions, onView, onEdit, onDelete, onRestore }: ActionFactoryProps) => {
  return (params: { row: CountryListItem }): React.ReactElement<GridActionsCellItemProps>[] => {
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [];

    if (permissions.canView) {
      actions.push(
        <GridActionsCellItem
          key={`view-${params.row.id}`}
          icon={<Visibility sx={{ fontSize: 25, color: "info.main" }} />}
          label={t("actions.view")}
          onClick={() => onView(params.row)}
        />
      );
    }

    if (permissions.canEdit && !params.row.isDeleted) {
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

    if (permissions.canDelete && !params.row.isDeleted) {
      // If you need extra permission checks (e.g., DeleteCountries), ensure canDelete already reflects that.
      actions.push(
        <GridActionsCellItem
          key={`delete-${params.row.id}`}
          icon={<Archive sx={{ fontSize: 25, color: "warning.main" }} />}
          label={t("actions.archive")}
          onClick={() => onDelete(params.row)}
        />
      );
    }

    if (permissions.canRestore && params.row.isDeleted) {
      actions.push(
        <GridActionsCellItem
          key={`restore-${params.row.id}`}
          icon={<Restore sx={{ fontSize: 25, color: "success.main" }} />}
          label={t("actions.restore")}
          onClick={() => onRestore(params.row)}
        />
      );
    }

    return actions;
  };
};

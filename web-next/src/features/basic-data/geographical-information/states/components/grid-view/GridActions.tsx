import React from "react";
import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { GridActionsCellItem, type GridActionsCellItemProps } from "@mui/x-data-grid";
import type { StateListItem } from "../../types/State";
import type { StatePermissionSet } from "../../utils/statePermissions";

interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: StatePermissionSet;
  onView: (state: StateListItem) => void;
  onEdit: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onRestore: (state: StateListItem) => void;
}

export const makeStateActions = ({ t, permissions, onView, onEdit, onDelete, onRestore }: ActionFactoryProps) =>
  (params: { row: StateListItem }): React.ReactElement<GridActionsCellItemProps>[] => {
    const state = params.row;
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [];
    if (permissions.canView) actions.push(<GridActionsCellItem key={`view-${state.id}`} icon={<Visibility sx={{ color: "info.main" }} />} label={t("actions.view")} onClick={() => onView(state)} />);
    if (permissions.canEdit && !state.isDeleted) actions.push(<GridActionsCellItem key={`edit-${state.id}`} icon={<Edit />} label={t("actions.edit")} color="primary" onClick={() => onEdit(state)} />);
    if (permissions.canDelete && !state.isDeleted) actions.push(<GridActionsCellItem key={`archive-${state.id}`} icon={<Archive sx={{ color: "warning.main" }} />} label={t("actions.archive")} onClick={() => onDelete(state)} />);
    if (permissions.canRestore && state.isDeleted) actions.push(<GridActionsCellItem key={`restore-${state.id}`} icon={<Restore sx={{ color: "success.main" }} />} label={t("actions.restore")} onClick={() => onRestore(state)} />);
    return actions;
  };

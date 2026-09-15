import React from "react";
import { useTranslation } from "react-i18next";
import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import type { DistrictListItem } from "../../types/District";
import type { DistrictPermissionSet } from "../../utils/districtPermissions";

interface DistrictCardFooterProps {
  state: DistrictListItem;
  onEdit: (state: DistrictListItem) => void;
  onDelete: (state: DistrictListItem) => void;
  onRestore: (state: DistrictListItem) => void;
  onView: (state: DistrictListItem) => void;
  permissions: DistrictPermissionSet;
}

const DistrictCardFooter: React.FC<DistrictCardFooterProps> = ({ state, onEdit, onDelete, onRestore, onView, permissions }) => {
  const { t } = useTranslation();
  const actions: CardActionItem[] = [];

  if (permissions.canView) {
    actions.push({
      key: "view",
      title: t("actions.view"),
      color: "info",
      icon: <Visibility sx={{ fontSize: 16 }} />,
      onClick: () => onView(state),
    });
  }

  if (permissions.canEdit && !state.isDeleted) {
    actions.push({
      key: "edit",
      title: t("actions.edit"),
      color: "primary",
      icon: <Edit sx={{ fontSize: 16 }} />,
      onClick: () => onEdit(state),
    });
  }

  if (permissions.canDelete && !state.isDeleted) {
    actions.push({
      key: "archive",
      title: t("actions.archive"),
      color: "warning",
      icon: <Archive sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(state),
    });
  }

  if (permissions.canRestore && state.isDeleted) {
    actions.push({
      key: "restore",
      title: t("actions.restore"),
      color: "success",
      icon: <Restore sx={{ fontSize: 16 }} />,
      onClick: () => onRestore(state),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default DistrictCardFooter;

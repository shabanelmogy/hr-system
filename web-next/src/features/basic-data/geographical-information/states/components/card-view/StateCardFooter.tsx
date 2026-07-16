import React from "react";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { useAuthorization } from "@/lib/auth/useAuthorization";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import type { State } from "../../types/State";

const deleteStatePermissions = [permissions.DeleteStates] as const;

interface StateCardFooterProps {
  state: State;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
}

const StateCardFooter: React.FC<StateCardFooterProps> = ({ state, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const { allowed: canDelete } = useAuthorization({ requiredPermissions: deleteStatePermissions });
  const actions: CardActionItem[] = [
    {
      key: "view",
      title: t("actions.view") || "View Details",
      color: "info",
      icon: <Visibility sx={{ fontSize: 16 }} />,
      onClick: () => onView(state),
    },
    {
      key: "edit",
      title: t("actions.edit") || "Edit State",
      color: "primary",
      icon: <Edit sx={{ fontSize: 16 }} />,
      onClick: () => onEdit(state),
    },
  ];

  if (canDelete) {
    actions.push({
      key: "delete",
      title: t("actions.delete") || "Delete State",
      color: "error",
      icon: <Delete sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(state),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default StateCardFooter;

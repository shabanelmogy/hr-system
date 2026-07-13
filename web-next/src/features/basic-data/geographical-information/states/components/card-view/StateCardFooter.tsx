import React from "react";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionsRow } from "@/shared/components/card-view/card-body/UnifiedCardParts";
import type { State } from "../../types/State";

interface StateCardFooterProps {
  state: State;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
}

const StateCardFooter: React.FC<StateCardFooterProps> = ({ state, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  return (
    <CardActionsRow
      actions={[
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
        {
          key: "delete",
          title: t("actions.delete") || "Delete State",
          color: "error",
          icon: <Delete sx={{ fontSize: 16 }} />,
          onClick: () => onDelete(state),
          requiredPermissions: [permissions.DeleteStates],
        },
      ]}
    />
  );
};

export default StateCardFooter;

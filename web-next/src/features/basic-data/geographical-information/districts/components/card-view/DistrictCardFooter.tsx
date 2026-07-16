import React from "react";
import { useTranslation } from "react-i18next";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import { permissions } from "@/lib/auth/permissions";
import { useAuthorization } from "@/lib/auth/useAuthorization";
import type { District } from "../../types/District";

const deleteDistrictPermissions = [permissions.DeleteDistricts] as const;

export interface DistrictCardFooterProps {
  district: District;
  onView: (district: District) => void;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
}

const DistrictCardFooter: React.FC<DistrictCardFooterProps> = ({ district, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { allowed: canDelete } = useAuthorization({ requiredPermissions: deleteDistrictPermissions });
  const actions: CardActionItem[] = [
    {
      key: "view",
      title: t("actions.view") || "View Details",
      color: "info",
      icon: <Visibility sx={{ fontSize: 16 }} />,
      onClick: () => onView(district),
    },
    {
      key: "edit",
      title: t("actions.edit") || "Edit District",
      color: "primary",
      icon: <Edit sx={{ fontSize: 16 }} />,
      onClick: () => onEdit(district),
    },
  ];

  if (canDelete) {
    actions.push({
      key: "delete",
      title: t("actions.delete") || "Delete District",
      color: "error",
      icon: <Delete sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(district),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default DistrictCardFooter;

import React from "react";
import { useTranslation } from "react-i18next";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionsRow } from "@/shared/components/cards/view/card-body/UnifiedCardParts";
import { permissions } from "@/lib/auth/permissions";
import type { District } from "../../types/District";

export interface DistrictCardFooterProps {
  district: District;
  onView: (district: District) => void;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
}

const DistrictCardFooter: React.FC<DistrictCardFooterProps> = ({ district, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <CardActionsRow
      actions={[
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
        {
          key: "delete",
          title: t("actions.delete") || "Delete District",
          color: "error",
          icon: <Delete sx={{ fontSize: 16 }} />,
          onClick: () => onDelete(district),
          requiredPermissions: [permissions.DeleteDistricts],
        },
      ]}
    />
  );
};

export default DistrictCardFooter;

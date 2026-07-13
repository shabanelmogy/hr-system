import React from "react";
import { useTranslation } from "react-i18next";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionsRow } from "@/shared/components/common/cardView/cardBody/UnifiedCardParts";
import { appPermissions } from "@/constants";
import { AddressTypeCardFooterProps } from "./AddressTypeCard.types";

const AddressTypeCardFooter: React.FC<AddressTypeCardFooterProps> = ({ addressType, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <CardActionsRow
      actions={[
        {
          key: "view",
          title: t("actions.view") || "View Details",
          color: "info",
          icon: <Visibility sx={{ fontSize: 16 }} />,
          onClick: () => onView(addressType),
        },
        {
          key: "edit",
          title: t("actions.edit") || "Edit Address Type",
          color: "primary",
          icon: <Edit sx={{ fontSize: 16 }} />,
          onClick: () => onEdit(addressType),
        },
        {
          key: "delete",
          title: t("actions.delete") || "Delete Address Type",
          color: "error",
          icon: <Delete sx={{ fontSize: 16 }} />,
          onClick: () => onDelete(addressType),
          requiredPermissions: [appPermissions.DeleteAddressTypes],
        },
      ]}
    />
  );
};

export default AddressTypeCardFooter;

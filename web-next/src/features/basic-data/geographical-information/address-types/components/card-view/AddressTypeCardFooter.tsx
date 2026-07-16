import React from "react";
import { useTranslation } from "react-i18next";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import { permissions } from "@/lib/auth/permissions";
import { useAuthorization } from "@/lib/auth/useAuthorization";
import { AddressTypeCardFooterProps } from "./AddressTypeCard.types";

const deleteAddressTypePermissions = [permissions.DeleteAddressTypes] as const;

const AddressTypeCardFooter: React.FC<AddressTypeCardFooterProps> = ({ addressType, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { allowed: canDelete } = useAuthorization({
    requiredPermissions: deleteAddressTypePermissions,
  });
  const actions: CardActionItem[] = [
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
  ];

  if (canDelete) {
    actions.push({
      key: "delete",
      title: t("actions.delete") || "Delete Address Type",
      color: "error",
      icon: <Delete sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(addressType),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default AddressTypeCardFooter;

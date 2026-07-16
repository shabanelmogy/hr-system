import React from "react";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import { permissions } from "@/lib/auth/permissions";
import { useAuthorization } from "@/lib/auth/useAuthorization";
import type { Country } from "../../types/Country";

const deleteCountryPermissions = [permissions.DeleteCountries] as const;

export interface CountryCardFooterProps {
  country: Country;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

const CountryCardFooter: React.FC<CountryCardFooterProps> = ({ country, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { allowed: canDelete } = useAuthorization({
    requiredPermissions: deleteCountryPermissions,
  });

  const actions: CardActionItem[] = [
    {
      key: "view",
      title: t("actions.view") || "View Details",
      color: "info",
      icon: <Visibility sx={{ fontSize: 16 }} />,
      onClick: () => onView(country),
    },
    {
      key: "edit",
      title: t("actions.edit") || "Edit Country",
      color: "primary",
      icon: <Edit sx={{ fontSize: 16 }} />,
      onClick: () => onEdit(country),
    },
  ];

  if (canDelete) {
    actions.push({
      key: "delete",
      title: t("actions.delete") || "Delete Country",
      color: "error",
      icon: <Delete sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(country),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default CountryCardFooter;

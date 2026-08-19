import React from "react";
import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import type { CountryListItem } from "../../types/Country";
import type { CountryActionPermissions } from "./CountryCard.types";

export interface CountryCardFooterProps {
  country: CountryListItem;
  onView: (country: CountryListItem) => void;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  permissions: CountryActionPermissions;
}

const CountryCardFooter: React.FC<CountryCardFooterProps> = ({ country, onView, onEdit, onDelete, onRestore, permissions }) => {
  const { t } = useTranslation();
  const actions: CardActionItem[] = [];

  if (permissions.canView) {
    actions.push({
      key: "view",
      title: t("actions.view") || "View Details",
      color: "info",
      icon: <Visibility sx={{ fontSize: 16 }} />,
      onClick: () => onView(country),
    });
  }

  if (permissions.canEdit && !country.isDeleted) {
    actions.push({
      key: "edit",
      title: t("actions.edit") || "Edit Country",
      color: "primary",
      icon: <Edit sx={{ fontSize: 16 }} />,
      onClick: () => onEdit(country),
    });
  }

  if (permissions.canDelete && !country.isDeleted) {
    actions.push({
      key: "delete",
      title: t("actions.archive"),
      color: "warning",
      icon: <Archive sx={{ fontSize: 16 }} />,
      onClick: () => onDelete(country),
    });
  }

  if (permissions.canRestore && country.isDeleted) {
    actions.push({
      key: "restore",
      title: t("actions.restore"),
      color: "success",
      icon: <Restore sx={{ fontSize: 16 }} />,
      onClick: () => onRestore(country),
    });
  }

  return <CardActionButtons actions={actions} />;
};

export default CountryCardFooter;

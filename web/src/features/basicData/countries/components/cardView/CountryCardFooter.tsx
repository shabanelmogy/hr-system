import React from "react";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CardActionsRow } from "@/shared/components/common/cardView/cardBody/UnifiedCardParts";
import { appPermissions } from "@/constants";
import type { Country } from "../../types/Country";

export interface CountryCardFooterProps {
  country: Country;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

const CountryCardFooter: React.FC<CountryCardFooterProps> = ({ country, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <CardActionsRow
      actions={[
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
        {
          key: "delete",
          title: t("actions.delete") || "Delete Country",
          color: "error",
          icon: <Delete sx={{ fontSize: 16 }} />,
          onClick: () => onDelete(country),
          requiredPermissions: [appPermissions.DeleteCountries],
        },
      ]}
    />
  );
};

export default CountryCardFooter;

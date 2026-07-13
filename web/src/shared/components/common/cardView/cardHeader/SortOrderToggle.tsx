import React from "react";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export interface SortOrderToggleProps {
  sortOrder: "asc" | "desc";
  onChange: (value: "asc" | "desc") => void;
}

export const SortOrderToggle: React.FC<SortOrderToggleProps> = ({
  sortOrder,
  onChange,
}) => {
  const { t } = useTranslation();
  const ascTitle = t("general.ascending", { defaultValue: "Ascending" });
  const descTitle = t("general.descending", { defaultValue: "Descending" });

  return (
    <ToggleButtonGroup
      value={sortOrder}
      exclusive
      onChange={(event, value) => {
        void event;
        if (value) onChange(value);
      }}
      size="small"
      fullWidth
    >
      <Tooltip title={ascTitle}>
        <ToggleButton value="asc">
          <TrendingUp />
        </ToggleButton>
      </Tooltip>
      <Tooltip title={descTitle}>
        <ToggleButton value="desc">
          <TrendingUp sx={{ transform: "rotate(180deg)" }} />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SortOption } from "./UnifiedCardViewHeader";

export interface SortBySelectProps {
  sortBy: string;
  options: SortOption[];
  onChange: (value: string) => void;
}

export const SortBySelect: React.FC<SortBySelectProps> = ({ sortBy, options, onChange }) => {
  const { t } = useTranslation();
  const label = t("general.sortBy", { defaultValue: "Sort By" });

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select value={sortBy} label={label} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

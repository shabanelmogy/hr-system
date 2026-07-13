import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { FilterOption } from "./UnifiedCardViewHeader";

export interface FilterSelectProps {
  filterBy: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ filterBy, options, onChange }) => {
  const { t } = useTranslation();
  const label = t("general.filter", { defaultValue: "Filter By" });

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select value={filterBy} label={label} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

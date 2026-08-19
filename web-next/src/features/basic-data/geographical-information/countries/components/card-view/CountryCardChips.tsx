import React from "react";
import { Stack } from "@mui/material";
import { AppChip } from "@/shared/components/cards";
import { useTranslation } from "react-i18next";
import type { CountryListItem } from "../../types/Country";

interface CountryCardChipsProps {
  country: CountryListItem;
}

const CountryCardChips: React.FC<CountryCardChipsProps> = ({ country }) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      {country.alpha2Code && (
        <AppChip label={country.alpha2Code} colorKey="primary" variant="soft" monospace bold />
      )}
      {country.alpha3Code && (
        <AppChip label={country.alpha3Code} colorKey="secondary" variant="soft" monospace bold />
      )}
      <AppChip label={`${t("general.id")}: ${country.id}`} colorKey="secondary" variant="outlined" monospace sx={{ fontSize: "0.7rem" }} />
      {country.isDeleted && (
        <AppChip label={t("countries.status.archived")} colorKey="error" variant="soft" bold />
      )}
    </Stack>
  );
};

export default CountryCardChips;

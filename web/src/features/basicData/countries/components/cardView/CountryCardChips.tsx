import React from "react";
import { Stack } from "@mui/material";
import { AppChip } from "@/shared/components";
import type { Country } from "../../types/Country";

interface CountryCardChipsProps {
  country: Country;
}

const CountryCardChips: React.FC<CountryCardChipsProps> = ({ country }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      {country.alpha2Code && (
        <AppChip label={country.alpha2Code} colorKey="primary" variant="soft" monospace bold />
      )}
      {country.alpha3Code && (
        <AppChip label={country.alpha3Code} colorKey="secondary" variant="soft" monospace bold />
      )}
      <AppChip label={`ID: ${country.id}`} colorKey="secondary" variant="outlined" monospace sx={{ fontSize: "0.7rem" }} />
    </Stack>
  );
};

export default CountryCardChips;

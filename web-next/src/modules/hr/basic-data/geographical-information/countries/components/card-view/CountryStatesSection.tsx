import { AppChip } from "@/shared/components/cards";
import { LocationOn } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CountryStatesSectionProps {
  statesCount: number;
}

const CountryStatesSection = ({ statesCount }: CountryStatesSectionProps) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
      <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {t("countries.states")}
      </Typography>
      <AppChip
        label={String(statesCount)}
        colorKey={statesCount > 0 ? "success" : "secondary"}
        variant="outlined"
      />
    </Stack>
  );
};

export default CountryStatesSection;

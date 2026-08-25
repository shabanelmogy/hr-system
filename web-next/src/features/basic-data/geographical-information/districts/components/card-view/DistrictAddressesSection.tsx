import { AppChip } from "@/shared/components/cards";
import { LocationOn } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface DistrictAddressesSectionProps {
  addressesCount: number;
}

const DistrictAddressesSection = ({ addressesCount }: DistrictAddressesSectionProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
      <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {t("districts.addresses")}
      </Typography>
      <AppChip
        label={String(addressesCount)}
        colorKey={addressesCount > 0 ? "success" : "secondary"}
        variant="outlined"
      />
    </Stack>
  );
};

export default DistrictAddressesSection;

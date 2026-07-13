import React from "react";
import { Box } from "@mui/system";
import { AttachMoney, Phone } from "@mui/icons-material";
import { InfoIconText } from "@/shared/components/common/cardView/cardBody/UnifiedCardParts";

export interface CountryDetailsProps {
  phoneCode?: string | null;
  currencyCode?: string | null;
}

export const CountryDetails: React.FC<CountryDetailsProps> = ({ phoneCode, currencyCode }) => {
  if (!phoneCode && !currencyCode) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {phoneCode && (
        <InfoIconText
          icon={<Phone sx={{ fontSize: 16, color: "text.secondary" }} />}
          primary={`+${phoneCode}`}
          mb={1}
        />
      )}
      {currencyCode && (
        <InfoIconText
          icon={<AttachMoney sx={{ fontSize: 16, color: "text.secondary" }} />}
          primary={currencyCode}
          mb={1}
        />
      )}
    </Box>
  );
};

export default CountryDetails;

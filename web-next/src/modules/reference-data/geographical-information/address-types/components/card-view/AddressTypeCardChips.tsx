import React from "react";
import { Stack } from "@mui/material";
import { AppChip } from "@/shared/components/cards";
import { AddressTypeCardChipsProps } from "./AddressTypeCard.types";
import { useTranslation } from "react-i18next";


const AddressTypeCardChips: React.FC<AddressTypeCardChipsProps> = ({ addressType }) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      <AppChip label={t("common.idValue", { id: addressType.id })} colorKey="secondary" variant="outlined" monospace sx={{ fontSize: "0.7rem" }} />
    </Stack>
  );
};

export default AddressTypeCardChips;

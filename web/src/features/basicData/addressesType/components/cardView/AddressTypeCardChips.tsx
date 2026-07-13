import React from "react";
import { Stack } from "@mui/material";
import { AppChip } from "@/shared/components";
import { AddressTypeCardChipsProps } from "./AddressTypeCard.types";


const AddressTypeCardChips: React.FC<AddressTypeCardChipsProps> = ({ addressType }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      <AppChip label={`ID: ${addressType.id}`} colorKey="secondary" variant="outlined" monospace sx={{ fontSize: "0.7rem" }} />
    </Stack>
  );
};

export default AddressTypeCardChips;
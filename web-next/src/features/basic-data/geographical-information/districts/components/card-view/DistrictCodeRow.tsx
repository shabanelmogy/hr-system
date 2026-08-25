import React from "react";
import { Stack, Typography } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

export interface DistrictCodeRowProps {
  label: string; // e.g., t("districts.code")
  code?: string | null;
}

export const DistrictCodeRow: React.FC<DistrictCodeRowProps> = ({ label, code }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
    <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
    <Typography variant="body2" sx={{
      color: "text.secondary"
    }}>
      {label}: {code || "N/A"}
    </Typography>
  </Stack>
);

export default DistrictCodeRow;

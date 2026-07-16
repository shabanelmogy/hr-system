import React from "react";
import { Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";

// InfoIconText: generic icon + text rows (with optional secondary line)
export const InfoIconText: React.FC<{
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  mb?: number;
}> = ({ icon, primary, secondary, mb = 1 }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb }}>
    {icon}
    <Box>
      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
        {primary}
      </Typography>
      {secondary && (
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          {secondary}
        </Typography>
      )}
    </Box>
  </Stack>
);

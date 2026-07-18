"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function RouteLoading() {
  const { t } = useTranslation();

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: "grid", minHeight: "40vh", placeItems: "center" }}
    >
      <Box sx={{ display: "grid", justifyItems: "center", gap: 1.5 }}>
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary">
          {t("general.loading")}
        </Typography>
      </Box>
    </Box>
  );
}

export default RouteLoading;

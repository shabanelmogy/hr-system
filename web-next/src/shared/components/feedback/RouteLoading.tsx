"use client";

import { Box, CircularProgress } from "@mui/material";

export default function RouteLoading() {
  return (
    <Box
      role="status"
      aria-label="Loading"
      sx={{ display: "grid", minHeight: "40vh", placeItems: "center" }}
    >
      <CircularProgress size={36} />
    </Box>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

const CountryActiveReportsDesignerClient = dynamic(
  () => import("./CountryActiveReportsDesignerClient"),
  {
    ssr: false,
    loading: () => (
      <Box
        aria-busy="true"
        aria-live="polite"
        sx={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          minHeight: 640,
        }}
      >
        <CircularProgress />
      </Box>
    ),
  },
);

/**
 * ActiveReportsJS touches browser APIs during initialization, so it must remain
 * client-only. Keeping the boundary here preserves the SSR-safe Countries page.
 */
const CountryActiveReportsDesigner = () => <CountryActiveReportsDesignerClient />;

export default CountryActiveReportsDesigner;

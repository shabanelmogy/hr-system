"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import type { ServerReportDesignerProps } from "./ServerReportDesignerClient";

const ServerReportDesignerClient = dynamic(
  () => import("./ServerReportDesignerClient"),
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
 * Client-only boundary for ActiveReportsJS. The generic implementation owns
 * template persistence while each domain supplies only its approved source.
 */
const ServerReportDesigner = (props: ServerReportDesignerProps) => (
  <ServerReportDesignerClient {...props} />
);

export default ServerReportDesigner;

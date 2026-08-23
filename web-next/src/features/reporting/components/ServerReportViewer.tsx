"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import type { ServerReportViewerProps } from "./ServerReportViewerClient";

const ServerReportViewerClient = dynamic(
  () => import("./ServerReportViewerClient"),
  {
    ssr: false,
    loading: () => (
      <Box aria-busy="true" sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center", minHeight: 640 }}>
        <CircularProgress />
      </Box>
    ),
  },
);

/** Client-only renderer for published, tenant-scoped ActiveReports templates. */
const ServerReportViewer = (props: ServerReportViewerProps) => (
  <ServerReportViewerClient {...props} />
);

export default ServerReportViewer;

"use client";

import type { DataGridProps } from "@mui/x-data-grid";
import dynamic from "next/dynamic";

const ClientDataGrid = dynamic<DataGridProps>(
  () => import("@mui/x-data-grid").then((module) => module.DataGrid),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: 360 }} aria-hidden="true" />,
  },
);

export default ClientDataGrid;

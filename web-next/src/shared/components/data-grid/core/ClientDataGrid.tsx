"use client";

import type { DataGridProps, GridValidRowModel } from "@mui/x-data-grid";
import dynamic from "next/dynamic";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

interface DynamicDataGridComponent {
  <TRow extends GridValidRowModel>(props: DataGridProps<TRow>): JSX.Element;
}

const DynamicDataGrid = dynamic(
  () => import("@mui/x-data-grid").then((module) => module.DataGrid),
  {
    ssr: false,
    loading: DataGridLoadingFallback,
  },
) as DynamicDataGridComponent;

function DataGridLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("general.loading")}
      style={{ minHeight: 360 }}
    />
  );
}

export default function ClientDataGrid<TRow extends GridValidRowModel>(
  props: DataGridProps<TRow>,
) {
  return <DynamicDataGrid {...props} />;
}

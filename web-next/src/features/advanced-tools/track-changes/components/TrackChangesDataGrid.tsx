"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { MyDataGrid } from "@/shared/components/data-grid";
import { DAYJS_DATE_FORMAT } from "@/shared/utils/dateFormats";
import type { TrackChangeLog } from "../types/trackChange";

interface TrackChangesDataGridProps {
  loading: boolean;
  rows: TrackChangeLog[];
}

export default function TrackChangesDataGrid({
  loading,
  rows,
}: TrackChangesDataGridProps) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<TrackChangeLog>[]>(
    () => [
      {
        field: "changeLogId",
        headerName: t("trackChanges.changeLogId"),
        flex: 0.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "entityName",
        headerName: t("trackChanges.entityName"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "key",
        headerName: t("trackChanges.key"),
        flex: 1.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "oldValue",
        headerName: t("trackChanges.oldValue"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "newValue",
        headerName: t("trackChanges.newValue"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "changedBy",
        headerName: t("trackChanges.changedBy"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "changedAt",
        headerName: t("trackChanges.changedAt"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        valueFormatter: (value: unknown) =>
          dayjs(String(value)).format(DAYJS_DATE_FORMAT),
      },
      {
        field: "changedByPc",
        headerName: t("trackChanges.changedByPc"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
    ],
    [t],
  );

  return (
    <MyDataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      filterMode="client"
      initialSortModel={[{ field: "changeLogId", sort: "asc" }]}
      pagination
      pageSizeOptions={[5, 10, 25]}
    />
  );
}

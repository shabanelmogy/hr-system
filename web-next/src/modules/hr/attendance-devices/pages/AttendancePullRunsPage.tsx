"use client";
import { useMemo } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { PageHeader } from "@/shared/components/navigation/header";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { usePullRuns } from "../hooks/useAttendanceDeviceQueries";
import type { DevicePullRun } from "../types/attendanceDevices";
import { AttendanceModuleLayout } from "../components/AttendanceModuleLayout";
import { RawGrid } from "../components/RawGrid";
import { useTranslation } from "react-i18next";

export default function AttendancePullRunsPage() {
  const { t } = useTranslation();
  const list = useServerListState<"startedAtUtc" | "finishedAtUtc" | "status", Record<string, never>>({ defaultColumn: "startedAtUtc", defaultSortDirection: "DESC", defaultFilters: {}, defaultPageSize: 10 });
  const query = useMemo(() => ({ pageNumber: list.state.page + 1, pageSize: list.state.pageSize, sortBy: list.state.columnName, sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc" }), [list.state]);
  const result = usePullRuns(query);
  const columns: GridColDef<DevicePullRun>[] = [{ field: "deviceId", headerName: "Device ID", width: 100, sortable: false }, { field: "operationType", headerName: "Operation", width: 125, sortable: false }, { field: "status", headerName: "Status", width: 130 }, { field: "startedAtUtc", headerName: "Started", minWidth: 180, flex: 1, valueFormatter: (value) => value ? new Date(value).toLocaleString() : "" }, { field: "finishedAtUtc", headerName: "Finished", minWidth: 180, flex: 1, valueFormatter: (value) => value ? new Date(value).toLocaleString() : "" }, { field: "readCount", headerName: "Read", width: 85, sortable: false }, { field: "insertedCount", headerName: "Inserted", width: 95, sortable: false }, { field: "duplicateCount", headerName: "Duplicates", width: 105, sortable: false }, { field: "skippedCount", headerName: "Skipped", width: 90, sortable: false }, { field: "errorCount", headerName: "Errors", width: 85, sortable: false }, { field: "error", headerName: "Error", minWidth: 180, flex: 1, sortable: false }];
  return <AttendanceModuleLayout><Box sx={{ minHeight: 0, display: "flex", flexDirection: "column", flex: 1, gap: 2 }}><PageHeader title={t("attendanceDevices.devicePullRuns")} subTitle={t("attendanceDevices.pullRunsSubtitle")} /><RawGrid rows={result.data?.items ?? []} columns={columns} total={result.data?.metaData.totalCount ?? 0} page={list.state.page} pageSize={list.state.pageSize} loading={result.isLoading} fetching={result.isFetching} error={result.error} onRetry={() => void result.refetch()} onPaginationChange={(model) => { list.setPage(model.page); list.setPageSize(model.pageSize); }} sortModel={[{ field: list.state.columnName, sort: list.state.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortChange={(model) => { const next = model[0]; if (next?.sort) list.setSort(next.field as "startedAtUtc" | "finishedAtUtc" | "status", next.sort.toUpperCase() as "ASC" | "DESC"); }} onReset={list.reset} /></Box></AttendanceModuleLayout>;
}

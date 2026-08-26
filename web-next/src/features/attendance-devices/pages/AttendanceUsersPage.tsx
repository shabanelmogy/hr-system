"use client";
import { useMemo } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { PageHeader } from "@/shared/components/navigation/header";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { useRawUsers } from "../hooks/useAttendanceDeviceQueries";
import type { RawDeviceUser } from "../types/attendanceDevices";
import { AttendanceModuleLayout } from "../components/AttendanceModuleLayout";
import { RawGrid } from "../components/RawGrid";

export default function AttendanceUsersPage() {
  const list = useServerListState<"externalCode" | "name" | "pulledAtUtc", Record<string, never>>({ defaultColumn: "externalCode", defaultFilters: {}, defaultPageSize: 10 });
  const query = useMemo(() => ({ pageNumber: list.state.page + 1, pageSize: list.state.pageSize, search: list.debouncedSearchValue || undefined, sortBy: list.state.columnName, sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc" }), [list.debouncedSearchValue, list.state]);
  const result = useRawUsers(query);
  const columns: GridColDef<RawDeviceUser>[] = [{ field: "externalCode", headerName: "External code", flex: 1, minWidth: 140 }, { field: "name", headerName: "Name", flex: 1, minWidth: 150 }, { field: "deviceName", headerName: "Device", flex: 1, minWidth: 150, sortable: false }, { field: "safeRawPayload", headerName: "Raw fields", flex: 1, minWidth: 180, sortable: false }, { field: "pulledAtUtc", headerName: "Pulled", minWidth: 180, valueFormatter: (value) => value ? new Date(value).toLocaleString() : "" }];
  return <AttendanceModuleLayout><Box sx={{ minHeight: 0, display: "flex", flexDirection: "column", flex: 1, gap: 2 }}><PageHeader title="Raw device users" subTitle="Provider data only; no employee matching is performed." /><RawGrid rows={result.data?.items ?? []} columns={columns} total={result.data?.metaData.totalCount ?? 0} page={list.state.page} pageSize={list.state.pageSize} loading={result.isLoading} fetching={result.isFetching} error={result.error} onRetry={() => void result.refetch()} onPaginationChange={(model) => { list.setPage(model.page); list.setPageSize(model.pageSize); }} sortModel={[{ field: list.state.columnName, sort: list.state.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortChange={(model) => { const next = model[0]; if (next?.sort) list.setSort(next.field as "externalCode" | "name" | "pulledAtUtc", next.sort.toUpperCase() as "ASC" | "DESC"); }} searchValue={list.state.searchValue} searchPlaceholder="Search external code or name" onSearchChange={list.setSearchValue} onReset={list.reset} /></Box></AttendanceModuleLayout>;
}

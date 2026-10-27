"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { appRoutes } from "@/config/routes";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { MyDateTimeField, MySelect, MyTextField } from "@/shared/components/forms";
import { MyDataGrid } from "@/shared/components/data-grid";
import { EntityCard } from "@/shared/components/cards";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { CardViewHeader, CardViewPagination } from "@/shared/components/lists/card-view";
import { FeedbackState } from "@/shared/components/feedback/states";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { useSession } from "@/lib/auth/SessionContext";
import { exportErrorLogs } from "../services/errorLogService";
import { useErrorLogList } from "../hooks/useErrorLogs";
import type { ErrorLogCriteria, ErrorLogRow, ErrorLogScope, ErrorLogSource } from "../types/errorLogs";

const ErrorLogDetailDialog = dynamic(() => import("../components/ErrorLogDetailDialog").then((module) => module.ErrorLogDetailDialog));
type Filters = { from: string; to: string; userName: string; source: "" | ErrorLogSource; statusCode: string };
const emptyFilters: Filters = { from: "", to: "", userName: "", source: "", statusCode: "" };
const pageSizes = [10, 25, 50, 100];

export default function ErrorLogsPage({ scope }: { scope: ErrorLogScope }) {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const { hasPermission } = usePermissions();
  const list = useServerListState<"occurredOnUtc", Filters>({ defaultColumn: "occurredOnUtc", defaultSortDirection: "DESC", defaultFilters: emptyFilters, defaultPageSize: 25 });
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<ErrorLogRow | null>(null);
  const [exportState, setExportState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const isSystem = scope === "system";
  const superAdmin = user?.roles.some((role) => role.toLowerCase() === "super_admin") ?? false;
  const canDetail = isSystem ? superAdmin && hasPermission(permissions.ViewSystemErrorLogDetails) : !superAdmin && hasPermission(permissions.ViewErrorLogDetails);
  const canExport = isSystem ? superAdmin && hasPermission(permissions.ExportSystemErrorLogs) : !superAdmin && hasPermission(permissions.ExportErrorLogs);
  const canSettings = isSystem && superAdmin && hasPermission(permissions.ViewErrorLogSettings);
  const filters = list.state.filters;
  const criteria = useMemo<ErrorLogCriteria>(() => ({
    ...(filters.from ? { fromUtc: `${filters.from}T00:00:00.000Z` } : {}),
    ...(filters.to ? { toUtc: `${filters.to}T23:59:59.999Z` } : {}),
    ...(filters.userName.trim() ? { userName: filters.userName.trim() } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.statusCode ? { statusCode: Number(filters.statusCode) } : {}),
    ...(list.debouncedSearchValue ? { search: list.debouncedSearchValue } : {}),
    page: list.state.page + 1,
    pageSize: list.state.pageSize,
  }), [filters, list.debouncedSearchValue, list.state.page, list.state.pageSize]);
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const query = useErrorLogList(scope, criteria, !invalidRange);
  const rows = query.data?.items ?? [];
  const total = query.data?.totalCount ?? 0;
  const patchFilters = (patch: Partial<Filters>) => list.setFilters({ ...filters, ...patch });

  const download = async () => {
    if (!canExport || invalidRange || exportState === "pending") return;
    setExportState("pending");
    try {
      const result = await exportErrorLogs(scope, criteria);
      const href = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = result.fileName ?? "error-logs.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      setExportState("success");
    } catch { setExportState("error"); }
  };

  const columns = useMemo<GridColDef<ErrorLogRow>[]>(() => [
    { field: "occurredOnUtc", headerName: t("errorLogs.occurred"), flex: 1, minWidth: 175, sortable: false, valueFormatter: (value: string) => new Date(value).toLocaleString(i18n.language) },
    { field: "source", headerName: t("errorLogs.source"), minWidth: 95, flex: 0.5, sortable: false, valueFormatter: (value: ErrorLogSource) => t(`errorLogs.sources.${value}`) },
    { field: "severity", headerName: t("errorLogs.severity"), minWidth: 110, flex: 0.5, sortable: false, renderCell: ({ row }) => <Chip size="small" color={row.severity === "error" ? "error" : "warning"} label={t(`errorLogs.severities.${row.severity}`)} /> },
    { field: "userName", headerName: t("errorLogs.user"), minWidth: 115, flex: 0.6, sortable: false },
    { field: "service", headerName: t("errorLogs.service"), minWidth: 125, flex: 0.6, sortable: false },
    { field: "action", headerName: t("errorLogs.action"), minWidth: 115, flex: 0.6, sortable: false },
    { field: "statusCode", headerName: t("errorLogs.status"), minWidth: 90, sortable: false },
    { field: "durationMs", headerName: t("errorLogs.duration"), minWidth: 115, sortable: false },
    { field: "client", headerName: t("errorLogs.client"), minWidth: 100, sortable: false },
    { field: "browser", headerName: t("errorLogs.browser"), minWidth: 110, sortable: false },
    { field: "summary", headerName: t("errorLogs.summary"), minWidth: 150, flex: 1, sortable: false },
    ...(isSystem ? [{ field: "ipAddress", headerName: t("errorLogs.ipAddress"), minWidth: 130, sortable: false } as GridColDef<ErrorLogRow>] : []),
    { field: "details", headerName: t("errorLogs.details"), minWidth: 105, sortable: false, filterable: false, renderCell: ({ row }) => canDetail ? <Button size="small" onClick={() => setSelected(row)}>{t("errorLogs.view")}</Button> : null },
  ], [canDetail, i18n.language, isSystem, t]);

  const filterControls = <>

      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MyDateTimeField fieldName="fromUtc" mode="date" label={t("errorLogs.fromUtc")}
        value={filters.from} onChange={(from) => patchFilters({ from })} /></Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MyDateTimeField fieldName="toUtc" mode="date" label={t("errorLogs.toUtc")}
        value={filters.to} onChange={(to) => patchFilters({ to })} error={invalidRange} helperText={invalidRange ? t("errorLogs.invalidRange") : undefined} /></Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MyTextField fieldName="userName" label={t("errorLogs.user")} value={filters.userName}
        onChange={(event) => patchFilters({ userName: event.target.value })} maxLength={100} showCounter={false} size="small" margin="none" appearance="plain" /></Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
      <MySelect all={false} size="small" selectedItem={filters.source} handleSelectionChange={(event) => patchFilters({ source: String(event.target.value ?? "") as Filters["source"] })}
        dataSource={[{ value: "", label: t("errorLogs.all") }, ...(["api", "job", "web", "mobile"] as const).map((source) => ({ value: source, label: t(`errorLogs.sources.${source}`) }))]}
        valueMember="value" displayMember="label" label={t("errorLogs.source")} showClearButton={false} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
      <MySelect all={false} size="small" selectedItem={filters.statusCode} handleSelectionChange={(event) => patchFilters({ statusCode: String(event.target.value ?? "") })}
        dataSource={[{ value: "", label: t("errorLogs.all") }, ...[400, 401, 403, 404, 409, 413, 422, 429, 500, 502, 503, 504].map((code) => ({ value: String(code), label: String(code) }))]}
        valueMember="value" displayMember="label" label={t("errorLogs.status")} showClearButton={false} />
      </Grid>

  </>;

  if (!query.allowed) return <FeedbackState icon={<ErrorOutlineIcon />} title={t("errorLogs.forbidden")} />;
  const settingsAction = canSettings ? <Button component={Link} href={appRoutes.platform.settings} size="small">{t("errorLogSettings.title")}</Button> : null;
  return <ContentWrapper fillAvailable>
    <PageHeader variant="multi-view" title={t(isSystem ? "systemErrorLogs.title" : "errorLogs.title")}
      storageKey={`error-logs-${scope}-view`} availableViews={["grid", "cards"]} defaultView="grid" dataCount={total}
      onViewTypeChange={(next) => { if (next === "grid" || next === "cards") setView(next); }}
      onRefresh={() => void query.refetch()} onFilter={() => setShowFilters((visible) => !visible)} isFilterBarVisible={showFilters}
      showActions={{ add: false, refresh: true, filter: true, export: canExport }}
      exportOptions={canExport ? [{ id: "error-logs-xlsx", label: t("errorLogs.export"), format: "excel", onSelect: download,
        disabled: invalidRange || exportState === "pending", loading: exportState === "pending" }] : []} />
    {showFilters && view === "cards" ? <Box sx={{ flexShrink: 0, maxHeight: { xs: "45dvh", md: "none" }, overflowY: "auto" }}>
      <CardViewHeader title={t("errorLogs.filters")} mainChipLabel={String(total)} page={list.state.page} showTitleSection={false} compact
        showSort={false} showFilter={false}
        searchTerm={list.state.searchValue} searchPlaceholder={t("errorLogs.search")} onSearchChange={list.setSearchValue}
        onClearSearch={() => list.setSearchValue("")} onReset={list.reset}
        additionalControls={settingsAction ? <Grid size="auto">{settingsAction}</Grid> : undefined}
        filterControls={filterControls} />
    </Box> : null}
    {invalidRange ? <Alert severity="error">{t("errorLogs.invalidRange")}</Alert> : null}
    {exportState === "error" ? <Alert severity="error" onClose={() => setExportState("idle")}>{t("errorLogs.exportFailed")}</Alert> : null}
    {exportState === "success" ? <Alert severity="success" onClose={() => setExportState("idle")}>{t("errorLogs.exported")}</Alert> : null}
    {view === "grid" ? <Box sx={{ minHeight: 0, flex: 1, minWidth: 0 }}>
      <MyDataGrid rows={invalidRange || query.isError ? [] : rows} columns={columns}
        loading={!invalidRange && !query.isError && (query.isFetching || list.isSearchPending)} getRowId={(row) => row.id}
        filterMode="server" sortingMode="server" sortModel={[{ field: "occurredOnUtc", sort: "desc" }]}
        pagination paginationMode="server" rowCount={invalidRange || query.isError ? 0 : total}
        paginationModel={{ page: list.state.page, pageSize: list.state.pageSize }}
        onPaginationModelChange={(model: GridPaginationModel) => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)}
        pageSizeOptions={pageSizes} disableColumnFilter disableRowSelectionOnClick checkboxSelection={false}
        showToolbar={showFilters} showGridOptions autoSelectFirstRow={false}
        toolbarSearch={{ value: list.state.searchValue, onChange: list.setSearchValue,
          onClear: () => list.setSearchValue(""), placeholder: t("errorLogs.search") }}
        toolbarContent={<><ResetButton onReset={list.reset} fullWidth={false} height={40} />{settingsAction}</>}
        toolbarFilters={filterControls}
        emptyContent={<FeedbackState icon={<ErrorOutlineIcon />} role={query.isError || invalidRange ? "alert" : "status"}
          title={t(invalidRange ? "errorLogs.invalidRange" : query.isError ? "errorLogs.loadFailed" : "errorLogs.empty")}
          actions={query.isError ? <Button onClick={() => void query.refetch()}>{t("errorLogs.retry")}</Button> : undefined} />}
        sx={{ height: "100%", minHeight: 240 }} />
    </Box> : invalidRange ? null : query.isError ? <FeedbackState icon={<ErrorOutlineIcon />} title={t("errorLogs.loadFailed")} role="alert" actions={<Button onClick={() => void query.refetch()}>{t("errorLogs.retry")}</Button>} />
      : !query.isPending && rows.length === 0 ? <FeedbackState icon={<ErrorOutlineIcon />} title={t("errorLogs.empty")} /> : <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, flex: 1, overflow: "hidden" }}>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", p: 1, scrollbarGutter: "stable" }}>
            <Grid container spacing={2}>
              {rows.map((row, index) => <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={row.id}>
              <EntityCard index={index} height="auto" title={row.summary} subtitle={new Date(row.occurredOnUtc).toLocaleString(i18n.language)}
                endBadge={<Chip size="small" color={row.severity === "error" ? "error" : "warning"} label={t(`errorLogs.severities.${row.severity}`)} />}
                content={<Stack spacing={0.5}><Typography>{t(`errorLogs.sources.${row.source}`)} · {row.service ?? t("errorLogs.notAvailable")}</Typography><Typography>{row.action ?? ""} · {row.statusCode ?? ""}</Typography><Typography>{row.userName ?? t("errorLogs.notAvailable")}</Typography><Typography>{t("errorLogs.duration")}: {row.durationMs ?? t("errorLogs.notAvailable")}</Typography><Typography>{t("errorLogs.client")}: {row.client ?? t("errorLogs.notAvailable")}</Typography><Typography>{t("errorLogs.browser")}: {row.browser ?? t("errorLogs.notAvailable")}</Typography></Stack>}
                footer={canDetail ? <Button onClick={() => setSelected(row)}>{t("errorLogs.view")}</Button> : null} />
              </Grid>)}
            </Grid>
          </Box>
          <CardViewPagination page={list.state.page} rowsPerPage={list.state.pageSize} totalItems={total} itemsPerPageOptions={pageSizes}
            onPageChange={list.setPage} onRowsPerPageChange={list.setPageSize} pinned />
        </Box>}
    {selected && canDetail ? <ErrorLogDetailDialog row={selected} scope={scope} onClose={() => setSelected(null)} /> : null}
  </ContentWrapper>;
}

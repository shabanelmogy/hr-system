"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { MyDataGrid } from "@/shared/components/data-grid";
import { MyDateTimeField, MySelect, MyTextField } from "@/shared/components/forms";
import { CardViewHeader, CardViewPagination, ResetButton } from "@/shared/components/lists/card-view";
import { EntityCard } from "@/shared/components/cards";
import { FeedbackState } from "@/shared/components/feedback/states";
import { useMessageLogsController } from "../hooks/useMessageLogsController";
import { messageStatuses, messageTemplates, type MessageLogRow } from "../types/messageLogs";
import { messageStatusColor } from "../utils/messageLogPresentation";

const MessageLogDetailDialog = dynamic(() => import("../components/MessageLogDetailDialog").then(module => module.MessageLogDetailDialog), { ssr: false });
const pageSizes = [10, 25, 50, 100];
export default function MessageLogsPage() {
  const { user } = useSession();
  return <MessageLogsWorkspace key={`${user?.userId}:${user?.tenantId}:${user?.companyId}`} />;
}
function MessageLogsWorkspace() {
  const { t, i18n } = useTranslation(); const c = useMessageLogsController();
  const { list, filters, query, rows, total, invalidRange, patchFilters, setSelected } = c;
  const columns = useMemo<GridColDef<MessageLogRow>[]>(() => [
    { field: "startedOnUtc", headerName: t("messageLogs.started"), minWidth: 180, sortable: false, valueFormatter: (value: string) => new Date(value).toLocaleString(i18n.language) },
    { field: "type", headerName: t("messageLogs.type"), width: 95, sortable: false, valueFormatter: () => t("messageLogs.email") },
    { field: "templateId", headerName: t("messageLogs.template"), minWidth: 170, flex: 0.8, sortable: false, valueFormatter: (value: string) => t(`messageLogs.templates.${value}`) },
    { field: "subject", headerName: t("messageLogs.subject"), minWidth: 200, flex: 1, sortable: false },
    { field: "recipient", headerName: t("messageLogs.recipient"), minWidth: 225, flex: 1, sortable: false },
    { field: "status", headerName: t("messageLogs.status"), minWidth: 200, sortable: false, renderCell: ({ row }) => <Chip size="small" color={messageStatusColor(row.status)} label={t(`messageLogs.statuses.${row.status}`)} /> },
    { field: "cause", headerName: t("messageLogs.cause"), minWidth: 190, sortable: false, valueFormatter: (value: string | null) => value ? t(`messageLogs.causes.${value}`) : t("messageLogs.notAvailable") },
    { field: "durationMs", headerName: t("messageLogs.duration"), width: 140, sortable: false },
    { field: "actions", type: "actions", headerName: t("messageLogs.details"), width: 80, getActions: ({ row }) => [
      <GridActionsCellItem key="view" icon={<VisibilityOutlined />} color="primary" label={t("messageLogs.details")} onClick={() => { if (query.allowed) setSelected(row); }} />,
    ] },
  ], [t, i18n.language, query.allowed, setSelected]);
  const controls = <>
    <Grid size={{ xs: 12, sm: 6, lg: 2 }}><MyDateTimeField fieldName="from" mode="date" label={t("messageLogs.fromUtc")} value={filters.from} onChange={from => patchFilters({ from })} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2 }}><MyDateTimeField fieldName="to" mode="date" label={t("messageLogs.toUtc")} value={filters.to} onChange={to => patchFilters({ to })}
      error={invalidRange} helperText={invalidRange ? t("messageLogs.invalidRange") : undefined} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.5 }}><MySelect all={false} size="small" label={t("messageLogs.status")} selectedItem={filters.status} showClearButton={false}
      dataSource={[{ value: "", label: t("messageLogs.all") }, ...messageStatuses.map(value => ({ value, label: t(`messageLogs.statuses.${value}`) }))]}
      valueMember="value" displayMember="label" handleSelectionChange={event => { const value = String(event.target.value); patchFilters({ status: messageStatuses.find(item => item === value) ?? "" }); }} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.5 }}><MySelect all={false} size="small" label={t("messageLogs.template")} selectedItem={filters.templateId} showClearButton={false}
      dataSource={[{ value: "", label: t("messageLogs.all") }, ...messageTemplates.map(value => ({ value, label: t(`messageLogs.templates.${value}`) }))]}
      valueMember="value" displayMember="label" handleSelectionChange={event => { const value = String(event.target.value); patchFilters({ templateId: messageTemplates.find(item => item === value) ?? "" }); }} /></Grid>
    <Grid size={{ xs: 12, lg: 3 }}><MyTextField fieldName="recipient" label={t("messageLogs.recipient")} value={filters.recipient} onChange={event => patchFilters({ recipient: event.target.value })}
      maxLength={254} showCounter={false} size="small" margin="none" appearance="plain" /></Grid>
  </>;
  const feedback = <FeedbackState icon={<EmailOutlined />} role={query.isError || invalidRange ? "alert" : "status"}
    title={t(invalidRange ? "messageLogs.invalidRange" : query.isError ? "messageLogs.loadFailed" : "messageLogs.empty")}
    actions={query.isError ? <Button onClick={() => void query.refetch()}>{t("messageLogs.retry")}</Button> : undefined} />;
  if (!query.allowed) return <FeedbackState icon={<EmailOutlined />} title={t("messageLogs.forbidden")} />;
  return <ContentWrapper fillAvailable>
    <PageHeader variant="multi-view" title={t("messageLogs.title")} storageKey="message-logs-view" availableViews={["grid", "cards"]} defaultView="grid" dataCount={total}
      onViewTypeChange={view => { if (view === "grid" || view === "cards") c.setView(view); }} onRefresh={() => void query.refetch()}
      onFilter={() => c.setShowFilters(value => !value)} isFilterBarVisible={c.showFilters} showActions={{ add: false, refresh: true, filter: true, export: c.canExport }}
      exportOptions={c.canExport ? [{ id: "message-logs-xlsx", label: t("messageLogs.export"), format: "excel", onSelect: c.download, disabled: invalidRange || c.exportState === "pending", loading: c.exportState === "pending" }] : []} />
    {c.exportState === "error" ? <Alert severity="error" onClose={() => c.setExportState("idle")}>{t("messageLogs.exportFailed")}</Alert> : null}
    {c.exportState === "success" ? <Alert severity="success" onClose={() => c.setExportState("idle")}>{t("messageLogs.exported")}</Alert> : null}
    {c.view === "grid" ? <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
      <MyDataGrid rows={invalidRange || query.isError ? [] : rows} columns={columns} getRowId={row => row.id} loading={!invalidRange && !query.isError && (query.isFetching || list.isSearchPending)}
        pagination paginationMode="server" rowCount={invalidRange || query.isError ? 0 : total} paginationModel={{ page: list.state.page, pageSize: list.state.pageSize }}
        onPaginationModelChange={model => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)} pageSizeOptions={pageSizes}
        disableColumnFilter disableRowSelectionOnClick checkboxSelection={false} showToolbar showGridOptions autoSelectFirstRow={false}
        onRowDoubleClick={({ row }) => { if (query.allowed) setSelected(row); }} toolbarFilters={c.showFilters ? controls : undefined}
        toolbarSearch={{ value: list.state.searchValue, onChange: list.setSearchValue, onClear: () => list.setSearchValue(""), placeholder: t("messageLogs.search") }}
        toolbarContent={<ResetButton onReset={list.reset} fullWidth={false} height={40} />} emptyContent={feedback} sx={{ height: "100%", minHeight: 240 }} />
    </Box> : <>
      <CardViewHeader title={t("messageLogs.title")} mainChipLabel={String(total)} showTitleSection={false} compact showSort={false} showFilter={false} page={list.state.page}
        searchTerm={list.state.searchValue} searchPlaceholder={t("messageLogs.search")} onSearchChange={list.setSearchValue} onClearSearch={() => list.setSearchValue("")}
        onReset={list.reset} filterControls={c.showFilters ? controls : undefined} />
      {(query.isPending || query.isPlaceholderData) && !invalidRange ? <FeedbackState icon={<CircularProgress />} title={t("general.loading")} /> : query.isError || invalidRange || rows.length === 0 ? feedback : <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 1 }}>
        <Grid container spacing={2}>{rows.map((row, index) => <Grid key={row.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <EntityCard index={index} height="auto" title={row.subject || t(`messageLogs.templates.${row.templateId}`)} subtitle={new Date(row.startedOnUtc).toLocaleString(i18n.language)}
            endBadge={<Chip size="small" color={messageStatusColor(row.status)} label={t(`messageLogs.statuses.${row.status}`)} />}
            content={<Stack spacing={1}><Typography dir="ltr" sx={{ overflowWrap: "anywhere" }}>{row.recipient}</Typography>
              <Typography>{t(`messageLogs.templates.${row.templateId}`)}</Typography><Typography>{row.cause ? t(`messageLogs.causes.${row.cause}`) : t("messageLogs.notAvailable")}</Typography></Stack>}
            footer={<Button onClick={() => { if (query.allowed) setSelected(row); }}>{t("messageLogs.details")}</Button>} />
        </Grid>)}</Grid>
      </Box>}
      <CardViewPagination page={list.state.page} rowsPerPage={list.state.pageSize} totalItems={total} itemsPerPageOptions={pageSizes} onPageChange={list.setPage} onRowsPerPageChange={list.setPageSize} pinned />
    </>}
    {c.selected ? <MessageLogDetailDialog row={c.selected} onClose={() => setSelected(null)} /> : null}
  </ContentWrapper>;
}

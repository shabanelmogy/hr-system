"use client";

import { permissions } from "@/lib/auth/permissions";
import { CardActionButtons, EntityCard, type CardActionItem } from "@/shared/components/cards";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { ContentWrapper } from "@/shared/components/layout";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { PageHeader } from "@/shared/components/navigation/header";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage, getErrorStatus } from "@/shared/utils/errorUtils";
import { Cancel, CheckCircle, Send, Undo, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApproveEnvelopeAmendment, useCreateEnvelopeAmendment, useEnvelopeAmendment, useEnvelopeAmendments, useRejectEnvelopeAmendment, useSubmitEnvelopeAmendment } from "../hooks/useStaffingQueries";
import type { EnvelopeAmendmentListItem, EnvelopeAmendmentMutation, EnvelopeAmendmentPageQuery } from "../types/Staffing";

const EnvelopeAmendmentForm = dynamic(() => import("../components/EnvelopeAmendmentForm"), { ssr: false });

type Dialog = "add" | "view" | "submit" | "approve" | "reject" | null;
interface Filters { status: string }

export default function EnvelopeAmendmentsPage() {
  const { t } = useTranslation();
  const auth = usePermissions();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<EnvelopeAmendmentListItem | null>(null);
  const [reason, setReason] = useState("");
  const list = useServerListState<EnvelopeAmendmentPageQuery["sortBy"], Filters>({ defaultColumn: "createdOn", defaultSortDirection: "DESC", defaultFilters: { status: "all" }, defaultPageSize: 10 });
  const query = useMemo<EnvelopeAmendmentPageQuery>(() => ({ pageNumber: list.state.page + 1, pageSize: list.state.pageSize, status: list.state.filters.status, search: list.debouncedSearchValue || undefined, sortBy: "createdOn", sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc" }), [list.debouncedSearchValue, list.state]);
  const data = useEnvelopeAmendments(query);
  const detail = useEnvelopeAmendment(selected?.id, dialog === "view");
  const create = useCreateEnvelopeAmendment();
  const submit = useSubmitEnvelopeAmendment();
  const approve = useApproveEnvelopeAmendment();
  const reject = useRejectEnvelopeAmendment();
  const canView = auth.hasPermission(permissions.ViewEnvelopeAmendments);
  const canCreate = !auth.isReadOnly && auth.hasPermission(permissions.CreateEnvelopeAmendments);
  const canApprove = !auth.isReadOnly && auth.hasPermission(permissions.ApproveEnvelopeAmendments);
  const select = useCallback((item: EnvelopeAmendmentListItem, next: Dialog) => { setSelected(item); setReason(""); setDialog(next); }, []);
  const finish = (key: string) => { showToast.success(t(key)); setDialog(null); setSelected(null); };
  const run = async (work: () => Promise<unknown>, key: string) => { try { await work(); finish(key); } catch (error) {
    if (getErrorStatus(error) === 409) {
      await data.refetch();
      setDialog(null);
      setSelected(null);
      showToast.warning(t("staffing.messages.conflictReloaded"));
      return;
    }
    showToast.error(error instanceof Error ? error : new Error(t("staffing.messages.lifecycleError")), t("staffing.messages.lifecycleError"));
  } };
  const createItem = (request: EnvelopeAmendmentMutation) => run(() => create.mutateAsync(request), "staffing.messages.amendmentCreated");
  const actions = useCallback((item: EnvelopeAmendmentListItem): CardActionItem[] => {
    const result: CardActionItem[] = [{ key: "view", title: t("actions.view"), color: "info", icon: <Visibility />, onClick: () => select(item, "view") }];
    if (canCreate && (item.status === 1 || item.status === 4)) result.push({ key: "submit", title: t("staffing.actions.submit"), color: "primary", icon: <Send />, onClick: () => select(item, "submit") });
    if (canApprove && item.status === 2) {
      result.push({ key: "approve", title: t("staffing.actions.approve"), color: "success", icon: <CheckCircle />, onClick: () => select(item, "approve") });
      result.push({ key: "reject", title: t("staffing.actions.reject"), color: "error", icon: <Undo />, onClick: () => select(item, "reject") });
    }
    return result;
  }, [canApprove, canCreate, select, t]);
  const columns = useMemo<GridColDef<EnvelopeAmendmentListItem>[]>(() => [
    { field: "envelopeCode", headerName: t("staffing.fields.envelope"), minWidth: 180, flex: 1 },
    { field: "status", headerName: t("staffing.fields.status"), width: 130, renderCell: ({ row }) => <Chip size="small" label={t(`staffing.amendmentStatus.${row.status}`)} color={row.status === 3 ? "success" : row.status === 4 ? "error" : row.status === 2 ? "warning" : "default"} /> },
    { field: "additionalHeadcount", headerName: t("staffing.fields.additionalHeadcount"), width: 180 },
    { field: "additionalSalaryCost", headerName: t("staffing.fields.additionalSalaryCost"), width: 190, renderCell: ({ row }) => row.additionalSalaryCost.toLocaleString() },
    { field: "createdOn", headerName: t("staffing.fields.createdOn"), width: 180, renderCell: ({ row }) => new Date(row.createdOn).toLocaleDateString() },
    { field: "actions", type: "actions", width: 160, getActions: ({ row }) => actions(row).map(action => <GridActionsCellItem key={action.key} icon={action.icon} label={action.title} onClick={action.onClick} showInMenu />) },
  ], [actions, t]);

  if (!canView) return <Alert severity="warning">{t("common.accessDenied")}</Alert>;
  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("staffing.messages.fetchError")}</Alert></Box>;
  const items = data.data?.items ?? [];
  const total = data.data?.metaData.totalCount ?? 0;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("staffing.amendments.title")} storageKey="envelope-amendments-view" defaultView="grid" availableViews={["grid", "cards"]} onAdd={canCreate ? () => { setSelected(null); setDialog("add"); } : undefined} dataCount={total} totalLabel={t("staffing.amendments.total")} onRefresh={() => void data.refetch()} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} showActions={{ add: canCreate, refresh: true, export: false, filter: false }} />
    {data.isFetching && !data.isLoading ? <LinearProgress /> : null}
    {view === "grid" ? <ContentWrapper><MyDataGrid rows={items} columns={columns} loading={data.isLoading} pagination paginationMode="server" filterMode="server" sortingMode="server" rowCount={total} pageSizeOptions={[5,10,25,50]} paginationModel={{ page: list.state.page, pageSize: list.state.pageSize }} onPaginationModelChange={model => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)} sortModel={[{ field: "createdOn", sort: list.state.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={model => model[0]?.sort && list.setSort("createdOn", model[0].sort.toUpperCase() as "ASC" | "DESC")} showToolbar toolbarSearch={{ value: list.state.searchValue, placeholder: t("staffing.search"), onChange: list.setSearchValue, onClear: () => list.setSearchValue("") }} toolbarContent={<TextField select size="small" label={t("staffing.fields.status")} value={list.state.filters.status} onChange={event => list.setFilters({ status: event.target.value })} sx={{ minWidth: 160 }}><MenuItem value="all">{t("common.all")}</MenuItem>{["draft","submitted","approved","rejected"].map((status, index) => <MenuItem key={status} value={status}>{t(`staffing.amendmentStatus.${index + 1}`)}</MenuItem>)}</TextField>} /></ContentWrapper> : data.isLoading ? <CardViewSkeleton /> : <Box sx={{ flex: 1, overflow: "auto", p: 2 }}><Grid container spacing={2}>{items.map((item, index) => <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}><EntityCard index={index} height={260} title={item.envelopeCode} subtitle={new Date(item.createdOn).toLocaleDateString()} endBadge={<Chip size="small" label={t(`staffing.amendmentStatus.${item.status}`)} />} chips={<Stack direction="row" spacing={1}><Chip size="small" label={`+${item.additionalHeadcount}`} /><Chip size="small" label={`+${item.additionalSalaryCost.toLocaleString()}`} /></Stack>} content={<Typography variant="body2" color="text.secondary">{t("staffing.amendments.capacityHint")}</Typography>} footer={<CardActionButtons actions={actions(item)} />} /></Grid>)}</Grid><CardViewPagination page={list.state.page} rowsPerPage={list.state.pageSize} totalItems={total} itemsPerPageOptions={[5,10,25,50]} itemsLabel={t("staffing.amendments.total")} onPageChange={list.setPage} onRowsPerPageChange={list.setPageSize} /></Box>}
    {dialog === "add" || dialog === "view" ? <EnvelopeAmendmentForm open item={dialog === "view" ? detail.data ?? null : null} loading={create.isPending || detail.isFetching} detailError={detail.error ? extractErrorMessage(detail.error) : null} onClose={() => setDialog(null)} onSubmit={createItem} /> : null}
    <ConfirmationDialog open={dialog === "submit" || dialog === "approve"} title={t(`staffing.confirm.${dialog ?? "submit"}AmendmentTitle`)} description={t(`staffing.confirm.${dialog ?? "submit"}AmendmentDescription`)} confirmLabel={t(`staffing.actions.${dialog ?? "submit"}`)} cancelLabel={t("actions.cancel")} busy={submit.isPending || approve.isPending} confirmColor={dialog === "approve" ? "success" : "primary"} onClose={() => setDialog(null)} onConfirm={() => selected && void run(() => dialog === "approve" ? approve.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion }) : submit.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion }), dialog === "approve" ? "staffing.messages.amendmentApproved" : "staffing.messages.amendmentSubmitted")} />
    <ConfirmationDialog open={dialog === "reject"} title={t("staffing.confirm.rejectAmendmentTitle")} description={t("staffing.confirm.rejectAmendmentDescription")} confirmLabel={t("staffing.actions.reject")} cancelLabel={t("actions.cancel")} busy={reject.isPending} confirmColor="error" icon={<Cancel color="error" />} onClose={() => setDialog(null)} onConfirm={() => selected && reason.trim() && void run(() => reject.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, reason: reason.trim() }), "staffing.messages.amendmentRejected")}><TextField fullWidth multiline minRows={3} sx={{ mt: 2 }} label={t("staffing.fields.reason")} value={reason} onChange={event => setReason(event.target.value)} /></ConfirmationDialog>
  </Box>;
}

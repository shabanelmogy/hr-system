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
import { Cancel, CheckCircle, Close, Send, Undo, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useApproveStaffingRequest,
  useCloseStaffingRequest,
  useCreateStaffingRequest,
  useRejectStaffingRequest,
  useStaffingRequest,
  useStaffingRequests,
  useSubmitStaffingRequest,
} from "../hooks/useStaffingQueries";
import type { StaffingRequestCloseReason, StaffingRequestListItem, StaffingRequestMutation, StaffingRequestPageQuery } from "../types/Staffing";

const StaffingRequestForm = dynamic(() => import("../components/StaffingRequestForm"), { ssr: false });

type Dialog = "add" | "view" | "submit" | "approve" | "reject" | "close" | null;
interface Filters { status: string }

export default function StaffingRequestsPage() {
  const { t } = useTranslation();
  const auth = usePermissions();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<StaffingRequestListItem | null>(null);
  const [reason, setReason] = useState("");
  const [closeReason, setCloseReason] = useState<StaffingRequestCloseReason>(2);
  const list = useServerListState<StaffingRequestPageQuery["sortBy"], Filters>({ defaultColumn: "createdOn", defaultSortDirection: "DESC", defaultFilters: { status: "all" }, defaultPageSize: 10 });
  const query = useMemo<StaffingRequestPageQuery>(() => ({ pageNumber: list.state.page + 1, pageSize: list.state.pageSize, status: list.state.filters.status, search: list.debouncedSearchValue || undefined, sortBy: list.state.columnName, sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc" }), [list.debouncedSearchValue, list.state]);
  const data = useStaffingRequests(query);
  const detail = useStaffingRequest(selected?.id, dialog === "view");
  const create = useCreateStaffingRequest();
  const submit = useSubmitStaffingRequest();
  const approve = useApproveStaffingRequest();
  const reject = useRejectStaffingRequest();
  const close = useCloseStaffingRequest();
  const canView = auth.hasPermission(permissions.ViewStaffingRequests);
  const canCreate = !auth.isReadOnly && auth.hasPermission(permissions.CreateStaffingRequests);
  const canApprove = !auth.isReadOnly && auth.hasPermission(permissions.ApproveStaffingRequests);
  const select = useCallback((item: StaffingRequestListItem, next: Dialog) => { setSelected(item); setReason(""); setCloseReason(item.remainingToHire === 0 ? 1 : item.remainingToHire < item.requestedHeadcount ? 3 : 2); setDialog(next); }, []);
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
  const createRequest = async (request: StaffingRequestMutation) => run(() => create.mutateAsync(request), "staffing.messages.created");

  const actions = useCallback((item: StaffingRequestListItem): CardActionItem[] => {
    const result: CardActionItem[] = [{ key: "view", title: t("actions.view"), color: "info", icon: <Visibility />, onClick: () => select(item, "view") }];
    if (canCreate && (item.status === 1 || item.status === 4)) result.push({ key: "submit", title: t("staffing.actions.submit"), color: "primary", icon: <Send />, onClick: () => select(item, "submit") });
    if (canApprove && item.status === 2) {
      result.push({ key: "approve", title: t("staffing.actions.approve"), color: "success", icon: <CheckCircle />, onClick: () => select(item, "approve") });
      result.push({ key: "reject", title: t("staffing.actions.reject"), color: "error", icon: <Undo />, onClick: () => select(item, "reject") });
    }
    if (canCreate && item.status === 3) result.push({ key: "close", title: t("staffing.actions.close"), color: "warning", icon: <Close />, onClick: () => select(item, "close") });
    return result;
  }, [canApprove, canCreate, select, t]);
  const columns = useMemo<GridColDef<StaffingRequestListItem>[]>(() => [
    { field: "envelopeCode", headerName: t("staffing.fields.envelope"), minWidth: 170, flex: .8 },
    { field: "status", headerName: t("staffing.fields.status"), width: 130, renderCell: ({ row }) => <Chip size="small" label={t(`staffing.status.${row.status}`)} color={row.status === 3 ? "success" : row.status === 4 ? "error" : row.status === 2 ? "warning" : "default"} /> },
    { field: "requestedHeadcount", headerName: t("staffing.fields.requestedHeadcount"), width: 145 },
    { field: "remainingAllocatable", headerName: t("staffing.fields.remainingAllocatable"), width: 160, sortable: false },
    { field: "remainingToHire", headerName: t("staffing.fields.remainingToHire"), width: 145, sortable: false },
    { field: "totalReservedCost", headerName: t("staffing.fields.totalReservedCost"), width: 170, renderCell: ({ row }) => row.totalReservedCost.toLocaleString() },
    { field: "targetStartDate", headerName: t("staffing.fields.targetStartDate"), width: 150 },
    { field: "actions", type: "actions", width: 170, getActions: ({ row }) => actions(row).map(action => <GridActionsCellItem key={action.key} icon={action.icon} label={action.title} onClick={action.onClick} showInMenu />) },
  ], [actions, t]);

  if (!canView) return <Alert severity="warning">{t("common.accessDenied")}</Alert>;
  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("staffing.messages.fetchError")}</Alert></Box>;
  const items = data.data?.items ?? [];
  const total = data.data?.metaData.totalCount ?? 0;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("staffing.requests.title")} storageKey="staffing-requests-view" defaultView="grid" availableViews={["grid", "cards"]} onAdd={canCreate ? () => { setSelected(null); setDialog("add"); } : undefined} dataCount={total} totalLabel={t("staffing.requests.total")} onRefresh={() => void data.refetch()} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} showActions={{ add: canCreate, refresh: true, export: false, filter: false }} />
    {data.isFetching && !data.isLoading ? <LinearProgress /> : null}
    {view === "grid" ? <ContentWrapper><MyDataGrid rows={items} columns={columns} loading={data.isLoading} pagination paginationMode="server" filterMode="server" sortingMode="server" rowCount={total} pageSizeOptions={[5, 10, 25, 50]} paginationModel={{ page: list.state.page, pageSize: list.state.pageSize }} onPaginationModelChange={model => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)} sortModel={[{ field: list.state.columnName, sort: list.state.sortDirection.toLowerCase() as "asc" | "desc" }]} onSortModelChange={model => model[0]?.sort && list.setSort(model[0].field as StaffingRequestPageQuery["sortBy"], model[0].sort.toUpperCase() as "ASC" | "DESC")} showToolbar toolbarSearch={{ value: list.state.searchValue, placeholder: t("staffing.search"), onChange: list.setSearchValue, onClear: () => list.setSearchValue("") }} toolbarContent={<TextField select size="small" label={t("staffing.fields.status")} value={list.state.filters.status} onChange={event => list.setFilters({ status: event.target.value })} sx={{ minWidth: 160 }}><MenuItem value="all">{t("common.all")}</MenuItem>{["draft","submitted","approved","rejected","closed"].map((status, index) => <MenuItem key={status} value={status}>{t(`staffing.status.${index + 1}`)}</MenuItem>)}</TextField>} /></ContentWrapper> : data.isLoading ? <CardViewSkeleton /> : <Box sx={{ flex: 1, overflow: "auto", p: 2 }}><Grid container spacing={2}>{items.map((item, index) => <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}><EntityCard index={index} height={280} title={item.envelopeCode} subtitle={item.targetStartDate} endBadge={<Chip size="small" label={t(`staffing.status.${item.status}`)} />} chips={<Stack direction="row" spacing={1}><Chip size="small" label={t("staffing.capacity.allocatable", { count: item.remainingAllocatable })} /><Chip size="small" label={t("staffing.capacity.toHire", { count: item.remainingToHire })} /></Stack>} content={<Typography variant="body2">{item.totalReservedCost.toLocaleString()} · {t(`staffing.priority.${item.priority}`)}</Typography>} footer={<CardActionButtons actions={actions(item)} />} /></Grid>)}</Grid><CardViewPagination page={list.state.page} rowsPerPage={list.state.pageSize} totalItems={total} itemsPerPageOptions={[5,10,25,50]} itemsLabel={t("staffing.requests.total")} onPageChange={list.setPage} onRowsPerPageChange={list.setPageSize} /></Box>}
    {dialog === "add" || dialog === "view" ? <StaffingRequestForm open item={dialog === "view" ? detail.data ?? null : null} loading={create.isPending || detail.isFetching} detailError={detail.error ? extractErrorMessage(detail.error) : null} onClose={() => setDialog(null)} onSubmit={createRequest} /> : null}
    <ConfirmationDialog open={dialog === "submit" || dialog === "approve"} title={t(`staffing.confirm.${dialog ?? "submit"}Title`)} description={t(`staffing.confirm.${dialog ?? "submit"}Description`)} confirmLabel={t(`staffing.actions.${dialog ?? "submit"}`)} cancelLabel={t("actions.cancel")} busy={submit.isPending || approve.isPending} confirmColor={dialog === "approve" ? "success" : "primary"} onClose={() => setDialog(null)} onConfirm={() => selected && void run(() => dialog === "approve" ? approve.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion }) : submit.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion }), dialog === "approve" ? "staffing.messages.approved" : "staffing.messages.submitted")} />
    <ConfirmationDialog open={dialog === "reject"} title={t("staffing.confirm.rejectTitle")} description={t("staffing.confirm.rejectDescription")} confirmLabel={t("staffing.actions.reject")} cancelLabel={t("actions.cancel")} busy={reject.isPending} confirmColor="error" icon={<Cancel color="error" />} onClose={() => setDialog(null)} onConfirm={() => selected && reason.trim() && void run(() => reject.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, reason: reason.trim() }), "staffing.messages.rejected")}><TextField fullWidth multiline minRows={3} sx={{ mt: 2 }} label={t("staffing.fields.reason")} value={reason} onChange={event => setReason(event.target.value)} /></ConfirmationDialog>
    <ConfirmationDialog open={dialog === "close"} title={t("staffing.confirm.closeTitle")} description={t("staffing.confirm.closeDescription")} confirmLabel={t("staffing.actions.close")} cancelLabel={t("actions.cancel")} busy={close.isPending} confirmColor="warning" icon={<Close color="warning" />} onClose={() => setDialog(null)} onConfirm={() => selected && void run(() => close.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, closeReason }), "staffing.messages.closed")}><TextField select fullWidth sx={{ mt: 2 }} label={t("staffing.fields.closeReason")} value={closeReason} onChange={event => setCloseReason(Number(event.target.value) as StaffingRequestCloseReason)}>{[1,2,3].map(value => <MenuItem key={value} value={value}>{t(`staffing.closeReason.${value}`)}</MenuItem>)}</TextField></ConfirmationDialog>
  </Box>;
}

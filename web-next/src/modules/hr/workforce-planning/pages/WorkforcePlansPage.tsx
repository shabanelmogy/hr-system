"use client";

import { useFiscalYearLookup } from "@/modules/accounting/public";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage, getErrorStatus } from "@/shared/utils/errorUtils";
import { Archive, CheckCircle, RateReview, Redo, Restore, Send, Undo } from "@mui/icons-material";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import WorkforcePlansMultiView from "../components/WorkforcePlansMultiView";
import {
  workforcePlanKeys,
  useArchiveWorkforcePlan,
  useApproveWorkforcePlan,
  useBeginWorkforcePlanReview,
  useCreateWorkforcePlan,
  useCreateWorkforcePlanRevision,
  useRejectWorkforcePlan,
  useRestoreWorkforcePlan,
  useSubmitWorkforcePlan,
  useUpdateWorkforcePlan,
  useWorkforcePlan,
  useWorkforcePlanRevisions,
} from "../hooks/useWorkforcePlanQueries";
import WorkforcePlanService from "../services/workforcePlanService";
import type { WorkforcePlanDetail, WorkforcePlanListItem, WorkforcePlanMutationRequest, WorkforcePlanPageQuery, WorkforcePlanPermissions } from "../types/WorkforcePlan";

const WorkforcePlanForm = dynamic(() => import("../components/WorkforcePlanForm"), { ssr: false });

type Dialog = "add" | "edit" | "view" | "submit" | "beginReview" | "approve" | "reject" | "createRevision" | "archive" | "restore" | null;
interface Filters { status: string; recordStatus: "active" | "archived" | "all"; fiscalYearId?: number }
const defaultFilters: Filters = { status: "all", recordStatus: "active", fiscalYearId: undefined };

export default function WorkforcePlansPage() {
  const { t, i18n } = useTranslation();
  const authorization = usePermissions();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<WorkforcePlanListItem | null>(null);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const list = useServerListState<WorkforcePlanPageQuery["sortBy"], Filters>({ defaultColumn: "createdOn", defaultSortDirection: "DESC", defaultFilters, defaultPageSize: 10 });
  const query = useMemo<WorkforcePlanPageQuery>(() => ({
    pageNumber: list.state.page + 1,
    pageSize: list.state.pageSize,
    fiscalYearId: list.state.filters.fiscalYearId,
    status: list.state.filters.status,
    recordStatus: list.state.filters.recordStatus,
    search: list.debouncedSearchValue || undefined,
    sortBy: list.state.columnName,
    sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
  }), [list.debouncedSearchValue, list.state]);
  const data = useAdaptivePagination({ query, queryKey: workforcePlanKeys.page, queryFn: WorkforcePlanService.getPage });
  const detail = useWorkforcePlan(selected?.id, dialog === "edit" || dialog === "view");
  const revisions = useWorkforcePlanRevisions(selected?.id, dialog === "view");
  const fiscalYears = useFiscalYearLookup();
  const currentItem: WorkforcePlanDetail | null = detail.data ?? null;
  const access = useMemo<WorkforcePlanPermissions>(() => ({
    canView: authorization.hasPermission(permissions.ViewWorkforcePlans),
    canCreate: !authorization.isReadOnly && authorization.hasPermission(permissions.CreateWorkforcePlans),
    canEdit: !authorization.isReadOnly && authorization.hasPermission(permissions.EditWorkforcePlans),
    canDelete: !authorization.isReadOnly && authorization.hasPermission(permissions.DeleteWorkforcePlans),
    canApprove: !authorization.isReadOnly && authorization.hasPermission(permissions.ApproveWorkforcePlans),
  }), [authorization]);
  const fiscalOptions = useMemo(() => (fiscalYears.data ?? []).map(year => ({ id: year.id, label: `${year.code} Ã¢â‚¬â€ ${i18n.language.startsWith("ar") ? year.nameAr : year.nameEn}` })), [fiscalYears.data, i18n.language]);
  const fail = async (error: Error, key: string) => {
    if (getErrorStatus(error) === 409) {
      await data.refetch();
      if (selected?.id) await detail.refetch();
      setSelected(null);
      setDialog(null);
      showToast.warning(t("workforcePlanning.messages.conflictReloaded"));
      return;
    }
    showToast.error(error, t(key));
  };
  const toListItem = (item: WorkforcePlanDetail): WorkforcePlanListItem => ({
    id: item.id, planSeriesId: item.planSeriesId, planCode: item.planCode, fiscalYearId: item.fiscalYearId, revisionNumber: item.revisionNumber,
    titleEn: item.titleEn, titleAr: item.titleAr, status: item.status, linesCount: item.lines.length,
    newHireSlots: item.lines.reduce((sum, line) => sum + line.newHireSlots, 0),
    replacementSlots: item.lines.reduce((sum, line) => sum + line.replacementSlots, 0),
    plannedHiringSlots: item.lines.reduce((sum, line) => sum + line.plannedHiringSlots, 0),
    isEffective: item.status === 4 && Boolean(item.activatedOn) && !item.supersededOn,
    isDeleted: item.isDeleted,
    createdOn: item.createdOn, updatedOn: item.updatedOn, rowVersion: item.rowVersion,
  });
  const completed = (key: string) => (item: WorkforcePlanDetail) => { showToast.success(t(key, { code: item.planCode })); setSelected(toListItem(item)); setDialog(null); };
  const create = useCreateWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.created"), onError: error => { void fail(error, "workforcePlanning.messages.createError"); } });
  const update = useUpdateWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.updated"), onError: error => { void fail(error, "workforcePlanning.messages.updateError"); } });
  const archive = useArchiveWorkforcePlan({ onSuccess: () => { showToast.success(t("workforcePlanning.messages.archived")); setSelected(null); setDialog(null); }, onError: error => { void fail(error, "workforcePlanning.messages.archiveError"); } });
  const restore = useRestoreWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.restored"), onError: error => { void fail(error, "workforcePlanning.messages.restoreError"); } });
  const submitPlan = useSubmitWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.submitted"), onError: error => { void fail(error, "workforcePlanning.messages.lifecycleError"); } });
  const beginReview = useBeginWorkforcePlanReview({ onSuccess: completed("workforcePlanning.messages.reviewStarted"), onError: error => { void fail(error, "workforcePlanning.messages.lifecycleError"); } });
  const approve = useApproveWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.approved"), onError: error => { void fail(error, "workforcePlanning.messages.lifecycleError"); } });
  const reject = useRejectWorkforcePlan({ onSuccess: completed("workforcePlanning.messages.rejected"), onError: error => { void fail(error, "workforcePlanning.messages.lifecycleError"); } });
  const revision = useCreateWorkforcePlanRevision({ onSuccess: item => { showToast.success(t("workforcePlanning.messages.revisionCreated", { revision: item.revisionNumber })); setSelected(toListItem(item)); setDialog("edit"); }, onError: error => { void fail(error, "workforcePlanning.messages.lifecycleError"); } });
  const select = (item: WorkforcePlanListItem, next: Dialog) => { setSelected(item); setReason(""); setReasonTouched(false); setDialog(next); };
  const lifecycleDialog = (item: WorkforcePlanListItem): Dialog => item.status === 2 ? "beginReview" : item.status === 3 ? "approve" : [4, 6].includes(item.status) ? "createRevision" : "submit";
  const action = dialog === "submit" ? submitPlan : dialog === "beginReview" ? beginReview : dialog === "approve" ? approve : revision;
  const actionIcon = dialog === "submit" ? <Send /> : dialog === "beginReview" ? <RateReview /> : dialog === "approve" ? <CheckCircle /> : <Redo />;
  const submit = async (request: WorkforcePlanMutationRequest) => {
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && currentItem) await update.mutateAsync({ id: currentItem.id, request: { titleEn: request.titleEn, titleAr: request.titleAr, description: request.description, lines: request.lines, rowVersion: currentItem.rowVersion } });
  };

  if (!access.canView) return <Alert severity="warning">{t("common.accessDenied")}</Alert>;
  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("workforcePlanning.messages.fetchError")}</Alert></Box>;
  return <>
    <WorkforcePlansMultiView items={data.pageItems} loading={data.isLoading} fetching={data.isFetching} page={list.state.page} pageSize={list.state.pageSize} totalCount={data.totalCount} permissions={access} fiscalYears={fiscalOptions}
      searchValue={list.state.searchValue} status={list.state.filters.status} recordStatus={list.state.filters.recordStatus} fiscalYearId={list.state.filters.fiscalYearId} sortColumn={list.state.columnName} sortDirection={list.state.sortDirection}
      onPageChange={list.setPage} onPageSizeChange={list.setPageSize} onSearchChange={list.setSearchValue} onStatusChange={value => list.setFilters({ ...list.state.filters, status: value })} onRecordStatusChange={value => list.setFilters({ ...list.state.filters, recordStatus: value })} onFiscalYearChange={value => list.setFilters({ ...list.state.filters, fiscalYearId: value })} onSortChange={list.setSort} onReset={list.reset} onRefresh={() => void data.refetch()} onAdd={() => { setSelected(null); setDialog("add"); }}
      onView={item => select(item, "view")} onEdit={item => select(item, "edit")} onLifecycle={item => select(item, lifecycleDialog(item))} onReject={item => select(item, "reject")} onArchive={item => select(item, "archive")} onRestore={item => select(item, "restore")} />
    {(dialog === "add" || dialog === "edit" || dialog === "view") ? <WorkforcePlanForm open mode={dialog} item={currentItem} revisions={revisions.data ?? []} loading={create.isPending || update.isPending || detail.isFetching || revisions.isFetching} detailError={detail.error ? extractErrorMessage(detail.error) || t("workforcePlanning.messages.fetchError") : null} onRetryDetail={() => void detail.refetch()} onClose={() => setDialog(null)} onSubmit={submit} /> : null}
    {dialog && ["submit", "beginReview", "approve", "createRevision"].includes(dialog) ? <ConfirmationDialog open title={t(`workforcePlanning.confirm.${dialog}Title`)} description={t(`workforcePlanning.confirm.${dialog}Description`)} confirmLabel={t(`workforcePlanning.actions.${dialog}`)} cancelLabel={t("actions.cancel")} confirmColor={dialog === "approve" ? "success" : "primary"} confirmIcon={actionIcon} icon={actionIcon} busy={action.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void action.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.planCode}</Typography></ConfirmationDialog> : null}
    <ConfirmationDialog open={dialog === "reject"} title={t("workforcePlanning.confirm.rejectTitle")} description={t("workforcePlanning.confirm.rejectDescription")} confirmLabel={t("workforcePlanning.actions.reject")} cancelLabel={t("actions.cancel")} confirmColor="error" confirmIcon={<Undo />} icon={<Undo color="error" />} busy={reject.isPending} onClose={() => setDialog(null)} onConfirm={() => { setReasonTouched(true); if (selected && reason.trim()) void reject.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, reason: reason.trim() }); }}>
      <TextField autoFocus fullWidth required multiline minRows={3} sx={{ mt: 2 }} label={t("workforcePlanning.fields.decisionReason")} value={reason} onChange={event => setReason(event.target.value)} error={reasonTouched && !reason.trim()} helperText={reasonTouched && !reason.trim() ? t("workforcePlanning.validation.reason") : " "} />
    </ConfirmationDialog>
    <ConfirmationDialog open={dialog === "archive"} title={t("workforcePlanning.confirm.archiveTitle")} description={t("workforcePlanning.confirm.archiveDescription")} confirmLabel={t("workforcePlanning.actions.archive")} cancelLabel={t("actions.cancel")} confirmColor="error" confirmIcon={<Archive />} icon={<Archive color="error" />} busy={archive.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void archive.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.planCode}</Typography></ConfirmationDialog>
    <ConfirmationDialog open={dialog === "restore"} title={t("workforcePlanning.confirm.restoreTitle")} description={t("workforcePlanning.confirm.restoreDescription")} confirmLabel={t("workforcePlanning.actions.restore")} cancelLabel={t("actions.cancel")} confirmColor="success" confirmIcon={<Restore />} icon={<Restore color="success" />} busy={restore.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void restore.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.planCode}</Typography></ConfirmationDialog>
  </>;
}

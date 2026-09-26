"use client";

import { useFiscalYearLookup } from "@/modules/accounting/public";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage, getErrorStatus } from "@/shared/utils/errorUtils";
import { CheckCircle, Send, Undo } from "@mui/icons-material";
import { Alert, Box, Button, TextField } from "@mui/material";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import WorkforceBudgetsMultiView from "../components/WorkforceBudgetsMultiView";
import {
  useApproveWorkforceBudget,
  useBudgetSourcePlans,
  useCreateWorkforceBudget,
  useRejectWorkforceBudget,
  useSubmitWorkforceBudget,
  useUpdateWorkforceBudget,
  useWorkforceBudget,
  workforceBudgetKeys,
} from "../hooks/useWorkforceBudgetQueries";
import WorkforceBudgetService from "../services/workforceBudgetService";
import type { WorkforceBudgetDetail, WorkforceBudgetListItem, WorkforceBudgetMutationRequest, WorkforceBudgetPageQuery, WorkforceBudgetPermissions } from "../types/WorkforceBudget";

const WorkforceBudgetForm = dynamic(() => import("../components/WorkforceBudgetForm"), { ssr: false });

type Dialog = "add" | "edit" | "view" | "submit" | "approve" | "reject" | null;
interface Filters { status: string; fiscalYearId?: number; workforcePlanId?: number }
const defaultFilters: Filters = { status: "all", fiscalYearId: undefined, workforcePlanId: undefined };

export default function WorkforceBudgetsPage() {
  const { t, i18n } = useTranslation();
  const authorization = usePermissions();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<WorkforceBudgetListItem | null>(null);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const list = useServerListState<WorkforceBudgetPageQuery["sortBy"], Filters>({ defaultColumn: "createdOn", defaultSortDirection: "DESC", defaultFilters, defaultPageSize: 10 });
  const query = useMemo<WorkforceBudgetPageQuery>(() => ({
    pageNumber: list.state.page + 1,
    pageSize: list.state.pageSize,
    fiscalYearId: list.state.filters.fiscalYearId,
    workforcePlanId: list.state.filters.workforcePlanId,
    status: list.state.filters.status,
    search: list.debouncedSearchValue || undefined,
    sortBy: list.state.columnName,
    sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
  }), [list.debouncedSearchValue, list.state]);
  const data = useAdaptivePagination({ query, queryKey: workforceBudgetKeys.page, queryFn: WorkforceBudgetService.getPage });
  const detail = useWorkforceBudget(selected?.id, dialog === "edit" || dialog === "view");
  const fiscalYears = useFiscalYearLookup();
  const canViewBudgets = authorization.hasPermission(permissions.ViewWorkforceBudgets);
  const sourcePlans = useBudgetSourcePlans({ pageNumber: 1, pageSize: 100 }, canViewBudgets);
  const currentItem: WorkforceBudgetDetail | null = detail.data ?? null;
  const access = useMemo<WorkforceBudgetPermissions>(() => ({
    canView: canViewBudgets,
    canCreate: !authorization.isReadOnly && authorization.hasPermission(permissions.CreateWorkforceBudgets),
    canEdit: !authorization.isReadOnly && authorization.hasPermission(permissions.EditWorkforceBudgets),
    canSubmit: !authorization.isReadOnly && authorization.hasPermission(permissions.SubmitWorkforceBudgets),
    canReview: !authorization.isReadOnly && authorization.hasPermission(permissions.ReviewWorkforceBudgets),
  }), [authorization, canViewBudgets]);
  const fiscalOptions = useMemo(() => (fiscalYears.data ?? []).map(year => ({ id: year.id, label: `${year.code} Ã¢â‚¬â€ ${i18n.language.startsWith("ar") ? year.nameAr : year.nameEn}` })), [fiscalYears.data, i18n.language]);
  const planOptions = useMemo(() => (sourcePlans.data?.items ?? []).map(plan => ({ id: plan.id, label: `${plan.planCode} Ã¢â‚¬â€ ${i18n.language.startsWith("ar") ? plan.titleAr : plan.titleEn}` })), [sourcePlans.data, i18n.language]);
  const fail = async (error: Error, key: string) => {
    if (getErrorStatus(error) === 409) {
      await data.refetch();
      if (selected?.id) await detail.refetch();
      setSelected(null);
      setDialog(null);
      showToast.warning(t("workforceBudget.messages.conflictReloaded"));
      return;
    }
    showToast.error(error, t(key));
  };
  const completed = (key: string) => (item: WorkforceBudgetDetail) => { showToast.success(t(key, { code: item.budgetCode })); setSelected(toListItem(item)); setDialog(null); };
  const create = useCreateWorkforceBudget({ onSuccess: completed("workforceBudget.messages.created"), onError: error => { void fail(error, "workforceBudget.messages.createError"); } });
  const update = useUpdateWorkforceBudget({ onSuccess: completed("workforceBudget.messages.updated"), onError: error => { void fail(error, "workforceBudget.messages.updateError"); } });
  const submitBudget = useSubmitWorkforceBudget({ onSuccess: completed("workforceBudget.messages.submitted"), onError: error => { void fail(error, "workforceBudget.messages.lifecycleError"); } });
  const approve = useApproveWorkforceBudget({ onSuccess: completed("workforceBudget.messages.approved"), onError: error => { void fail(error, "workforceBudget.messages.lifecycleError"); } });
  const reject = useRejectWorkforceBudget({ onSuccess: completed("workforceBudget.messages.rejected"), onError: error => { void fail(error, "workforceBudget.messages.lifecycleError"); } });
  const select = (item: WorkforceBudgetListItem, next: Dialog) => { setSelected(item); setReason(""); setReasonTouched(false); setDialog(next); };
  const lifecycleDialog = (item: WorkforceBudgetListItem): Dialog => item.status === 2 ? "approve" : "submit";
  const action = dialog === "approve" ? approve : submitBudget;
  const actionIcon = dialog === "approve" ? <CheckCircle /> : <Send />;
  const submit = async (request: WorkforceBudgetMutationRequest) => {
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && currentItem) await update.mutateAsync({ id: currentItem.id, request: { currencyCode: request.currencyCode, lines: request.lines, rowVersion: currentItem.rowVersion } });
  };

  if (!access.canView) return <Alert severity="warning">{t("common.accessDenied")}</Alert>;
  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("workforceBudget.messages.fetchError")}</Alert></Box>;
  return <>
    <WorkforceBudgetsMultiView items={data.pageItems} loading={data.isLoading} fetching={data.isFetching} page={list.state.page} pageSize={list.state.pageSize} totalCount={data.totalCount} permissions={access} fiscalYears={fiscalOptions} plans={planOptions}
      searchValue={list.state.searchValue} status={list.state.filters.status} fiscalYearId={list.state.filters.fiscalYearId} workforcePlanId={list.state.filters.workforcePlanId} sortColumn={list.state.columnName} sortDirection={list.state.sortDirection}
      onPageChange={list.setPage} onPageSizeChange={list.setPageSize} onSearchChange={list.setSearchValue} onStatusChange={value => list.setFilters({ ...list.state.filters, status: value })} onFiscalYearChange={value => list.setFilters({ ...list.state.filters, fiscalYearId: value })} onPlanChange={value => list.setFilters({ ...list.state.filters, workforcePlanId: value })} onSortChange={list.setSort} onReset={list.reset} onRefresh={() => void data.refetch()} onAdd={() => { setSelected(null); setDialog("add"); }}
      onView={item => select(item, "view")} onEdit={item => select(item, "edit")} onLifecycle={item => select(item, lifecycleDialog(item))} onReject={item => select(item, "reject")} />
    {(dialog === "add" || dialog === "edit" || dialog === "view") ? <WorkforceBudgetForm open mode={dialog} item={currentItem} loading={create.isPending || update.isPending || detail.isFetching} detailError={detail.error ? extractErrorMessage(detail.error) || t("workforceBudget.messages.fetchError") : null} onRetryDetail={() => void detail.refetch()} onClose={() => setDialog(null)} onSubmit={submit} /> : null}
    {dialog && ["submit", "approve"].includes(dialog) ? <ConfirmationDialog open title={t(`workforceBudget.confirm.${dialog}Title`)} description={t(`workforceBudget.confirm.${dialog}Description`)} confirmLabel={t(`workforceBudget.actions.${dialog}`)} cancelLabel={t("actions.cancel")} confirmColor={dialog === "approve" ? "success" : "primary"} confirmIcon={actionIcon} icon={actionIcon} busy={action.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void action.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })} /> : null}
    <ConfirmationDialog open={dialog === "reject"} title={t("workforceBudget.confirm.rejectTitle")} description={t("workforceBudget.confirm.rejectDescription")} confirmLabel={t("workforceBudget.actions.reject")} cancelLabel={t("actions.cancel")} confirmColor="error" confirmIcon={<Undo />} icon={<Undo color="error" />} busy={reject.isPending} onClose={() => setDialog(null)} onConfirm={() => { setReasonTouched(true); if (selected && reason.trim()) void reject.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, reason: reason.trim() }); }}>
      <TextField autoFocus fullWidth required multiline minRows={3} sx={{ mt: 2 }} label={t("workforceBudget.fields.decisionReason")} value={reason} onChange={event => setReason(event.target.value)} error={reasonTouched && !reason.trim()} helperText={reasonTouched && !reason.trim() ? t("workforceBudget.validation.reason") : " "} />
    </ConfirmationDialog>
  </>;
}

function toListItem(item: WorkforceBudgetDetail): WorkforceBudgetListItem {
  return {
    id: item.id, budgetCode: item.budgetCode, workforcePlanId: item.workforcePlanId, fiscalYearId: item.fiscalYearId,
    revisionNumber: item.revisionNumber, currencyCode: item.currencyCode, status: item.status,
    totalAuthorizedHeadcount: item.totalAuthorizedHeadcount, totalSalaryBudget: item.totalSalaryBudget,
    totalRecruitmentBudget: item.totalRecruitmentBudget, grandTotalBudget: item.grandTotalBudget,
    isEffective: item.isEffective, activatedOn: item.activatedOn, createdOn: item.createdOn, updatedOn: item.updatedOn, rowVersion: item.rowVersion,
  };
}

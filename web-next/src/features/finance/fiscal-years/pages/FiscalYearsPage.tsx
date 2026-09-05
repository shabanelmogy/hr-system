"use client";

import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Archive, LockClock, Restore } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FiscalYearForm from "../components/FiscalYearForm";
import FiscalYearsMultiView from "../components/FiscalYearsMultiView";
import { fiscalYearKeys, useArchiveFiscalYear, useChangeFiscalYearLifecycle, useCreateFiscalYear, useFiscalYear, useRestoreFiscalYear, useUpdateFiscalYear } from "../hooks/useFiscalYearQueries";
import FiscalYearService from "../services/fiscalYearService";
import type { FiscalYearDetail, FiscalYearLifecycleAction, FiscalYearLifecycleFilter, FiscalYearListItem, FiscalYearMutationRequest, FiscalYearPermissions, FiscalYearRecordStatus, FiscalYearSearchField, FiscalYearSearchOperator, FiscalYearSortColumn } from "../types/FiscalYear";

type Dialog = "add" | "edit" | "view" | "archive" | "restore" | "lifecycle" | null;
interface Filters { recordStatus: FiscalYearRecordStatus; lifecycleStatus: FiscalYearLifecycleFilter; searchField: FiscalYearSearchField; searchOperator: FiscalYearSearchOperator }
const defaultFilters: Filters = { recordStatus: "active", lifecycleStatus: "all", searchField: "all", searchOperator: "contains" };

export default function FiscalYearsPage() {
  const { t } = useTranslation();
  const authorization = usePermissions();
  const list = useServerListState<FiscalYearSortColumn, Filters>({ defaultColumn: "startDate", defaultSortDirection: "DESC", defaultFilters, defaultPageSize: 10 });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<FiscalYearListItem | null>(null);
  const query = useMemo(() => ({
    pageNumber: list.state.page + 1, pageSize: list.state.pageSize, search: list.debouncedSearchValue || undefined,
    searchField: list.state.filters.searchField, searchOperator: list.state.filters.searchOperator, recordStatus: list.state.filters.recordStatus,
    lifecycleStatus: list.state.filters.lifecycleStatus, sortBy: list.state.columnName, sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
  }), [list.debouncedSearchValue, list.state]);
  const data = useAdaptivePagination({ query, queryKey: fiscalYearKeys.page, queryFn: FiscalYearService.getPage });
  const details = useFiscalYear(selected?.id, dialog === "edit" || dialog === "view");
  const currentItem: FiscalYearDetail | null = details.data ?? (selected ? { ...selected, periods: [] } : null);
  const access = useMemo<FiscalYearPermissions>(() => ({
    canView: authorization.hasPermission(permissions.ViewFiscalYears),
    canCreate: !authorization.isReadOnly && authorization.hasPermission(permissions.CreateFiscalYears),
    canEdit: !authorization.isReadOnly && authorization.hasPermission(permissions.EditFiscalYears),
    canDelete: !authorization.isReadOnly && authorization.hasPermission(permissions.DeleteFiscalYears),
    canManageLifecycle: !authorization.isReadOnly && authorization.hasPermission(permissions.ManageFiscalYearLifecycle),
  }), [authorization]);

  const fail = (error: Error, key: string) => showToast.error(extractErrorMessage(error) || t(key));
  const create = useCreateFiscalYear({ onSuccess: item => { showToast.success(t("fiscalYears.messages.created", { code: item.code })); setDialog(null); }, onError: error => fail(error, "fiscalYears.messages.createError") });
  const update = useUpdateFiscalYear({ onSuccess: item => { showToast.success(t("fiscalYears.messages.updated", { code: item.code })); setDialog(null); }, onError: error => fail(error, "fiscalYears.messages.updateError") });
  const archive = useArchiveFiscalYear({ onSuccess: () => { showToast.success(t("fiscalYears.messages.archived")); setDialog(null); }, onError: error => fail(error, "fiscalYears.messages.archiveError") });
  const restore = useRestoreFiscalYear({ onSuccess: () => { showToast.success(t("fiscalYears.messages.restored")); setDialog(null); }, onError: error => fail(error, "fiscalYears.messages.restoreError") });
  const lifecycle = useChangeFiscalYearLifecycle({ onSuccess: item => { showToast.success(t("fiscalYears.messages.lifecycleChanged", { status: t(`fiscalYears.status.${["", "draft", "open", "closing", "closed", "locked"][item.status]}`) })); setDialog(null); }, onError: error => fail(error, "fiscalYears.messages.lifecycleError") });
  const select = (item: FiscalYearListItem, next: Dialog) => { setSelected(item); setDialog(next); };
  const nextLifecycle = (item: FiscalYearListItem): FiscalYearLifecycleAction | null => ({ 1: "open", 2: "beginClosing", 3: "close", 4: "lock" } as const)[item.status as 1 | 2 | 3 | 4] ?? null;
  const lifecycleAction = selected ? nextLifecycle(selected) : null;
  const submit = async (request: FiscalYearMutationRequest) => {
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && currentItem) await update.mutateAsync({ id: currentItem.id, request: { ...request, rowVersion: currentItem.rowVersion } });
  };

  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("fiscalYears.messages.fetchError")}</Alert></Box>;
  return <>
    <FiscalYearsMultiView items={data.pageItems} loading={data.isLoading} fetching={data.isFetching} page={list.state.page} pageSize={list.state.pageSize} totalCount={data.totalCount} permissions={access}
      searchValue={list.state.searchValue} searchField={list.state.filters.searchField} searchOperator={list.state.filters.searchOperator} sortColumn={list.state.columnName} sortDirection={list.state.sortDirection} recordStatus={list.state.filters.recordStatus} lifecycleStatus={list.state.filters.lifecycleStatus}
      onPageChange={list.setPage} onPageSizeChange={list.setPageSize} onSearchChange={list.setSearchValue} onSearchFieldChange={value => list.setFilters({ ...list.state.filters, searchField: value })} onSearchOperatorChange={value => list.setFilters({ ...list.state.filters, searchOperator: value })} onSortChange={list.setSort} onRecordStatusChange={value => list.setFilters({ ...list.state.filters, recordStatus: value })} onLifecycleStatusChange={value => list.setFilters({ ...list.state.filters, lifecycleStatus: value })} onReset={list.reset} onRefresh={() => void data.refetch()} onAdd={() => { setSelected(null); setDialog("add"); }}
      onView={item => select(item, "view")} onEdit={item => select(item, "edit")} onArchive={item => select(item, "archive")} onRestore={item => select(item, "restore")} onLifecycle={item => select(item, "lifecycle")} />
    {(dialog === "add" || dialog === "edit" || dialog === "view") ? <FiscalYearForm open mode={dialog} item={currentItem} loading={create.isPending || update.isPending || details.isFetching} detailError={details.error ? extractErrorMessage(details.error) || t("fiscalYears.messages.fetchError") : null} onRetryDetail={() => void details.refetch()} onClose={() => setDialog(null)} onSubmit={submit} /> : null}
    <ConfirmationDialog open={dialog === "archive"} title={t("fiscalYears.confirm.archiveTitle")} description={t("fiscalYears.confirm.archiveDescription")} confirmLabel={t("actions.archive")} cancelLabel={t("actions.cancel")} confirmColor="warning" confirmIcon={<Archive />} icon={<Archive color="warning" />} busy={archive.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void archive.mutateAsync(selected.id)}><Typography sx={{ fontWeight: 700 }}>{selected?.code}</Typography></ConfirmationDialog>
    <ConfirmationDialog open={dialog === "restore"} title={t("fiscalYears.confirm.restoreTitle")} description={t("fiscalYears.confirm.restoreDescription")} confirmLabel={t("actions.restore")} cancelLabel={t("actions.cancel")} confirmColor="success" confirmIcon={<Restore />} icon={<Restore color="success" />} busy={restore.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void restore.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.code}</Typography></ConfirmationDialog>
    <ConfirmationDialog open={dialog === "lifecycle"} title={t(`fiscalYears.confirm.${lifecycleAction ?? "open"}Title`)} description={t(`fiscalYears.confirm.${lifecycleAction ?? "open"}Description`)} confirmLabel={t(`fiscalYears.lifecycle.${lifecycleAction ?? "open"}`)} cancelLabel={t("actions.cancel")} confirmColor="primary" confirmIcon={<LockClock />} icon={<LockClock color="primary" />} busy={lifecycle.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && lifecycleAction && void lifecycle.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion, action: lifecycleAction })}><Typography sx={{ fontWeight: 700 }}>{selected?.code}</Typography></ConfirmationDialog>
  </>;
}

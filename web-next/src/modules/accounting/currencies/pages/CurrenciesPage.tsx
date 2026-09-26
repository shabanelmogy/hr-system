"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { PageHeader } from "@/shared/components/navigation/header";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import CurrenciesDataGrid from "../components/CurrenciesDataGrid";
import { currencyKeys, useArchiveCurrency, useCreateCurrency, useCurrency, useRestoreCurrency, useUpdateCurrency } from "../hooks/useCurrencyQueries";
import { currencyService } from "../services/currencyService";
import type { Currency, CurrencyMutationRequest, CurrencyRecordStatus, CurrencySearchField, CurrencySearchOperator, CurrencySortColumn } from "../types/Currency";

const CurrencyForm = dynamic(() => import("../components/CurrencyForm"), { ssr: false });

type Dialog = "add" | "edit" | "view" | "archive" | "restore" | null;
interface Filters {
  recordStatus: CurrencyRecordStatus;
  searchField: CurrencySearchField;
  searchOperator: CurrencySearchOperator;
}
const defaultFilters: Filters = { recordStatus: "active", searchField: "all", searchOperator: "contains" };

export default function CurrenciesPage() {
  const { t } = useTranslation();
  const authorization = usePermissions();
  const canCreate = !authorization.isReadOnly && authorization.hasPermission(permissions.CreateCurrencies);
  const canEdit = !authorization.isReadOnly && authorization.hasPermission(permissions.EditCurrencies);
  const canArchive = !authorization.isReadOnly && authorization.hasPermission(permissions.ArchiveCurrencies);
  const canRestore = !authorization.isReadOnly && authorization.hasPermission(permissions.RestoreCurrencies);
  const list = useServerListState<CurrencySortColumn, Filters>({ defaultColumn: "currencyCode", defaultFilters, defaultPageSize: 10 });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<Currency | null>(null);
  const query = useMemo(() => ({
    pageNumber: list.state.page + 1,
    pageSize: list.state.pageSize,
    search: list.debouncedSearchValue || undefined,
    searchField: list.state.filters.searchField,
    searchOperator: list.state.filters.searchOperator,
    recordStatus: list.state.filters.recordStatus,
    sortBy: list.state.columnName,
    sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
  }), [list.debouncedSearchValue, list.state]);
  const data = useAdaptivePagination({ query, queryKey: currencyKeys.page, queryFn: currencyService.getPage });
  const details = useCurrency(selected?.id, dialog === "edit" || dialog === "view");
  const currentItem = dialog === "add" ? null : details.data ?? selected;

  const fail = async (error: Error, key: string) => {
    if (error instanceof ApiClientError && error.status === 409 && error.code === "ConcurrencyConflict") {
      await data.refetch();
      if (selected?.id) await details.refetch();
      setDialog(null);
      setSelected(null);
      showToast.warning(t("currencies.messages.conflictReloaded"));
      return;
    }
    showToast.error(extractErrorMessage(error) || t(key));
  };

  const create = useCreateCurrency({ onSuccess: item => { showToast.success(t("currencies.messages.created", { code: item.currencyCode })); setDialog(null); }, onError: error => { void fail(error, "currencies.messages.createError"); } });
  const update = useUpdateCurrency({ onSuccess: item => { showToast.success(t("currencies.messages.updated", { code: item.currencyCode })); setDialog(null); }, onError: error => { void fail(error, "currencies.messages.updateError"); } });
  const archive = useArchiveCurrency({ onSuccess: () => { showToast.success(t("currencies.messages.archived")); setDialog(null); }, onError: error => { void fail(error, "currencies.messages.archiveError"); } });
  const restore = useRestoreCurrency({ onSuccess: () => { showToast.success(t("currencies.messages.restored")); setDialog(null); }, onError: error => { void fail(error, "currencies.messages.restoreError"); } });

  const select = (item: Currency, next: Dialog) => { setSelected(item); setDialog(next); };
  const submit = async (request: CurrencyMutationRequest) => {
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && currentItem) await update.mutateAsync({ id: currentItem.id, request, rowVersion: currentItem.rowVersion });
  };

  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("currencies.messages.fetchError")}</Alert></Box>;

  return <Box sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: "column", gap: 2 }}>
    <PageHeader title={t("currencies.title")} subTitle={t("currencies.subtitle")} actions={canCreate ? <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setSelected(null); setDialog("add"); }}>{t("currencies.actions.add")}</Button> : undefined} />
    <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
      {data.isFetching && !data.isLoading ? <LinearProgress sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }} /> : null}
      <CurrenciesDataGrid
        rows={data.pageItems} loading={data.isLoading} page={list.state.page} pageSize={list.state.pageSize} totalCount={data.totalCount}
        sortColumn={list.state.columnName} sortDirection={list.state.sortDirection} searchValue={list.state.searchValue}
        searchField={list.state.filters.searchField} searchOperator={list.state.filters.searchOperator} recordStatus={list.state.filters.recordStatus}
        canEdit={canEdit} canArchive={canArchive} canRestore={canRestore}
        onSearchChange={list.setSearchValue} onSearchFieldChange={value => list.setFilters({ ...list.state.filters, searchField: value })}
        onSearchOperatorChange={value => list.setFilters({ ...list.state.filters, searchOperator: value })}
        onRecordStatusChange={value => list.setFilters({ ...list.state.filters, recordStatus: value })} onReset={list.reset}
        onPaginationChange={model => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)}
        onSortChange={model => { const item = model[0]; if (item?.sort) list.setSort(item.field as CurrencySortColumn, item.sort.toUpperCase() as "ASC" | "DESC"); }}
        onView={item => select(item, "view")} onEdit={item => select(item, "edit")} onArchive={item => select(item, "archive")} onRestore={item => select(item, "restore")}
      />
    </Box>
    {(dialog === "add" || dialog === "edit" || dialog === "view") ? <CurrencyForm open mode={dialog} item={currentItem} loading={create.isPending || update.isPending || details.isFetching} detailError={details.error ? extractErrorMessage(details.error) || t("currencies.messages.fetchError") : null} onRetryDetail={() => void details.refetch()} onClose={() => setDialog(null)} onSubmit={submit} /> : null}
    <ConfirmationDialog open={dialog === "archive"} title={t("currencies.confirm.archiveTitle")} description={t("currencies.confirm.archiveDescription")} confirmLabel={t("actions.archive")} cancelLabel={t("actions.cancel")} confirmColor="warning" confirmIcon={<ArchiveRoundedIcon />} icon={<ArchiveRoundedIcon color="warning" />} busy={archive.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void archive.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.currencyCode}</Typography></ConfirmationDialog>
    <ConfirmationDialog open={dialog === "restore"} title={t("currencies.confirm.restoreTitle")} description={t("currencies.confirm.restoreDescription")} confirmLabel={t("actions.restore")} cancelLabel={t("actions.cancel")} confirmColor="success" confirmIcon={<RestoreRoundedIcon />} icon={<RestoreRoundedIcon color="success" />} busy={restore.isPending} onClose={() => setDialog(null)} onConfirm={() => selected && void restore.mutateAsync({ id: selected.id, rowVersion: selected.rowVersion })}><Typography sx={{ fontWeight: 700 }}>{selected?.currencyCode}</Typography></ConfirmationDialog>
  </Box>;
}

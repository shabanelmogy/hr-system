"use client";

import { useFiscalYearLookup } from "@/modules/accounting";
import { permissions } from "@/lib/auth/permissions";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { Alert, Box, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PositionEnvelopeDetails from "../components/PositionEnvelopeDetails";
import PositionEnvelopesMultiView from "../components/PositionEnvelopesMultiView";
import { positionEnvelopeKeys, usePositionEnvelope } from "../hooks/useWorkforceBudgetQueries";
import WorkforceBudgetService from "../services/workforceBudgetService";
import type { PositionEnvelopeListItem, PositionEnvelopePageQuery } from "../types/WorkforceBudget";

interface Filters { fiscalYearId?: number }
const defaultFilters: Filters = { fiscalYearId: undefined };

export default function PositionEnvelopesPage() {
  const { t, i18n } = useTranslation();
  const authorization = usePermissions();
  const [selected, setSelected] = useState<PositionEnvelopeListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const list = useServerListState<PositionEnvelopePageQuery["sortBy"], Filters>({ defaultColumn: "createdOn", defaultSortDirection: "DESC", defaultFilters, defaultPageSize: 10 });
  const query = useMemo<PositionEnvelopePageQuery>(() => ({
    pageNumber: list.state.page + 1,
    pageSize: list.state.pageSize,
    fiscalYearId: list.state.filters.fiscalYearId,
    search: list.debouncedSearchValue || undefined,
    sortBy: list.state.columnName,
    sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
  }), [list.debouncedSearchValue, list.state]);
  const data = useAdaptivePagination({ query, queryKey: positionEnvelopeKeys.page, queryFn: WorkforceBudgetService.getEnvelopePage });
  const detail = usePositionEnvelope(selected?.id, detailsOpen);
  const fiscalYears = useFiscalYearLookup();
  const fiscalOptions = useMemo(() => (fiscalYears.data ?? []).map(year => ({ id: year.id, label: `${year.code} Ã¢â‚¬â€ ${i18n.language.startsWith("ar") ? year.nameAr : year.nameEn}` })), [fiscalYears.data, i18n.language]);
  const canView = authorization.hasPermission(permissions.ViewPositionEnvelopes);

  if (!canView) return <Alert severity="warning">{t("common.accessDenied")}</Alert>;
  if (data.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void data.refetch()}>{t("common.retry")}</Button>}>{extractErrorMessage(data.error) || t("envelopes.messages.fetchError")}</Alert></Box>;
  return <>
    <PositionEnvelopesMultiView items={data.pageItems} loading={data.isLoading} fetching={data.isFetching} page={list.state.page} pageSize={list.state.pageSize} totalCount={data.totalCount} fiscalYears={fiscalOptions}
      searchValue={list.state.searchValue} fiscalYearId={list.state.filters.fiscalYearId} sortColumn={list.state.columnName} sortDirection={list.state.sortDirection}
      onPageChange={list.setPage} onPageSizeChange={list.setPageSize} onSearchChange={list.setSearchValue} onFiscalYearChange={value => list.setFilters({ ...list.state.filters, fiscalYearId: value })} onSortChange={list.setSort} onReset={list.reset} onRefresh={() => void data.refetch()}
    onView={item => { setSelected(item); setDetailsOpen(true); }} />
    {detailsOpen ? <PositionEnvelopeDetails open item={detail.data ?? null} loading={detail.isFetching} detailError={detail.error ? extractErrorMessage(detail.error) || t("envelopes.messages.fetchError") : null} onRetryDetail={() => void detail.refetch()} onClose={() => { setDetailsOpen(false); setSelected(null); }} /> : null}
  </>;
}

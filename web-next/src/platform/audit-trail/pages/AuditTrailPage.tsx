"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Grid } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { FeedbackState } from "@/shared/components/feedback";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { MyDateTimeField, MySelect } from "@/shared/components/forms";
import { AuditTrailTable } from "../components/AuditTrailTable";
import { actionLabel, entityLabel, moduleLabel } from "../components/auditTrailFormat";
import { useAuditTrailFilters, useAuditTrailList } from "../hooks/useAuditTrail";
import { auditActions, type AuditAction, type AuditTrailItem, type AuditTrailQuery } from "../types/auditTrail";
const AuditTrailDetailsDialog = dynamic(() => import("../components/AuditTrailDetailsDialog").then(module => module.AuditTrailDetailsDialog));
interface FilterState { moduleCode: string; entityName: string; entityKey: string; action: AuditAction | ""; from: string | null; to: string | null; }
const emptyFilters: FilterState = { moduleCode: "", entityName: "", entityKey: "", action: "", from: null, to: null };
export default function AuditTrailPage() {
  const { t } = useTranslation();
  const criteria = useServerListState<"occurredOn", FilterState>({ defaultColumn: "occurredOn", defaultFilters: emptyFilters, defaultPageSize: 50 });
  const filters = criteria.state.filters;
  const page = criteria.state.page;
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<AuditTrailItem | null>(null);
  const filterOptions = useAuditTrailFilters();
  const modules = useMemo(() => filterOptions.data ?? [], [filterOptions.data]);
  const entityNames = useMemo(() => [...new Set((filters.moduleCode ? modules.filter(item => item.moduleCode === filters.moduleCode) : modules).flatMap(item => item.entityNames))].sort(), [filters.moduleCode, modules]);
  const invalidDates = Boolean((filters.from && !dayjs(filters.from).isValid()) || (filters.to && !dayjs(filters.to).isValid()) || (filters.from && filters.to && dayjs(filters.from).isAfter(dayjs(filters.to), "day")));
  const query = useMemo<AuditTrailQuery>(() => ({ moduleCode: filters.moduleCode || undefined, entityName: filters.entityName || undefined,
    entityKey: criteria.debouncedSearchValue.trim() || undefined, action: filters.action || undefined,
    fromUtc: filters.from && dayjs(filters.from).isValid() ? dayjs(filters.from).startOf("day").toISOString() : undefined,
    toUtc: filters.to && dayjs(filters.to).isValid() ? dayjs(filters.to).endOf("day").toISOString() : undefined, pageSize: 50 }), [criteria.debouncedSearchValue, filters]);
  const list = useAuditTrailList(query, !invalidDates);
  const pages = list.data?.pages ?? [];
  const items = pages[page]?.items ?? [];
  const update = (patch: Partial<FilterState>) => criteria.setFilters({ ...filters, ...patch });
  const options = (values: string[], label: (value: string) => string) => [{ value: "", label: t("auditLog.all") }, ...values.map(value => ({ value, label: label(value) }))];
  const controls = <>
    <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MySelect all={false} size="small" selectedItem={filters.moduleCode} handleSelectionChange={event => update({ moduleCode: String(event.target.value ?? ""), entityName: "" })} dataSource={options(modules.map(item => item.moduleCode), value => moduleLabel(t, value))} valueMember="value" displayMember="label" label={t("auditLog.module")} showClearButton={false} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MySelect all={false} size="small" selectedItem={filters.entityName} handleSelectionChange={event => update({ entityName: String(event.target.value ?? "") })} dataSource={options(entityNames, value => entityLabel(t, value))} valueMember="value" displayMember="label" label={t("auditLog.recordType")} showClearButton={false} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MySelect all={false} size="small" selectedItem={filters.action} handleSelectionChange={event => update({ action: String(event.target.value ?? "") as AuditAction | "" })} dataSource={options([...auditActions], value => actionLabel(t, value as AuditAction))} valueMember="value" displayMember="label" label={t("auditLog.action")} showClearButton={false} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MyDateTimeField fieldName="auditFrom" mode="date" label={t("auditLog.from")} value={filters.from} onChange={from => update({ from })} /></Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}><MyDateTimeField fieldName="auditTo" mode="date" label={t("auditLog.to")} value={filters.to} onChange={to => update({ to })} error={invalidDates} helperText={invalidDates ? t("errorLogs.invalidRange") : undefined} /></Grid>
  </>;
  const changePage = async (next: number) => {
    if (next < 0 || list.isFetchingNextPage) return;
    if (next < pages.length) { criteria.setPage(next); return; }
    if (next === pages.length && list.hasNextPage) {
      criteria.setPage(next);
      const result = await list.fetchNextPage();
      if (!result.data?.pages[next]) criteria.setPage(page);
    }
  };
  return <ContentWrapper fillAvailable>
    <PageHeader variant="multi-view" storageKey="audit-trail-view" availableViews={["grid"]} defaultView="grid" title={t("auditLog.title")} onRefresh={() => void list.refetch()} onFilter={() => setShowFilters(value => !value)} isFilterBarVisible={showFilters} showActions={{ add: false, refresh: true, filter: true }} />
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}><AuditTrailTable items={list.isError || invalidDates ? [] : items} onSelect={setSelected}
      loading={list.isFetching && !list.isError && !invalidDates} page={page} hasNextPage={list.isPending || !pages[page] ? undefined : page < pages.length - 1 || Boolean(list.hasNextPage)} onPageChange={next => void changePage(next)}
      toolbarFilters={showFilters ? controls : undefined} search={criteria.state.searchValue} onSearchChange={criteria.setSearchValue}
      emptyContent={<FeedbackState icon={<HistoryIcon />} title={t(invalidDates ? "errorLogs.invalidRange" : list.isError ? "auditLog.loadError" : "auditLog.noEntries")} role={list.isError || invalidDates ? "alert" : "status"} actions={list.isError ? <Button onClick={() => void list.refetch()}>{t("auditLog.retry")}</Button> : undefined} />} /></Box>
    {selected ? <AuditTrailDetailsDialog item={selected} onClose={() => setSelected(null)} /> : null}
  </ContentWrapper>;
}

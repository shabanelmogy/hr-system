import CardViewHeader from "@/shared/components/lists/card-view/CardViewHeader";
import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WorkforcePlanListItem, WorkforcePlanPageQuery, WorkforcePlanPermissions } from "../types/WorkforcePlan";
import WorkforcePlansCardView from "./WorkforcePlansCardView";
import WorkforcePlansDataGrid from "./WorkforcePlansDataGrid";

interface LookupOption { id: number; label: string }
interface Props {
  items: WorkforcePlanListItem[]; loading: boolean; fetching: boolean; page: number; pageSize: number; totalCount: number;
  searchValue: string; status: string; recordStatus: "active" | "archived" | "all"; fiscalYearId?: number; sortColumn: WorkforcePlanPageQuery["sortBy"]; sortDirection: "ASC" | "DESC"; fiscalYears: LookupOption[]; permissions: WorkforcePlanPermissions;
  onPageChange: (value: number) => void; onPageSizeChange: (value: number) => void; onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onRecordStatusChange: (value: "active" | "archived" | "all") => void; onFiscalYearChange: (value?: number) => void; onSortChange: (column: WorkforcePlanPageQuery["sortBy"], direction: "ASC" | "DESC") => void; onReset: () => void; onRefresh: () => void; onAdd: () => void;
  onView: (item: WorkforcePlanListItem) => void; onEdit: (item: WorkforcePlanListItem) => void; onLifecycle: (item: WorkforcePlanListItem) => void; onReject: (item: WorkforcePlanListItem) => void; onArchive: (item: WorkforcePlanListItem) => void; onRestore: (item: WorkforcePlanListItem) => void;
}

export default function WorkforcePlansMultiView(props: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const sortOptions: WorkforcePlanPageQuery["sortBy"][] = ["createdOn", "planCode", "titleEn", "titleAr", "status"];
  const statuses = ["all", "draft", "submitted", "underReview", "approved", "rejected", "superseded"];
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("workforcePlanning.title")} storageKey="workforce-plans-view-layout" defaultView="grid" availableViews={["grid", "cards"]} onAdd={props.permissions.canCreate ? props.onAdd : undefined} dataCount={props.totalCount} totalLabel={t("workforcePlanning.totalLabel")} onRefresh={props.onRefresh} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} onFilter={() => setFiltersVisible(value => !value)} isFilterBarVisible={filtersVisible} showActions={{ add: props.permissions.canCreate, refresh: true, export: false, filter: true }} />
    {filtersVisible && view === "cards" ? <CardViewHeader compact showTitleSection={false} title="" mainChipLabel="" page={props.page} searchTerm={props.searchValue} searchPlaceholder={t("workforcePlanning.search.placeholder")} onSearchChange={props.onSearchChange} onClearSearch={() => props.onSearchChange("")} sortBy={props.sortColumn} sortByOptions={sortOptions.map(value => ({ value, label: t(`workforcePlanning.sort.${value}`) }))} onSortByChange={value => props.onSortChange(value as WorkforcePlanPageQuery["sortBy"], props.sortDirection)} sortOrder={props.sortDirection.toLowerCase() as "asc" | "desc"} onSortOrderChange={value => props.onSortChange(props.sortColumn, value.toUpperCase() as "ASC" | "DESC")} filterBy={props.status} filterOptions={statuses.map(value => ({ value, label: t(value === "all" ? "common.all" : `workforcePlanning.status.${value}`) }))} onFilterByChange={props.onStatusChange} onReset={props.onReset} additionalControls={<><TextField select size="small" label={t("workforcePlanning.filters.recordStatus")} value={props.recordStatus} onChange={event => props.onRecordStatusChange(event.target.value as "active" | "archived" | "all")} sx={{ minWidth: 160 }}>{["active", "archived", "all"].map(value => <MenuItem key={value} value={value}>{t(`workforcePlanning.recordStatus.${value}`)}</MenuItem>)}</TextField><TextField select size="small" label={t("workforcePlanning.fields.fiscalYear")} value={props.fiscalYearId ?? 0} onChange={event => props.onFiscalYearChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.fiscalYears.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField></>} /> : null}
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative" }}>
      {props.fetching && !props.loading ? <LinearProgress sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }} /> : null}
      {view === "grid" ? <WorkforcePlansDataGrid {...props} rows={props.items} showFilterBar={filtersVisible} onPaginationChange={(model: GridPaginationModel) => model.pageSize !== props.pageSize ? props.onPageSizeChange(model.pageSize) : props.onPageChange(model.page)} onSortChange={(model: GridSortModel) => { const item = model[0]; if (item?.sort) props.onSortChange(item.field as WorkforcePlanPageQuery["sortBy"], item.sort.toUpperCase() as "ASC" | "DESC"); }} /> : <WorkforcePlansCardView {...props} hasCriteria={Boolean(props.searchValue.trim()) || props.status !== "all" || props.recordStatus !== "active" || Boolean(props.fiscalYearId)} onClear={props.onReset} />}
    </Box>
  </Box>;
}

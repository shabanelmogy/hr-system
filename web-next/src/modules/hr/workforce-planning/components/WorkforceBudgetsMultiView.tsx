import CardViewHeader from "@/shared/components/lists/card-view/CardViewHeader";
import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WorkforceBudgetListItem, WorkforceBudgetPageQuery, WorkforceBudgetPermissions } from "../types/WorkforceBudget";
import WorkforceBudgetsCardView from "./WorkforceBudgetsCardView";
import WorkforceBudgetsDataGrid from "./WorkforceBudgetsDataGrid";

interface LookupOption { id: number; label: string }
interface Props {
  items: WorkforceBudgetListItem[]; loading: boolean; fetching: boolean; page: number; pageSize: number; totalCount: number;
  searchValue: string; status: string; fiscalYearId?: number; workforcePlanId?: number; sortColumn: WorkforceBudgetPageQuery["sortBy"]; sortDirection: "ASC" | "DESC";
  fiscalYears: LookupOption[]; plans: LookupOption[]; permissions: WorkforceBudgetPermissions;
  onPageChange: (value: number) => void; onPageSizeChange: (value: number) => void; onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onFiscalYearChange: (value?: number) => void; onPlanChange: (value?: number) => void; onSortChange: (column: WorkforceBudgetPageQuery["sortBy"], direction: "ASC" | "DESC") => void; onReset: () => void; onRefresh: () => void; onAdd: () => void;
  onView: (item: WorkforceBudgetListItem) => void; onEdit: (item: WorkforceBudgetListItem) => void; onLifecycle: (item: WorkforceBudgetListItem) => void; onReject: (item: WorkforceBudgetListItem) => void;
}

export default function WorkforceBudgetsMultiView(props: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const sortOptions: WorkforceBudgetPageQuery["sortBy"][] = ["createdOn", "budgetCode", "status", "grandTotal"];
  const statuses = ["all", "draft", "submitted", "approved", "rejected", "superseded", "closed"];
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("workforceBudget.title")} storageKey="workforce-budgets-view-layout" defaultView="grid" availableViews={["grid", "cards"]} onAdd={props.permissions.canCreate ? props.onAdd : undefined} dataCount={props.totalCount} totalLabel={t("workforceBudget.totalLabel")} onRefresh={props.onRefresh} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} onFilter={() => setFiltersVisible(value => !value)} isFilterBarVisible={filtersVisible} showActions={{ add: props.permissions.canCreate, refresh: true, export: false, filter: true }} />
    {filtersVisible && view === "cards" ? <CardViewHeader compact showTitleSection={false} title="" mainChipLabel="" page={props.page} searchTerm={props.searchValue} searchPlaceholder={t("workforceBudget.search.placeholder")} onSearchChange={props.onSearchChange} onClearSearch={() => props.onSearchChange("")} sortBy={props.sortColumn} sortByOptions={sortOptions.map(value => ({ value, label: t(`workforceBudget.sort.${value}`) }))} onSortByChange={value => props.onSortChange(value as WorkforceBudgetPageQuery["sortBy"], props.sortDirection)} sortOrder={props.sortDirection.toLowerCase() as "asc" | "desc"} onSortOrderChange={value => props.onSortChange(props.sortColumn, value.toUpperCase() as "ASC" | "DESC")} filterBy={props.status} filterOptions={statuses.map(value => ({ value, label: t(value === "all" ? "common.all" : `workforceBudget.status.${value}`) }))} onFilterByChange={props.onStatusChange} onReset={props.onReset} additionalControls={<><TextField select size="small" label={t("workforceBudget.fields.fiscalYear")} value={props.fiscalYearId ?? 0} onChange={event => props.onFiscalYearChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.fiscalYears.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField><TextField select size="small" label={t("workforceBudget.fields.plan")} value={props.workforcePlanId ?? 0} onChange={event => props.onPlanChange(Number(event.target.value) || undefined)} sx={{ minWidth: 190 }}><MenuItem value={0}>{t("common.all")}</MenuItem>{props.plans.map(value => <MenuItem key={value.id} value={value.id}>{value.label}</MenuItem>)}</TextField></>} /> : null}
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative" }}>
      {props.fetching && !props.loading ? <LinearProgress sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }} /> : null}
      {view === "grid" ? <WorkforceBudgetsDataGrid {...props} rows={props.items} showFilterBar={filtersVisible} onPaginationChange={(model: GridPaginationModel) => model.pageSize !== props.pageSize ? props.onPageSizeChange(model.pageSize) : props.onPageChange(model.page)} onSortChange={(model: GridSortModel) => { const item = model[0]; if (item?.sort) props.onSortChange(item.field as WorkforceBudgetPageQuery["sortBy"], item.sort.toUpperCase() as "ASC" | "DESC"); }} /> : <WorkforceBudgetsCardView {...props} hasCriteria={Boolean(props.searchValue.trim()) || props.status !== "all" || Boolean(props.fiscalYearId) || Boolean(props.workforcePlanId)} onClear={props.onReset} />}
    </Box>
  </Box>;
}

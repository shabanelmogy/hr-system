import { PageHeader } from "@/shared/components/navigation/header";
import CardViewHeader from "@/shared/components/lists/card-view/CardViewHeader";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FiscalYearLifecycleFilter, FiscalYearListItem, FiscalYearPermissions, FiscalYearRecordStatus, FiscalYearSearchField, FiscalYearSearchOperator, FiscalYearSortColumn } from "../types/FiscalYear";
import FiscalYearsCardView from "./FiscalYearsCardView";
import FiscalYearsDataGrid from "./FiscalYearsDataGrid";

interface Props {
  items: FiscalYearListItem[]; loading: boolean; fetching: boolean; page: number; pageSize: number; totalCount: number; permissions: FiscalYearPermissions;
  searchValue: string; searchField: FiscalYearSearchField; searchOperator: FiscalYearSearchOperator; sortColumn: FiscalYearSortColumn; sortDirection: "ASC" | "DESC"; recordStatus: FiscalYearRecordStatus; lifecycleStatus: FiscalYearLifecycleFilter;
  onPageChange: (value: number) => void; onPageSizeChange: (value: number) => void; onSearchChange: (value: string) => void; onSearchFieldChange: (value: FiscalYearSearchField) => void; onSearchOperatorChange: (value: FiscalYearSearchOperator) => void; onSortChange: (column: FiscalYearSortColumn, direction: "ASC" | "DESC") => void; onRecordStatusChange: (value: FiscalYearRecordStatus) => void; onLifecycleStatusChange: (value: FiscalYearLifecycleFilter) => void; onReset: () => void; onRefresh: () => void; onAdd: () => void;
  onView: (item: FiscalYearListItem) => void; onEdit: (item: FiscalYearListItem) => void; onArchive: (item: FiscalYearListItem) => void; onRestore: (item: FiscalYearListItem) => void; onLifecycle: (item: FiscalYearListItem) => void;
}

export default function FiscalYearsMultiView(props: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const searchFields: FiscalYearSearchField[] = ["all", "code", "nameAr", "nameEn"];
  const operators: FiscalYearSearchOperator[] = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
  const sortOptions: FiscalYearSortColumn[] = ["startDate", "endDate", "code", "nameAr", "nameEn", "status", "createdOn"];
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("fiscalYears.title")} storageKey="fiscal-years-view-layout" defaultView="grid" availableViews={["grid", "cards"]} onAdd={props.permissions.canCreate ? props.onAdd : undefined} dataCount={props.totalCount} totalLabel={t("fiscalYears.totalLabel")} onRefresh={props.onRefresh} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} onFilter={() => setFiltersVisible(value => !value)} isFilterBarVisible={filtersVisible} showActions={{ add: props.permissions.canCreate, refresh: true, export: false, filter: true }} />
    {filtersVisible && view === "cards" ? <CardViewHeader compact showTitleSection={false} title="" mainChipLabel="" page={props.page}
      searchTerm={props.searchValue} searchPlaceholder={t("fiscalYears.search.placeholder")} onSearchChange={props.onSearchChange} onClearSearch={() => props.onSearchChange("")}
      sortBy={props.sortColumn} sortByOptions={sortOptions.map(value => ({ value, label: t(`fiscalYears.sort.${value}`) }))} onSortByChange={value => props.onSortChange(value as FiscalYearSortColumn, props.sortDirection)} sortOrder={props.sortDirection.toLowerCase() as "asc" | "desc"} onSortOrderChange={value => props.onSortChange(props.sortColumn, value.toUpperCase() as "ASC" | "DESC")}
      filterBy={props.recordStatus} filterOptions={(["active", "archived", "all"] as const).map(value => ({ value, label: t(`fiscalYears.recordStatus.${value}`) }))} onFilterByChange={value => props.onRecordStatusChange(value as FiscalYearRecordStatus)} onReset={props.onReset}
      beforeSearchControls={<><TextField select size="small" label={t("fiscalYears.search.column")} value={props.searchField} onChange={event => props.onSearchFieldChange(event.target.value as FiscalYearSearchField)} sx={{ minWidth: 150 }}>{searchFields.map(value => <MenuItem key={value} value={value}>{t(`fiscalYears.search.fields.${value}`)}</MenuItem>)}</TextField><TextField select size="small" label={t("fiscalYears.search.condition")} value={props.searchOperator} onChange={event => props.onSearchOperatorChange(event.target.value as FiscalYearSearchOperator)} sx={{ minWidth: 170 }}>{operators.map(value => <MenuItem key={value} value={value}>{t(`fiscalYears.search.operators.${value}`)}</MenuItem>)}</TextField></>}
      additionalControls={<TextField select size="small" label={t("fiscalYears.filters.lifecycle")} value={props.lifecycleStatus} onChange={event => props.onLifecycleStatusChange(event.target.value as FiscalYearLifecycleFilter)} sx={{ minWidth: 150 }}>{(["all", "draft", "open", "closing", "closed", "locked"] as const).map(value => <MenuItem key={value} value={value}>{t(`fiscalYears.status.${value}`)}</MenuItem>)}</TextField>}
    /> : null}
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative" }}>
      {props.fetching && !props.loading ? <LinearProgress sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }} /> : null}
      {view === "grid" ? <FiscalYearsDataGrid {...props} rows={props.items} showFilterBar={filtersVisible} onPaginationChange={(model: GridPaginationModel) => model.pageSize !== props.pageSize ? props.onPageSizeChange(model.pageSize) : props.onPageChange(model.page)} onSortChange={(model: GridSortModel) => { const item = model[0]; if (item?.sort) props.onSortChange(item.field as FiscalYearSortColumn, item.sort.toUpperCase() as "ASC" | "DESC"); }} /> : <FiscalYearsCardView {...props} hasCriteria={!!props.searchValue.trim() || props.recordStatus !== "active" || props.lifecycleStatus !== "all"} onClear={props.onReset} />}
    </Box>
  </Box>;
}

import CardViewHeader from "@/shared/components/lists/card-view/CardViewHeader";
import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PositionEnvelopeListItem, PositionEnvelopePageQuery } from "../types/WorkforceBudget";
import PositionEnvelopesCardView from "./PositionEnvelopesCardView";
import PositionEnvelopesDataGrid from "./PositionEnvelopesDataGrid";

interface LookupOption { id: number; label: string }
interface Props {
  items: PositionEnvelopeListItem[]; loading: boolean; fetching: boolean; page: number; pageSize: number; totalCount: number;
  searchValue: string; fiscalYearId?: number; sortColumn: PositionEnvelopePageQuery["sortBy"]; sortDirection: "ASC" | "DESC";
  fiscalYears: LookupOption[];
  onPageChange: (value: number) => void; onPageSizeChange: (value: number) => void; onSearchChange: (value: string) => void; onFiscalYearChange: (value?: number) => void; onSortChange: (column: PositionEnvelopePageQuery["sortBy"], direction: "ASC" | "DESC") => void; onReset: () => void; onRefresh: () => void;
  onView: (item: PositionEnvelopeListItem) => void;
}

export default function PositionEnvelopesMultiView(props: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<"grid" | "cards">("grid");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const sortOptions: PositionEnvelopePageQuery["sortBy"][] = ["createdOn", "envelopeCode"];
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minWidth: 0 }}>
    <PageHeader variant="multi-view" title={t("envelopes.title")} storageKey="position-envelopes-view-layout" defaultView="grid" availableViews={["grid", "cards"]} dataCount={props.totalCount} totalLabel={t("envelopes.totalLabel")} onRefresh={props.onRefresh} onViewTypeChange={value => (value === "grid" || value === "cards") && setView(value)} onFilter={() => setFiltersVisible(value => !value)} isFilterBarVisible={filtersVisible} showActions={{ add: false, refresh: true, export: false, filter: true }} />
    {filtersVisible && view === "cards" ? <CardViewHeader compact showTitleSection={false} title="" mainChipLabel="" page={props.page} searchTerm={props.searchValue} searchPlaceholder={t("envelopes.search.placeholder")} onSearchChange={props.onSearchChange} onClearSearch={() => props.onSearchChange("")} sortBy={props.sortColumn} sortByOptions={sortOptions.map(value => ({ value, label: t(`envelopes.sort.${value}`) }))} onSortByChange={value => props.onSortChange(value as PositionEnvelopePageQuery["sortBy"], props.sortDirection)} sortOrder={props.sortDirection.toLowerCase() as "asc" | "desc"} onSortOrderChange={value => props.onSortChange(props.sortColumn, value.toUpperCase() as "ASC" | "DESC")} filterBy={props.fiscalYearId ? String(props.fiscalYearId) : "all"} filterOptions={[{ value: "all", label: t("common.all") }, ...props.fiscalYears.map(value => ({ value: String(value.id), label: value.label }))]} onFilterByChange={value => props.onFiscalYearChange(value === "all" ? undefined : Number(value))} onReset={props.onReset} /> : null}
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative" }}>
      {props.fetching && !props.loading ? <LinearProgress sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }} /> : null}
      {view === "grid" ? <PositionEnvelopesDataGrid {...props} rows={props.items} showFilterBar={filtersVisible} onPaginationChange={(model: GridPaginationModel) => model.pageSize !== props.pageSize ? props.onPageSizeChange(model.pageSize) : props.onPageChange(model.page)} onSortChange={(model: GridSortModel) => { const item = model[0]; if (item?.sort) props.onSortChange(item.field as PositionEnvelopePageQuery["sortBy"], item.sort.toUpperCase() as "ASC" | "DESC"); }} /> : <PositionEnvelopesCardView {...props} hasCriteria={Boolean(props.searchValue.trim()) || Boolean(props.fiscalYearId)} onClear={props.onReset} />}
    </Box>
  </Box>;
}

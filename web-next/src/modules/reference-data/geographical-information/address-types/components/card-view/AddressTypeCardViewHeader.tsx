import { Archive } from "@mui/icons-material";
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, Radio, TextField } from "@mui/material";
import { CardViewHeader } from "@/shared/components/lists/card-view";
import { useTranslation } from "react-i18next";
import type { AddressTypeCardViewHeaderProps } from "./AddressTypeCard.types";

/** Same shared server-criteria header used by the States card view. */
export default function AddressTypeCardViewHeader(props: AddressTypeCardViewHeaderProps) {
  const { t } = useTranslation();
  return <CardViewHeader
    title={t("addressTypes.mainTitle")}
    subtitle={t("addressTypes.listSummary", { count: props.totalCount })}
    mainChipLabel={t("addressTypes.totalCount", { count: props.totalCount })}
    page={props.page}
    showTitleSection={false}
    compact
    searchTerm={props.searchTerm}
    searchPlaceholder={t("addressTypes.search.placeholder")}
    onSearchChange={props.onSearchChange}
    onClearSearch={() => props.onSearchChange("")}
    beforeSearchControls={<><Grid size={{ xs: 12, sm: 6, lg: 2 }}><TextField select fullWidth size="small" label={t("addressTypes.search.column")} value={props.searchField} onChange={(event) => props.onSearchFieldChange(event.target.value as typeof props.searchField)}><MenuItem value="all">{t("addressTypes.search.allColumns")}</MenuItem><MenuItem value="nameEn">{t("general.nameEn")}</MenuItem><MenuItem value="nameAr">{t("general.nameAr")}</MenuItem></TextField></Grid><Grid size={{ xs: 12, sm: 6, lg: 2 }}><TextField select fullWidth size="small" label={t("addressTypes.search.condition")} value={props.searchOperator} onChange={(event) => props.onSearchOperatorChange(event.target.value as typeof props.searchOperator)}>{["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"].map((value) => <MenuItem key={value} value={value}>{t(`addressTypes.search.operators.${value}`)}</MenuItem>)}</TextField></Grid></>}
    sortBy={props.sortBy}
    sortByOptions={[{ value: "nameEn", label: t("general.nameEn") }, { value: "nameAr", label: t("general.nameAr") }, { value: "createdOn", label: t("general.createdOn") }]}
    onSortByChange={(value) => props.onSortChange(value as typeof props.sortBy, props.sortOrder)}
    sortOrder={props.sortOrder.toLowerCase() as "asc" | "desc"}
    onSortOrderChange={(value) => props.onSortChange(props.sortBy, value.toUpperCase() as typeof props.sortOrder)}
    filterBy={props.filterBy}
    filterOptions={[{ value: "active", label: t("addressTypes.status.active") }, { value: "archived", label: t("addressTypes.status.archived") }, { value: "all", label: t("addressTypes.status.all") }]}
    onFilterByChange={(value) => props.onFilterChange(value as typeof props.filterBy)}
    onReset={props.onReset}
    showFilter={false}
    optionsLabel={t("actions.gridOptions")}
    optionsContent={(closeMenu) => <><MenuItem disabled><ListItemText primary={t("addressTypes.status.label")} /></MenuItem>{(["active", "archived", "all"] as const).map((value) => <MenuItem key={value} selected={props.filterBy === value} onClick={() => { closeMenu(); props.onFilterChange(value); }}><ListItemIcon><Radio checked={props.filterBy === value} size="small" /></ListItemIcon><ListItemText primary={t(`addressTypes.status.${value}`)} /></MenuItem>)}{props.canBulkArchive ? <><Divider component="li" /><MenuItem disabled={props.selectedCount === 0 || props.isBulkArchiving} onClick={() => { closeMenu(); props.onBulkArchive(); }} sx={{ color: "warning.main" }}><ListItemIcon><Archive fontSize="small" /></ListItemIcon><ListItemText primary={t("addressTypes.bulkArchiveAction", { count: props.selectedCount })} /></MenuItem></> : null}</>}
  />;
}

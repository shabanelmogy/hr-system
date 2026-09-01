import { CardViewHeader as SharedCardViewHeader } from "@/shared/components/lists/card-view";
import { Grid, ListItemIcon, ListItemText, MenuItem, Radio, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { organizationalResourceSupportsParent, type OrganizationalResource, type OrganizationalSearchField, type OrganizationalSearchOperator, type OrganizationalStatus } from "../../types/OrganizationalStructure";

interface Props {
  resource: OrganizationalResource;
  search: string;
  searchField: OrganizationalSearchField;
  searchOperator: OrganizationalSearchOperator;
  sortBy: "nameEn" | "nameAr" | "code" | "parent" | "createdOn";
  sortDirection: "asc" | "desc";
  status: OrganizationalStatus;
  totalCount: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: OrganizationalSearchField) => void;
  onSearchOperatorChange: (value: OrganizationalSearchOperator) => void;
  onSortChange: (column: Props["sortBy"], direction: Props["sortDirection"]) => void;
  onStatusChange: (value: OrganizationalStatus) => void;
  onReset: () => void;
}

const operators: OrganizationalSearchOperator[] = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];

export default function OrganizationalStructureCardViewHeader(props: Props) {
  const { t } = useTranslation();
  const statusOptions: OrganizationalStatus[] = props.resource === "job-descriptions" ? ["active", "archived", "all", "draft", "approved", "rejected", "expired"] : ["active", "archived", "all"];
  return <SharedCardViewHeader
    title={t("organizationalStructure.title")}
    subtitle={t("organizationalStructure.filterOptionsDescription")}
    mainChipLabel={t(`organizationalStructure.resources.${props.resource}`)}
    page={props.page}
    showTitleSection={false}
    compact
    searchTerm={props.search}
    searchPlaceholder={t("organizationalStructure.search")}
    onSearchChange={props.onSearchChange}
    onClearSearch={() => props.onSearchChange("")}
    beforeSearchControls={<>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}><TextField select fullWidth size="small" label={t("organizationalStructure.searchColumn")} value={props.searchField} onChange={(event) => props.onSearchFieldChange(event.target.value as OrganizationalSearchField)}>
        <MenuItem value="all">{t("organizationalStructure.allColumns")}</MenuItem><MenuItem value="nameEn">{t("organizationalStructure.fields.nameEn")}</MenuItem><MenuItem value="nameAr">{t("organizationalStructure.fields.nameAr")}</MenuItem><MenuItem value="code">{t("organizationalStructure.fields.code")}</MenuItem>{organizationalResourceSupportsParent(props.resource) ? <MenuItem value="parent">{t("organizationalStructure.fields.parent")}</MenuItem> : null}
      </TextField></Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}><TextField select fullWidth size="small" label={t("organizationalStructure.searchCondition")} value={props.searchOperator} onChange={(event) => props.onSearchOperatorChange(event.target.value as OrganizationalSearchOperator)}>
        {operators.map((value) => <MenuItem key={value} value={value}>{t(`organizationalStructure.${value}`)}</MenuItem>)}
      </TextField></Grid>
    </>}
    sortBy={props.sortBy}
    sortByOptions={[{ value: "nameEn", label: t("organizationalStructure.fields.nameEn") }, { value: "nameAr", label: t("organizationalStructure.fields.nameAr") }, { value: "code", label: t("organizationalStructure.fields.code") }, ...(organizationalResourceSupportsParent(props.resource) ? [{ value: "parent", label: t("organizationalStructure.fields.parent") }] : []), { value: "createdOn", label: t("general.createdOn") }]}
    onSortByChange={(value) => props.onSortChange(value as Props["sortBy"], props.sortDirection)}
    sortOrder={props.sortDirection}
    onSortOrderChange={(value) => props.onSortChange(props.sortBy, value)}
    filterBy={props.status}
    filterOptions={statusOptions.map((value) => ({ value, label: t(`organizationalStructure.status.${value}`) }))}
    onFilterByChange={(value) => props.onStatusChange(value as OrganizationalStatus)}
    onReset={props.onReset}
    showFilter={false}
    optionsLabel={t("actions.gridOptions")}
    optionsContent={(closeMenu) => <>
      <MenuItem disabled><ListItemText primary={t("organizationalStructure.fields.status")} /></MenuItem>
      {statusOptions.map((value) => <MenuItem key={value} selected={props.status === value} onClick={() => { closeMenu(); props.onStatusChange(value); }}><ListItemIcon><Radio checked={props.status === value} size="small" /></ListItemIcon><ListItemText primary={t(`organizationalStructure.status.${value}`)} /></MenuItem>)}
    </>}
  />;
}

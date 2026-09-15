import { CardViewHeader as SharedCardViewHeader } from "@/shared/components/lists/card-view";
import { Archive } from "@mui/icons-material";
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, Radio, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { DistrictCardViewHeaderProps } from "./DistrictCard.types";

const DistrictCardViewHeader = ({
  searchTerm,
  searchField,
  searchOperator,
  sortBy,
  sortOrder,
  filterBy,
  processedDistrictsLength,
  page,
  onSearchChange,
  onSearchFieldChange,
  onSearchOperatorChange,
  onSortChange,
  onFilterByChange,
  onClearSearch,
  onReset,
  selectedCount,
  canBulkArchive,
  isBulkArchiving,
  onBulkArchive,
}: DistrictCardViewHeaderProps) => {
  const { t } = useTranslation();

  return (
    <SharedCardViewHeader
      title={t("districts.mainTitle")}
      subtitle={t("districts.listSummary", { count: processedDistrictsLength })}
      mainChipLabel={t("districts.totalCount", { count: processedDistrictsLength })}
      page={page}
      showTitleSection={false}
      compact
      searchTerm={searchTerm}
      searchPlaceholder={t("districts.search.placeholder")}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      beforeSearchControls={
        <>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("districts.search.column")}
              value={searchField}
              onChange={(event) => onSearchFieldChange(event.target.value as typeof searchField)}
            >
              <MenuItem value="all">{t("districts.search.allColumns")}</MenuItem>
              <MenuItem value="nameEn">{t("general.nameEn")}</MenuItem>
              <MenuItem value="nameAr">{t("general.nameAr")}</MenuItem>
              <MenuItem value="code">{t("districts.code")}</MenuItem>
              <MenuItem value="state">{t("districts.state")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("districts.search.condition")}
              value={searchOperator}
              onChange={(event) => onSearchOperatorChange(event.target.value as typeof searchOperator)}
            >
              <MenuItem value="contains">{t("districts.search.operators.contains")}</MenuItem>
              <MenuItem value="doesNotContain">{t("districts.search.operators.doesNotContain")}</MenuItem>
              <MenuItem value="equals">{t("districts.search.operators.equals")}</MenuItem>
              <MenuItem value="doesNotEqual">{t("districts.search.operators.doesNotEqual")}</MenuItem>
              <MenuItem value="startsWith">{t("districts.search.operators.startsWith")}</MenuItem>
              <MenuItem value="endsWith">{t("districts.search.operators.endsWith")}</MenuItem>
            </TextField>
          </Grid>
        </>
      }
      sortBy={sortBy}
      sortByOptions={[
        { value: "nameEn", label: t("general.nameEn") },
        { value: "nameAr", label: t("general.nameAr") },
        { value: "code", label: t("districts.code") },
        { value: "state", label: t("districts.state") },
        { value: "createdOn", label: t("districts.createdDate") },
      ]}
      onSortByChange={(value) => onSortChange(value as typeof sortBy, sortOrder)}
      sortOrder={sortOrder.toLowerCase() as "asc" | "desc"}
      onSortOrderChange={(value) => onSortChange(sortBy, value.toUpperCase() as typeof sortOrder)}
      filterBy={filterBy}
      filterOptions={[
        { value: "active", label: t("districts.status.active") },
        { value: "archived", label: t("districts.status.archived") },
        { value: "all", label: t("districts.status.all") },
      ]}
      onFilterByChange={(value) => onFilterByChange(value as typeof filterBy)}
      onReset={onReset}
      showFilter={false}
      optionsLabel={t("actions.gridOptions")}
      optionsContent={(closeMenu) => (
        <>
          <MenuItem disabled>
            <ListItemText primary={t("districts.status.label")} />
          </MenuItem>
          {(["active", "archived", "all"] as const).map((value) => (
            <MenuItem
              key={value}
              selected={filterBy === value}
              onClick={() => {
                closeMenu();
                onFilterByChange(value);
              }}
            >
              <ListItemIcon><Radio checked={filterBy === value} size="small" /></ListItemIcon>
              <ListItemText primary={t(`districts.status.${value}`)} />
            </MenuItem>
          ))}
          {canBulkArchive && (
            <>
              <Divider component="li" />
              <MenuItem
                disabled={selectedCount === 0 || isBulkArchiving}
                onClick={() => {
                  closeMenu();
                  onBulkArchive();
                }}
                sx={{ color: "warning.main" }}
              >
                <ListItemIcon><Archive fontSize="small" /></ListItemIcon>
                <ListItemText primary={t("districts.bulkArchiveAction", { count: selectedCount })} />
              </MenuItem>
            </>
          )}
        </>
      )}
    />
  );
};

export default DistrictCardViewHeader;

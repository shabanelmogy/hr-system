import { CardViewHeader as SharedCardViewHeader } from "@/shared/components/lists/card-view";
import { Archive } from "@mui/icons-material";
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, Radio, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { StateCardViewHeaderProps } from "./StateCard.types";

const StateCardViewHeader = ({
  searchTerm,
  searchField,
  searchOperator,
  sortBy,
  sortOrder,
  filterBy,
  processedStatesLength,
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
}: StateCardViewHeaderProps) => {
  const { t } = useTranslation();

  return (
    <SharedCardViewHeader
      title={t("states.mainTitle")}
      subtitle={t("states.listSummary", { count: processedStatesLength })}
      mainChipLabel={t("states.totalCount", { count: processedStatesLength })}
      page={page}
      showTitleSection={false}
      compact
      searchTerm={searchTerm}
      searchPlaceholder={t("states.search.placeholder")}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      beforeSearchControls={
        <>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("states.search.column")}
              value={searchField}
              onChange={(event) => onSearchFieldChange(event.target.value as typeof searchField)}
            >
              <MenuItem value="all">{t("states.search.allColumns")}</MenuItem>
              <MenuItem value="nameEn">{t("general.nameEn")}</MenuItem>
              <MenuItem value="nameAr">{t("general.nameAr")}</MenuItem>
              <MenuItem value="code">{t("states.code")}</MenuItem>
              <MenuItem value="country">{t("states.country")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("states.search.condition")}
              value={searchOperator}
              onChange={(event) => onSearchOperatorChange(event.target.value as typeof searchOperator)}
            >
              <MenuItem value="contains">{t("states.search.operators.contains")}</MenuItem>
              <MenuItem value="doesNotContain">{t("states.search.operators.doesNotContain")}</MenuItem>
              <MenuItem value="equals">{t("states.search.operators.equals")}</MenuItem>
              <MenuItem value="doesNotEqual">{t("states.search.operators.doesNotEqual")}</MenuItem>
              <MenuItem value="startsWith">{t("states.search.operators.startsWith")}</MenuItem>
              <MenuItem value="endsWith">{t("states.search.operators.endsWith")}</MenuItem>
            </TextField>
          </Grid>
        </>
      }
      sortBy={sortBy}
      sortByOptions={[
        { value: "nameEn", label: t("general.nameEn") },
        { value: "nameAr", label: t("general.nameAr") },
        { value: "code", label: t("states.code") },
        { value: "country", label: t("states.country") },
        { value: "createdOn", label: t("states.createdDate") },
      ]}
      onSortByChange={(value) => onSortChange(value as typeof sortBy, sortOrder)}
      sortOrder={sortOrder.toLowerCase() as "asc" | "desc"}
      onSortOrderChange={(value) => onSortChange(sortBy, value.toUpperCase() as typeof sortOrder)}
      filterBy={filterBy}
      filterOptions={[
        { value: "active", label: t("states.status.active") },
        { value: "archived", label: t("states.status.archived") },
        { value: "all", label: t("states.status.all") },
      ]}
      onFilterByChange={(value) => onFilterByChange(value as typeof filterBy)}
      onReset={onReset}
      showFilter={false}
      optionsLabel={t("actions.gridOptions")}
      optionsContent={(closeMenu) => (
        <>
          <MenuItem disabled>
            <ListItemText primary={t("states.status.label")} />
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
              <ListItemText primary={t(`states.status.${value}`)} />
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
                <ListItemText primary={t("states.bulkArchiveAction", { count: selectedCount })} />
              </MenuItem>
            </>
          )}
        </>
      )}
    />
  );
};

export default StateCardViewHeader;

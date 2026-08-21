import { CardViewHeader as SharedCardViewHeader } from "@/shared/components/lists/card-view";
import { Archive } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CountryCardViewHeaderProps } from "./CountryCard.types";
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, Radio, TextField } from "@mui/material";

const CountryCardViewHeader = ({
  searchTerm,
  searchField,
  searchOperator,
  sortBy,
  sortOrder,
  filterBy,
  processedCountriesLength,
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
}: CountryCardViewHeaderProps) => {
  const { t } = useTranslation();
  return (
    <SharedCardViewHeader
      title={t("countries.mainTitle")}
      subtitle={t("countries.listSummary", { count: processedCountriesLength })}
      mainChipLabel={t("countries.totalCount", { count: processedCountriesLength })}
      page={page}
      showTitleSection={false}
      compact

      searchTerm={searchTerm}
      searchPlaceholder={t("countries.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}

      beforeSearchControls={
        <>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("countries.search.column")}
              value={searchField}
              onChange={(event) => onSearchFieldChange(event.target.value as typeof searchField)}
            >
              <MenuItem value="all">{t("countries.search.allColumns")}</MenuItem>
              <MenuItem value="nameAr">{t("general.nameAr")}</MenuItem>
              <MenuItem value="nameEn">{t("general.nameEn")}</MenuItem>
              <MenuItem value="alpha2Code">{t("countries.alpha2Code")}</MenuItem>
              <MenuItem value="alpha3Code">{t("countries.alpha3Code")}</MenuItem>
              <MenuItem value="phoneCode">{t("countries.phoneCode")}</MenuItem>
              <MenuItem value="currencyCode">{t("countries.currencyCode")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("countries.search.condition")}
              value={searchOperator}
              onChange={(event) => onSearchOperatorChange(event.target.value as typeof searchOperator)}
            >
              <MenuItem value="contains">{t("countries.search.operators.contains")}</MenuItem>
              <MenuItem value="doesNotContain">{t("countries.search.operators.doesNotContain")}</MenuItem>
              <MenuItem value="equals">{t("countries.search.operators.equals")}</MenuItem>
              <MenuItem value="doesNotEqual">{t("countries.search.operators.doesNotEqual")}</MenuItem>
              <MenuItem value="startsWith">{t("countries.search.operators.startsWith")}</MenuItem>
              <MenuItem value="endsWith">{t("countries.search.operators.endsWith")}</MenuItem>
            </TextField>
          </Grid>
        </>
      }

      sortBy={sortBy}
      sortByOptions={[
        { value: "nameEn", label: t("general.nameEn") },
        { value: "nameAr", label: t("general.nameAr") },
        { value: "alpha2Code", label: t("countries.alpha2Code") },
        { value: "alpha3Code", label: t("countries.alpha3Code") },
        { value: "currencyCode", label: t("countries.currencyCode") },
        { value: "createdOn", label: t("countries.createdDate") },
      ]}
      onSortByChange={(value) => onSortChange(value as typeof sortBy, sortOrder)}

      sortOrder={sortOrder.toLowerCase() as "asc" | "desc"}
      onSortOrderChange={(value) => onSortChange(sortBy, value.toUpperCase() as typeof sortOrder)}

      filterBy={filterBy}
      filterOptions={[
        { value: "active", label: t("countries.status.active") },
        { value: "archived", label: t("countries.status.archived") },
        { value: "all", label: t("countries.status.all") },
      ]}
      onFilterByChange={(value) => onFilterByChange(value as typeof filterBy)}

      onReset={onReset}
      showFilter={false}
      optionsLabel={t("actions.gridOptions")}
      optionsContent={(closeMenu) => (
        <>
          <MenuItem disabled>
            <ListItemText primary={t("countries.status.label")} />
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
              <ListItemText primary={t(`countries.status.${value}`)} />
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
                <ListItemText primary={t("countries.bulkArchiveAction", { count: selectedCount })} />
              </MenuItem>
            </>
          )}
        </>
      )}
    />
  );
};

export default CountryCardViewHeader;

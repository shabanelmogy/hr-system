import { CardViewHeader as SharedCardViewHeader } from "@/shared/components/lists/card-view";
import { useTranslation } from "react-i18next";
import { CountryCardViewHeaderProps } from "./CountryCard.types";
import { Grid, MenuItem, TextField } from "@mui/material";

const CountryCardViewHeader = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  currencyCode,
  hasStatesFilter,
  processedCountriesLength,
  page,
  onSearchChange,
  onSortChange,
  onFilterByChange,
  onCurrencyCodeChange,
  onHasStatesFilterChange,
  onClearSearch,
  onReset,
}: CountryCardViewHeaderProps) => {
  const { t } = useTranslation();
  return (
    <SharedCardViewHeader
      title={t("countries.mainTitle")}
      subtitle={t("countries.listSummary", { count: processedCountriesLength })}
      mainChipLabel={t("countries.totalCount", { count: processedCountriesLength })}
      page={page}

      searchTerm={searchTerm}
      searchPlaceholder={t("countries.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}

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
      additionalControls={
        <>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t("countries.currencyFilter")}
              value={currencyCode}
              onChange={(event) => onCurrencyCodeChange(event.target.value.toUpperCase())}
              error={currencyCode.length > 0 && currencyCode.length !== 3}
              helperText={currencyCode.length > 0 && currencyCode.length !== 3 ? t("countries.currencyFilterLength") : " "}
              slotProps={{ htmlInput: { maxLength: 3, inputMode: "text" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("countries.statesFilter")}
              value={hasStatesFilter}
              onChange={(event) => onHasStatesFilterChange(event.target.value as typeof hasStatesFilter)}
            >
              <MenuItem value="all">{t("countries.statesFilterOptions.all")}</MenuItem>
              <MenuItem value="with">{t("countries.statesFilterOptions.with")}</MenuItem>
              <MenuItem value="without">{t("countries.statesFilterOptions.without")}</MenuItem>
            </TextField>
          </Grid>
        </>
      }
    />
  );
};

export default CountryCardViewHeader;

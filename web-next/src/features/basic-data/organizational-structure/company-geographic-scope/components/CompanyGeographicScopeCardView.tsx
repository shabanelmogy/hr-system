"use client";

import { AppChip, EntityCard } from "@/shared/components/cards";
import { CardViewHeader, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Box, Chip, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyCountryOption } from "../types/CompanyGeographicScope";

interface CompanyGeographicScopeCardViewProps {
  countries: CompanyCountryOption[];
  defaultCountryId: number;
  registrationCountryId: number;
  loading?: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export default function CompanyGeographicScopeCardView({
  countries,
  defaultCountryId,
  registrationCountryId,
  loading = false,
  searchTerm,
  onSearchTermChange,
  sortOrder,
  onSortOrderChange,
}: CompanyGeographicScopeCardViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  if (loading) return <CardViewSkeleton />;

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0, width: "100%" }}>
      <CardViewHeader
        title={t("companyGeographicScope.title")}
        mainChipLabel={t("companyGeographicScope.selectedCount", { count: countries.length })}
        page={0}
        showTitleSection={false}
        compact
        searchTerm={searchTerm}
        searchPlaceholder={t("companyGeographicScope.searchPlaceholder")}
        onSearchChange={onSearchTermChange}
        onClearSearch={() => onSearchTermChange("")}
        sortBy="name"
        sortByOptions={[{ value: "name", label: t("companyGeographicScope.sortByName") }]}
        onSortByChange={() => undefined}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        filterBy="all"
        filterOptions={[]}
        onFilterByChange={() => undefined}
        onReset={() => {
          onSearchTermChange("");
          onSortOrderChange("asc");
        }}
        showFilter={false}
      />
      {countries.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            {t(searchTerm.trim()
              ? "companyGeographicScope.noSearchResults"
              : "companyGeographicScope.selectOperatingCountriesFirst")}
          </Typography>
        </Paper>
      ) : <Box sx={{ flex: 1, minHeight: 0, overflowX: "hidden", overflowY: "auto", minWidth: 0, p: { xs: 0.5, sm: 1, md: 1.5 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {countries.map((country, index) => {
          const isDefault = country.id === defaultCountryId;
          const isRegistrationCountry = country.id === registrationCountryId;
          const primaryName = theme.direction === "rtl" ? country.nameAr : country.nameEn;
          const secondaryName = theme.direction === "rtl" ? country.nameEn : country.nameAr;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={country.id}>
              <EntityCard
                index={index}
                isHovered={hoveredCard === country.id}
                onMouseEnter={() => setHoveredCard(country.id)}
                onMouseLeave={() => setHoveredCard(null)}
                height={300}
                sx={{ height: { xs: 260, sm: 280, md: 300 } }}
                title={primaryName}
                subtitle={secondaryName}
                chips={(
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                    {country.alpha2Code ? <AppChip label={country.alpha2Code} colorKey="primary" variant="soft" monospace bold /> : null}
                    {country.alpha3Code ? <AppChip label={country.alpha3Code} colorKey="secondary" variant="soft" monospace bold /> : null}
                    <Chip size="small" color="success" label={t("companyGeographicScope.selected")} />
                    {isRegistrationCountry ? <Chip size="small" color="info" label={t("companyGeographicScope.registrationCountry")} /> : null}
                    {isDefault ? <Chip size="small" color="primary" label={t("companyGeographicScope.defaultOperatingCountry")} /> : null}
                  </Stack>
                )}
              />
            </Grid>
          );
        })}
        </Grid>
      </Box>}
    </Box>
  );
}

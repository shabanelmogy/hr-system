"use client";

import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyCountryOption } from "../types/CompanyGeographicScope";
import { filterCompanyCountries } from "./companyGeographicScopeGridUtils";
import CompanyGeographicScopeCardView from "./CompanyGeographicScopeCardView";
import CompanyGeographicScopeDataGrid from "./CompanyGeographicScopeDataGrid";

type CompanyGeographicScopeView = "grid" | "cards";

interface CompanyGeographicScopeMultiViewProps {
  countries: CompanyCountryOption[];
  defaultCountryId: number;
  registrationCountryId: number;
  selectionControls: ReactNode;
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function CompanyGeographicScopeMultiView({
  countries,
  defaultCountryId,
  registrationCountryId,
  selectionControls,
  isFetching = false,
  onRefresh,
}: CompanyGeographicScopeMultiViewProps) {
  const { i18n, t } = useTranslation();
  const [currentView, setCurrentView] = useState<CompanyGeographicScopeView>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [cardSortOrder, setCardSortOrder] = useState<"asc" | "desc">("asc");
  const filteredCountries = useMemo(
    () => filterCompanyCountries(countries, searchTerm).sort((left, right) => {
      const language = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
      const comparison = (language === "ar" ? left.nameAr : left.nameEn)
        .localeCompare(language === "ar" ? right.nameAr : right.nameEn, language);
      return cardSortOrder === "asc" ? comparison : -comparison;
    }),
    [cardSortOrder, countries, i18n.resolvedLanguage, searchTerm],
  );

  const handleViewChange = useCallback((view: string) => {
    if (view === "grid" || view === "cards") setCurrentView(view);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <PageHeader
        variant="multi-view"
        title={t("companyGeographicScope.title")}
        storageKey="company-geographic-scope-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards"]}
        dataCount={countries.length}
        totalLabel={t("companyGeographicScope.operatingCountries")}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        showActions={{ add: false, refresh: true, export: false, filter: false }}
        additionalChips={[{
          color: "primary",
          variant: "outlined",
          label: t("companyGeographicScope.selectedCount", { count: countries.length }),
        }]}
      />
      <Typography
        variant="subtitle1"
        sx={{ mb: 1, fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        {t("companyGeographicScope.selectionSectionTitle")}
      </Typography>
      {selectionControls}

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {isFetching ? <LinearProgress aria-label={t("companyGeographicScope.loading")} sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }} /> : null}
        {currentView === "grid" ? (
          <CompanyGeographicScopeDataGrid
            countries={countries}
            defaultCountryId={defaultCountryId}
            registrationCountryId={registrationCountryId}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />
        ) : (
          <CompanyGeographicScopeCardView
            countries={filteredCountries}
            defaultCountryId={defaultCountryId}
            registrationCountryId={registrationCountryId}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            sortOrder={cardSortOrder}
            onSortOrderChange={setCardSortOrder}
          />
        )}
      </Box>
    </Box>
  );
}

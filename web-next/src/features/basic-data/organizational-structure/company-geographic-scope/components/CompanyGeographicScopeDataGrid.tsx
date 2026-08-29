"use client";

import { Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import type { CompanyCountryOption } from "../types/CompanyGeographicScope";
import { filterCompanyCountries } from "./companyGeographicScopeGridUtils";

interface CompanyGeographicScopeDataGridProps {
  countries: CompanyCountryOption[];
  defaultCountryId: number;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export default function CompanyGeographicScopeDataGrid({
  countries,
  defaultCountryId,
  searchTerm,
  onSearchTermChange,
}: CompanyGeographicScopeDataGridProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
  const rows = useMemo(
    () => filterCompanyCountries(countries, searchTerm),
    [countries, searchTerm],
  );

  const columns = useMemo<GridColDef<CompanyCountryOption>[]>(() => [
    {
      field: "nameAr",
      headerName: t("general.nameAr"),
      minWidth: 220,
      flex: 1,
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      minWidth: 220,
      flex: 1,
    },
    {
      field: "alpha2Code",
      headerName: t("countries.alpha2Code"),
      minWidth: 130,
      flex: 0.45,
    },
    {
      field: "alpha3Code",
      headerName: t("countries.alpha3Code"),
      minWidth: 130,
      flex: 0.45,
    },
    {
      field: "selected",
      headerName: t("companyGeographicScope.selectedColumn"),
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: () => (
        <Chip
          size="small"
          color="success"
          label={t("companyGeographicScope.selected")}
        />
      ),
    },
    {
      field: "default",
      headerName: t("companyGeographicScope.defaultColumn"),
      minWidth: 130,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => row.id === defaultCountryId ? (
        <Chip size="small" color="primary" label={t("companyGeographicScope.defaultOperatingCountry")} />
      ) : null,
    },
  ], [
    defaultCountryId,
    t,
  ]);

  return (
    <ContentWrapper fillAvailable>
      <MyDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        paginationMode="client"
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 5 } },
        }}
        initialSortModel={[{
          field: language === "ar" ? "nameAr" : "nameEn",
          sort: "asc",
        }]}
        showNavigationButtons={false}
        showToolbar
        toolbarSearch={{
          value: searchTerm,
          placeholder: t("companyGeographicScope.searchPlaceholder"),
          onChange: onSearchTermChange,
          onClear: () => onSearchTermChange(""),
        }}
        autoSelectFirstRow={false}
        localeText={{
          noRowsLabel: t(searchTerm.trim()
            ? "companyGeographicScope.noSearchResults"
            : "companyGeographicScope.selectOperatingCountriesFirst"),
          noResultsOverlayLabel: t("companyGeographicScope.noSearchResults"),
        }}
        sx={{
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          "& .MuiDataGrid-cell": { py: 0.5 },
          "& .MuiDataGrid-row": { minHeight: "44px !important" },
        }}
      />
    </ContentWrapper>
  );
}

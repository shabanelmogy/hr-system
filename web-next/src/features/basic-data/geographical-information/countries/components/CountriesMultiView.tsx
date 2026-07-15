import { MultiViewHeader } from "@/shared/components/common";
import { useCollectionExports } from "@/shared/hooks/useCollectionExports";
import { Box } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GridApiCommon } from "@mui/x-data-grid";
import type { Country } from "../types/Country";
import CountriesCardView from "./CountriesCardView";
import CountriesChartView from "./CountriesChartView";
import CountriesDataGrid from "./grid-view/CountriesDataGrid";
import CountryReportPage from "../reports/pages/CountryReportPage";
import ImportCountries from "./import-data/ImportCountries";

const countryExportColumns = [
  "id",
  "nameAr",
  "nameEn",
  "alpha2Code",
  "alpha3Code",
  "phoneCode",
  "currencyCode",
  "states",
  "createdOn",
  "updatedOn",
] as const;

interface CountriesMultiViewProps {
  countries: Country[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApiCommon | null>;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const CountriesMultiView = ({
  countries,
  loading,
  isFetching = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: CountriesMultiViewProps) => {
  const { i18n, t } = useTranslation();
  const [currentViewType, setCurrentViewType] = useState<"grid" | "cards" | "chart" | "report" | "import">("grid");
  const culture = i18n.resolvedLanguage?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const exportFileName = t("countries.title") || "Countries";
  const exportRows = useMemo(
    () =>
      countries.map((country) => ({
        id: country.id,
        nameAr: country.nameAr,
        nameEn: country.nameEn,
        alpha2Code: country.alpha2Code,
        alpha3Code: country.alpha3Code,
        phoneCode: country.phoneCode,
        currencyCode: country.currencyCode,
        states: (country.states ?? [])
          .filter((state) => !state.isDeleted)
          .map((state) => (culture === "ar" ? state.nameAr : state.nameEn))
          .join(", "),
        createdOn: country.createdOn,
        updatedOn: country.updatedOn,
      })),
    [countries, culture],
  );
  const { exportOptions } = useCollectionExports({
    rows: exportRows,
    columns: countryExportColumns,
    fileName: exportFileName,
    culture,
    reportHeader: exportFileName,
    disabled: loading || exportRows.length === 0,
  });

  const handleViewTypeChange = useCallback((newViewType: string) => {
    switch (newViewType) {
      case "grid":
      case "cards":
      case "chart":
      case "report":
      case "import":
        setCurrentViewType(newViewType);
    }
  }, []);

  const renderView = () => {
    switch (currentViewType) {
      case "grid":
        return (
          <CountriesDataGrid
            countries={countries}
            loading={loading}
            isFetching={isFetching}
            apiRef={apiRef}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAdd={onAdd}
            onRefresh={onRefresh}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
          />
        );
      case "cards":
        return (
          <CountriesCardView
            countries={countries}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAdd={onAdd}
            onRefresh={onRefresh}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
          />
        );
      case "chart":
        return (
          <CountriesChartView
            countries={countries}
            loading={loading}
            onAdd={onAdd}
          />
        );
      case "report":
        return <CountryReportPage />;
      case "import":
        return <ImportCountries />;
      default:
        return (
          <CountriesDataGrid
            countries={countries}
            loading={loading}
            isFetching={isFetching}
            apiRef={apiRef}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAdd={onAdd}
            onRefresh={onRefresh}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Shared Multi-View Header */}
      <MultiViewHeader
        title={t("countries.viewTitle") || "Countries Management"}
        titleIcon={null}
        onBack={() => {}}
        storageKey="countries-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards", "chart", "report", "import"]}
        viewLabels={{
          grid: t("countries.views.grid") || "Grid",
          cards: t("countries.views.cards") || "Cards",
          chart: t("countries.views.chart") || "Chart",
          report: t("countries.views.report") || "Report",
          import: t("countries.views.import") || "Import",
        }}
        onAdd={onAdd}
        dataCount={countries?.length || 0}
        totalLabel={t("countries.total") || "Total"}
        onRefresh={onRefresh}
        exportOptions={exportOptions}
        onViewTypeChange={handleViewTypeChange}
        showActions={{
          add: true,
          refresh: true,
          export: true,
          filter: false,
        }}
      />

      {/* Scrollable View Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // Important for flex child to allow shrinking
          overflow: "auto", // Allow content to scroll independently
          position: "relative",
        }}
      >
        {renderView()}
      </Box>
    </Box>
  );
};

export default CountriesMultiView;

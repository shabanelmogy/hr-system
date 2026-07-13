import { MultiViewHeader } from "@/shared/components/common";
import { Box } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GridApiCommon } from "@mui/x-data-grid";
import type { Country } from "../types/Country";
import CountriesCardView from "./CountriesCardView";
import CountriesChartView from "./CountriesChartView";
import CountriesDataGrid from "./grid-view/CountriesDataGrid";
import CountryReportPage from "../reports/pages/CountryReportPage";
import ImportCountries from "./import-data/ImportCountries";

interface CountriesMultiViewProps {
  countries: Country[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
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
  const { t } = useTranslation();
  const [currentViewType, setCurrentViewType] = useState<"grid" | "cards" | "chart" | "report" | "import">("grid");

  // Use original countries and loading states (search is handled within specific views when applicable)

  const handleExport = () => {
    // Export is handled by MyDataGrid's built-in toolbar export button
    // This handler is kept for future custom export logic if needed
  };

  const handleViewTypeChange = useCallback((newViewType: "grid" | "cards" | "chart" | "report" | "import") => {
    setCurrentViewType(newViewType);
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
        onExport={handleExport}
        onViewTypeChange={handleViewTypeChange}
        showActions={{
          add: true,
          refresh: true,
          export: false,
          filter: false,
        }} onFilter={undefined}/>

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

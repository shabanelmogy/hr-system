import { MultiViewHeader } from "@/shared/components/common";
import { useCollectionExports } from "@/shared/hooks";
import { Box } from "@mui/material";
import type { GridApiCommon } from "@mui/x-data-grid";
import { useCallback, useMemo, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { State } from "../types/State";
import StatesCardView from "./StatesCardView";
import StatesChartView from "./StatesChartView";
import StatesDataGrid from "./grid-view/StatesDataGrid";

const stateExportColumns = [
  "id",
  "nameAr",
  "nameEn",
  "code",
  "country",
  "createdOn",
  "updatedOn",
] as const;

interface StatesMultiViewProps {
  states: State[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: RefObject<GridApiCommon>;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const StatesMultiView = ({
  states,
  loading,
  isFetching,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: StatesMultiViewProps) => {
  const { i18n, t } = useTranslation();
  // Initialize with default, will be updated by MultiViewHeader
  const [currentViewType, setCurrentViewType] = useState("grid");
  const viewLoading = loading || Boolean(isFetching);
  const culture = i18n.resolvedLanguage?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const exportFileName = t("states.title") || "States";
  const exportRows = useMemo(
    () =>
      states.map((state) => ({
        id: state.id,
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        code: state.code,
        country:
          culture === "ar"
            ? state.country?.nameAr ?? state.country?.nameEn ?? ""
            : state.country?.nameEn ?? state.country?.nameAr ?? "",
        createdOn: state.createdOn,
        updatedOn: state.updatedOn,
      })),
    [culture, states],
  );
  const { exportOptions } = useCollectionExports({
    rows: exportRows,
    columns: stateExportColumns,
    fileName: exportFileName,
    culture,
    reportHeader: exportFileName,
    disabled: viewLoading || exportRows.length === 0,
  });

  const handleViewTypeChange = useCallback((newViewType) => {
    setCurrentViewType(newViewType);
  }, []);

  const renderView = () => {
    const commonProps = {
      states,
      loading: viewLoading,
      onEdit,
      onDelete,
      onView,
      onAdd,
      onRefresh,
      lastAddedId,
      lastEditedId,
      lastDeletedIndex,
    };

    switch (currentViewType) {
      case "grid":
        return <StatesDataGrid {...commonProps} apiRef={apiRef} />;
      case "cards":
        return <StatesCardView {...commonProps} />;
      case "chart":
        return <StatesChartView {...commonProps} />;
      default:
        return <StatesDataGrid {...commonProps} apiRef={apiRef} />;
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
        title={t("states.viewTitle") || "States Management"}
        storageKey="states-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards", "chart"]}
        viewLabels={{
          grid: t("states.views.grid") || "Grid",
          cards: t("states.views.cards") || "Cards",
          chart: t("states.views.chart") || "Chart",
        }}
        onAdd={onAdd}
        dataCount={states?.length || 0}
        totalLabel={t("states.total") || "Total"}
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

export default StatesMultiView;

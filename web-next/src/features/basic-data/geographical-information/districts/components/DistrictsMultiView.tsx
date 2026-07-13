import { MultiViewHeader } from "@/shared/components/common";
import { Box } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GridApiCommon } from "@mui/x-data-grid";
import type { District } from "../types/District";
import DistrictsCardView from "./DistrictsCardView";
import DistrictsChartView from "./DistrictsChartView";
import DistrictsDataGrid from "./grid-view/DistrictsDataGrid";

interface DistrictsMultiViewProps {
  districts: District[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
  onView: (district: District) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const DistrictsMultiView = ({
  districts,
  loading,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: DistrictsMultiViewProps) => {
  const { t } = useTranslation();
  const [currentViewType, setCurrentViewType] = useState<"grid" | "cards" | "chart">("grid");

  const handleViewTypeChange = useCallback((newViewType: "grid" | "cards" | "chart") => {
    setCurrentViewType(newViewType);
  }, []);

  const renderView = () => {
    switch (currentViewType) {
      case "grid":
        return (
          <DistrictsDataGrid
            districts={districts}
            loading={loading}
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
          <DistrictsCardView
            districts={districts}
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
          <DistrictsChartView
            districts={districts}
            loading={loading}
            onAdd={onAdd}
          />
        );
      default:
        return (
          <DistrictsDataGrid
            districts={districts}
            loading={loading}
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative" }}>
      <MultiViewHeader
        title={t("districts.viewTitle") || "Districts Management"}
        storageKey="districts-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards", "chart"]}
        viewLabels={{
          grid: t("districts.views.grid") || "Grid",
          cards: t("districts.views.cards") || "Cards",
          chart: t("districts.views.chart") || "Chart",
        }}
        onAdd={onAdd}
        dataCount={districts?.length || 0}
        totalLabel={t("districts.total") || "Total"}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewTypeChange}
        showActions={{ add: true, refresh: true, export: false, filter: false }}
        onFilter={undefined}
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative" }}>{renderView()}</Box>
    </Box>
  );
};

export default DistrictsMultiView;

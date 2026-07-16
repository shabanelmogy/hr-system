import MultiViewHeader from "@/shared/components/common/header/MultiViewHeader";
import { useCollectionExports } from "@/shared/hooks/useCollectionExports";
import { Box } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GridApi } from "@mui/x-data-grid";
import type { AddressType } from "../types/AddressType";
import AddressTypesDataGrid from "./grid-view/AddressTypesDataGrid";
import AddressTypesCardView from "./AddressTypesCardView";
import AddressTypesChartView from "./AddressTypesChartView";

const addressTypeExportColumns = [
  "id",
  "nameAr",
  "nameEn",
  "createdOn",
  "updatedOn",
] as const;

interface AddressTypesMultiViewProps {
  items: AddressType[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const AddressTypesMultiView = ({
  items,
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
}: AddressTypesMultiViewProps) => {
  const { i18n, t } = useTranslation();
  const [currentViewType, setCurrentViewType] = useState<
    "grid" | "cards" | "chart"
  >("grid");
  const culture = i18n.resolvedLanguage?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const exportFileName = t("addressTypes.title") || "Address Types";
  const exportRows = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        createdOn: item.createdOn,
        updatedOn: item.updatedOn,
      })),
    [items],
  );
  const { exportOptions } = useCollectionExports({
    rows: exportRows,
    columns: addressTypeExportColumns,
    fileName: exportFileName,
    culture,
    reportHeader: exportFileName,
    disabled: loading || exportRows.length === 0,
  });

  const handleViewTypeChange = useCallback(
    (newViewType: string) => {
      switch (newViewType) {
        case "grid":
        case "cards":
        case "chart":
          setCurrentViewType(newViewType);
      }
    },
    []
  );

  const renderView = () => {
    switch (currentViewType) {
      case "grid":
        return (
          <AddressTypesDataGrid
            items={items}
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
          <AddressTypesCardView
            items={items}
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
          <AddressTypesChartView
            items={items}
            loading={loading}
            onAdd={onAdd}
          />
        );
      default:
        return (
          <AddressTypesDataGrid
            items={items}
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <MultiViewHeader
        title={t("addressTypes.viewTitle") || "Address Types Management"}
        storageKey="addressTypes-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards", "chart"]}
        viewLabels={{
          grid: t("addressTypes.views.grid") || "Grid",
          cards: t("addressTypes.views.card") || "Cards",
          chart: t("addressTypes.views.chart") || "Chart",
        }}
        onAdd={onAdd}
        dataCount={items?.length || 0}
        totalLabel={t("addressTypes.total") || "Total"}
        onRefresh={onRefresh}
        exportOptions={exportOptions}
        onViewTypeChange={handleViewTypeChange}
        showActions={{ add: true, refresh: true, export: true, filter: false }}
      />

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative" }}
      >
        {renderView()}
      </Box>
    </Box>
  );
};

export default AddressTypesMultiView;

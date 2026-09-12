import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress } from "@mui/material";
import type { GridApi, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  DistrictListItem,
  DistrictSearchField,
  DistrictSearchOperator,
  DistrictSortColumn,
  DistrictStatus,
} from "../types/District";
import type { DistrictPermissionSet } from "../utils/districtPermissions";
import { isDistrictManagementView, type DistrictManagementView } from "../utils/districtViews";
import DistrictsCardView from "./DistrictsCardView";
import DistrictsChartView from "./DistrictsChartView";
import DistrictCardViewHeader from "./card-view/DistrictCardViewHeader";
import DistrictsDataGrid from "./grid-view/DistrictsDataGrid";
import ImportDistricts from "./import-data/ImportDistricts";
import DistrictReportPage from "../reports/pages/DistrictReportPage";

const sortableColumns = new Set<DistrictSortColumn>(["nameEn", "nameAr", "code", "state", "createdOn"]);

interface DistrictsMultiViewProps {
  districts: DistrictListItem[];
  gridDistricts: DistrictListItem[];
  paginationMode: "client" | "server";
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (district: DistrictListItem) => void;
  onDelete: (district: DistrictListItem) => void;
  onRestore: (district: DistrictListItem) => void;
  onView: (district: DistrictListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: DistrictPermissionSet;
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: DistrictSearchField;
  searchOperator: DistrictSearchOperator;
  sortColumn: DistrictSortColumn;
  sortDirection: "ASC" | "DESC";
  filter: DistrictStatus;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: DistrictSearchField) => void;
  onSearchOperatorChange: (value: DistrictSearchOperator) => void;
  onSortChange: (column: DistrictSortColumn, direction: "ASC" | "DESC") => void;
  onFilterChange: (value: DistrictStatus) => void;
  onResetList: () => void;
  selectedDistrictIds: number[];
  onSelectedDistrictIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving: boolean;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
}

export default function DistrictsMultiView({
  districts, gridDistricts, paginationMode, loading, isFetching = false, apiRef,
  onEdit, onDelete, onRestore, onView, onAdd, onRefresh, permissions, totalCount,
  page, pageSize, searchValue, searchField, searchOperator, sortColumn, sortDirection,
  filter, onPageChange, onPageSizeChange, onSearchChange, onSearchFieldChange,
  onSearchOperatorChange, onSortChange, onFilterChange, onResetList, selectedDistrictIds,
  onSelectedDistrictIdsChange, onBulkArchive, isBulkArchiving, lastAddedId, lastEditedId,
}: DistrictsMultiViewProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<DistrictManagementView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const visibleView = currentView === "import" && !permissions.canCreate
    ? "grid"
    : currentView;
  const hasActiveCriteria = searchValue.trim().length > 0 || filter !== "active";

  const handleViewChange = useCallback((view: string) => {
    if (!isDistrictManagementView(view)) return;
    if (view !== "import" || permissions.canCreate) {
      if (view === "chart" && page !== 0) onPageChange(0);
      setCurrentView(view);
    }
  }, [onPageChange, page, permissions.canCreate]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
    else onPageChange(model.page);
  }, [onPageChange, onPageSizeChange, pageSize]);

  const handleGridSortChange = useCallback((model: GridSortModel) => {
    const next = model[0];
    if (!next?.sort || !sortableColumns.has(next.field as DistrictSortColumn)) return;
    onSortChange(next.field as DistrictSortColumn, next.sort.toUpperCase() as "ASC" | "DESC");
  }, [onSortChange]);

  const handleImportReconcile = useCallback(() => {
    onRefresh();
    setCurrentView("grid");
  }, [onRefresh]);

  const availableViews: DistrictManagementView[] = permissions.canCreate
    ? ["grid", "cards", "chart", "report", "import"]
    : ["grid", "cards", "chart", "report"];
  const supportsFilterBar = visibleView !== "import";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <PageHeader
        variant="multi-view"
        title={t("districts.viewTitle")}
        storageKey="districts-view-layout"
        defaultView="grid"
        availableViews={availableViews}
        onAdd={permissions.canCreate ? onAdd : undefined}
        dataCount={totalCount}
        totalLabel={t("districts.total")}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        onFilter={supportsFilterBar ? () => setIsFilterBarVisible((visible) => !visible) : undefined}
        isFilterBarVisible={isFilterBarVisible}
        showActions={{ add: permissions.canCreate, refresh: true, export: false, filter: supportsFilterBar }}
      />

      {isFilterBarVisible && (visibleView === "cards" || visibleView === "chart") && (
        <DistrictCardViewHeader
          searchTerm={searchValue}
          searchField={searchField}
          searchOperator={searchOperator}
          sortBy={sortColumn}
          sortOrder={sortDirection}
          filterBy={filter}
          processedDistrictsLength={totalCount}
          page={page}
          onSearchChange={onSearchChange}
          onSearchFieldChange={onSearchFieldChange}
          onSearchOperatorChange={onSearchOperatorChange}
          onSortChange={onSortChange}
          onFilterByChange={onFilterChange}
          onClearSearch={() => onSearchChange("")}
          onReset={onResetList}
          selectedCount={selectedDistrictIds.length}
          canBulkArchive={visibleView === "cards" && permissions.canDelete}
          isBulkArchiving={isBulkArchiving}
          onBulkArchive={onBulkArchive}
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflow: visibleView === "cards" || visibleView === "chart" ? "hidden" : "auto", position: "relative" }}>
        {isFetching && !loading ? <LinearProgress aria-label={t("common.loading")} sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }} /> : null}
        {visibleView === "grid" ? (
          <DistrictsDataGrid
            districts={gridDistricts}
            paginationMode={paginationMode}
            loading={loading}
            apiRef={apiRef}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onView={onView}
            permissions={permissions}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            searchValue={searchValue}
            searchField={searchField}
            searchOperator={searchOperator}
            status={filter}
            onSearchChange={onSearchChange}
            onSearchFieldChange={onSearchFieldChange}
            onSearchOperatorChange={onSearchOperatorChange}
            onStatusChange={onFilterChange}
            onReset={onResetList}
            selectedDistrictIds={selectedDistrictIds}
            onSelectedDistrictIdsChange={onSelectedDistrictIdsChange}
            onBulkArchive={onBulkArchive}
            isBulkArchiving={isBulkArchiving}
            showFilterBar={isFilterBarVisible}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleGridSortChange}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
          />
        ) : null}
        {visibleView === "cards" ? (
          <DistrictsCardView
            districts={districts}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onView={onView}
            onAdd={onAdd}
            onRefresh={onRefresh}
            permissions={permissions}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            searchValue={searchValue}
            hasActiveCriteria={hasActiveCriteria}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onClearCriteria={onResetList}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            selectedDistrictIds={selectedDistrictIds}
            onSelectedDistrictIdsChange={onSelectedDistrictIdsChange}
          />
        ) : null}
        {visibleView === "chart" ? <DistrictsChartView districts={districts} totalCount={totalCount} loading={loading} onAdd={permissions.canCreate ? onAdd : undefined} /> : null}
        {visibleView === "report" ? <DistrictReportPage showFilterBar={isFilterBarVisible} /> : null}
        {visibleView === "import" && permissions.canCreate ? (
          <ImportDistricts onReconcile={handleImportReconcile} />
        ) : null}
      </Box>
    </Box>
  );
}

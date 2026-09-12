import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress } from "@mui/material";
import type { GridApi, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  StateListItem,
  StateSearchField,
  StateSearchOperator,
  StateSortColumn,
  StateStatus,
} from "../types/State";
import type { StatePermissionSet } from "../utils/statePermissions";
import {
  isStateManagementView,
  type StateManagementView,
} from "../utils/stateViews";
import StatesCardView from "./StatesCardView";
import StatesChartView from "./StatesChartView";
import StateCardViewHeader from "./card-view/StateCardViewHeader";
import StatesDataGrid from "./grid-view/StatesDataGrid";
import ImportStates from "./import-data/ImportStates";
import StateReportPage from "../reports/pages/StateReportPage";

const sortableColumns = new Set<StateSortColumn>([
  "nameEn",
  "nameAr",
  "code",
  "country",
  "createdOn",
]);

interface StatesMultiViewProps {
  states: StateListItem[];
  gridStates: StateListItem[];
  paginationMode: "client" | "server";
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onRestore: (state: StateListItem) => void;
  onView: (state: StateListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: StatePermissionSet;
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: StateSearchField;
  searchOperator: StateSearchOperator;
  sortColumn: StateSortColumn;
  sortDirection: "ASC" | "DESC";
  filter: StateStatus;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: StateSearchField) => void;
  onSearchOperatorChange: (value: StateSearchOperator) => void;
  onSortChange: (column: StateSortColumn, direction: "ASC" | "DESC") => void;
  onFilterChange: (value: StateStatus) => void;
  onResetList: () => void;
  selectedStateIds: number[];
  onSelectedStateIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving: boolean;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const StatesMultiView = ({
  states,
  gridStates,
  paginationMode,
  loading,
  isFetching = false,
  apiRef,
  onEdit,
  onDelete,
  onRestore,
  onView,
  onAdd,
  onRefresh,
  permissions,
  totalCount,
  page,
  pageSize,
  searchValue,
  searchField,
  searchOperator,
  sortColumn,
  sortDirection,
  filter,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSearchFieldChange,
  onSearchOperatorChange,
  onSortChange,
  onFilterChange,
  onResetList,
  selectedStateIds,
  onSelectedStateIdsChange,
  onBulkArchive,
  isBulkArchiving,
  lastAddedId,
  lastEditedId,
}: StatesMultiViewProps) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<StateManagementView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const visibleView = currentView === "import" && !permissions.canCreate
    ? "grid"
    : currentView;

  const handleViewChange = useCallback((view: string) => {
    if (!isStateManagementView(view)) return;
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
    if (!next?.sort || !sortableColumns.has(next.field as StateSortColumn)) return;
    onSortChange(next.field as StateSortColumn, next.sort.toUpperCase() as "ASC" | "DESC");
  }, [onSortChange]);

  const handleImportReconcile = useCallback(() => {
    onRefresh();
    setCurrentView("grid");
  }, [onRefresh]);

  const hasActiveCriteria = searchValue.trim().length > 0 || filter !== "active";
  const availableViews: StateManagementView[] = permissions.canCreate
    ? ["grid", "cards", "chart", "report", "import"]
    : ["grid", "cards", "chart", "report"];
  const supportsFilterBar = visibleView !== "import";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <PageHeader
        variant="multi-view"
        title={t("states.viewTitle")}
        storageKey="states-view-layout"
        defaultView="grid"
        availableViews={availableViews}
        onAdd={permissions.canCreate ? onAdd : undefined}
        dataCount={totalCount}
        totalLabel={t("states.total")}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        onFilter={supportsFilterBar ? () => setIsFilterBarVisible((visible) => !visible) : undefined}
        isFilterBarVisible={isFilterBarVisible}
        showActions={{ add: permissions.canCreate, refresh: true, export: false, filter: supportsFilterBar }}
      />

      {isFilterBarVisible && (visibleView === "cards" || visibleView === "chart") && (
        <StateCardViewHeader
          searchTerm={searchValue}
          searchField={searchField}
          searchOperator={searchOperator}
          sortBy={sortColumn}
          sortOrder={sortDirection}
          filterBy={filter}
          processedStatesLength={totalCount}
          page={page}
          onSearchChange={onSearchChange}
          onSearchFieldChange={onSearchFieldChange}
          onSearchOperatorChange={onSearchOperatorChange}
          onSortChange={onSortChange}
          onFilterByChange={onFilterChange}
          onClearSearch={() => onSearchChange("")}
          onReset={onResetList}
          selectedCount={selectedStateIds.length}
          canBulkArchive={currentView === "cards" && permissions.canDelete}
          isBulkArchiving={isBulkArchiving}
          onBulkArchive={onBulkArchive}
        />
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: visibleView === "cards" || visibleView === "chart" ? "hidden" : "auto",
          overflowY: visibleView === "cards" || visibleView === "chart" ? "hidden" : "auto",
          position: "relative",
        }}
      >
        {isFetching && !loading ? (
          <LinearProgress
            aria-label={t("common.loading")}
            sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }}
          />
        ) : null}
        {visibleView === "grid" && (
          <StatesDataGrid
            states={gridStates}
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
            selectedStateIds={selectedStateIds}
            onSelectedStateIdsChange={onSelectedStateIdsChange}
            onBulkArchive={onBulkArchive}
            isBulkArchiving={isBulkArchiving}
            showFilterBar={isFilterBarVisible}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleGridSortChange}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
          />
        )}
        {visibleView === "cards" && (
          <StatesCardView
            states={states}
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
            selectedStateIds={selectedStateIds}
            onSelectedStateIdsChange={onSelectedStateIdsChange}
          />
        )}
        {visibleView === "chart" && (
          <StatesChartView
            states={states}
            totalCount={totalCount}
            loading={loading}
            onAdd={permissions.canCreate ? onAdd : undefined}
          />
        )}
        {visibleView === "report" && <StateReportPage showFilterBar={isFilterBarVisible} />}
        {visibleView === "import" && permissions.canCreate && (
          <ImportStates onReconcile={handleImportReconcile} />
        )}
      </Box>
    </Box>
  );
};

export default StatesMultiView;

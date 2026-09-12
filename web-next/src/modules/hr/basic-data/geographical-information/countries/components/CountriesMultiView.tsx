import { PageHeader } from "@/shared/components/navigation/header";
import { Box, LinearProgress } from "@mui/material";
import type { GridApi, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CountryListItem,
  CountrySearchField,
  CountrySearchOperator,
  CountrySortColumn,
  CountryStatus,
} from "../types/Country";
import CountriesCardView from "./CountriesCardView";
import CountriesChartView from "./CountriesChartView";
import type { CountryActionPermissions } from "./card-view/CountryCard.types";
import CountryCardViewHeader from "./card-view/CountryCardViewHeader";
import CountriesDataGrid from "./grid-view/CountriesDataGrid";
import ImportCountries from "./import-data/ImportCountries";
import CountryReportPage from "../reports/pages/CountryReportPage";

type CountryView = "grid" | "cards" | "chart" | "report" | "import";

interface CountriesMultiViewProps {
  countries: CountryListItem[];
  gridCountries: CountryListItem[];
  paginationMode: "client" | "server";
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
  permissions: CountryActionPermissions & { canCreate: boolean };
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: CountrySearchField;
  searchOperator: CountrySearchOperator;
  sortColumn: CountrySortColumn;
  sortDirection: "ASC" | "DESC";
  filter: CountryStatus;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (field: CountrySearchField) => void;
  onSearchOperatorChange: (operator: CountrySearchOperator) => void;
  onSortChange: (column: CountrySortColumn, direction: "ASC" | "DESC") => void;
  onFilterChange: (filter: CountryStatus) => void;
  onResetList: () => void;
  selectedCountryIds: number[];
  onSelectedCountryIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving: boolean;
}

const sortableColumns = new Set<CountrySortColumn>([
  "nameEn",
  "nameAr",
  "alpha2Code",
  "alpha3Code",
  "currencyCode",
  "createdOn",
]);

const CountriesMultiView = ({
  countries,
  gridCountries,
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
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
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
  selectedCountryIds,
  onSelectedCountryIdsChange,
  onBulkArchive,
  isBulkArchiving,
}: CountriesMultiViewProps) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<CountryView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const visibleView = currentView === "import" && !permissions.canCreate
    ? "grid"
    : currentView;

  const handleViewChange = useCallback((view: string) => {
    if (
      view === "grid" ||
      view === "cards" ||
      view === "chart" ||
      view === "report" ||
      view === "import"
    ) {
      if (view !== "import" || permissions.canCreate) {
        if (view === "chart" && page !== 0) onPageChange(0);
        setCurrentView(view);
      }
    }
  }, [onPageChange, page, permissions.canCreate]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
    else onPageChange(model.page);
  }, [onPageChange, onPageSizeChange, pageSize]);

  const handleGridSortChange = useCallback((model: GridSortModel) => {
    const next = model[0];
    if (!next?.sort || !sortableColumns.has(next.field as CountrySortColumn)) return;
    onSortChange(next.field as CountrySortColumn, next.sort.toUpperCase() as "ASC" | "DESC");
  }, [onSortChange]);

  const handleImportReconcile = useCallback(() => {
    onRefresh();
    setCurrentView("grid");
  }, [onRefresh]);

  const activeFilterCount = Number(filter !== "active");
  const hasActiveCriteria = searchValue.trim().length > 0 || activeFilterCount > 0;
  const availableViews: CountryView[] = permissions.canCreate
    ? ["grid", "cards", "chart", "report", "import"]
    : ["grid", "cards", "chart", "report"];
  const supportsFilterBar = visibleView !== "import";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <PageHeader
        variant="multi-view"
        title={t("countries.viewTitle")}
        storageKey="countries-view-layout"
        defaultView="grid"
        availableViews={availableViews}
        onAdd={permissions.canCreate ? onAdd : undefined}
        dataCount={totalCount}
        totalLabel={t("countries.total")}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        onFilter={supportsFilterBar ? () => setIsFilterBarVisible((visible) => !visible) : undefined}
        isFilterBarVisible={isFilterBarVisible}
        showActions={{ add: permissions.canCreate, refresh: true, export: false, filter: supportsFilterBar }}
      />

      {isFilterBarVisible && (visibleView === "cards" || visibleView === "chart") && (
        <CountryCardViewHeader
          searchTerm={searchValue}
          searchField={searchField}
          searchOperator={searchOperator}
          sortBy={sortColumn}
          sortOrder={sortDirection}
          filterBy={filter}
          processedCountriesLength={totalCount}
          page={page}
          onSearchChange={onSearchChange}
          onSearchFieldChange={onSearchFieldChange}
          onSearchOperatorChange={onSearchOperatorChange}
          onSortChange={onSortChange}
          onFilterByChange={onFilterChange}
          onClearSearch={() => onSearchChange("")}
          onReset={onResetList}
          selectedCount={selectedCountryIds.length}
          canBulkArchive={visibleView === "cards" && permissions.canDelete}
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
          <CountriesDataGrid
            countries={gridCountries}
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
            onSearchChange={onSearchChange}
            onSearchFieldChange={onSearchFieldChange}
            onSearchOperatorChange={onSearchOperatorChange}
            status={filter}
            onStatusChange={onFilterChange}
            onReset={onResetList}
            selectedCountryIds={selectedCountryIds}
            onSelectedCountryIdsChange={onSelectedCountryIdsChange}
            onBulkArchive={onBulkArchive}
            isBulkArchiving={isBulkArchiving}
            showFilterBar={isFilterBarVisible}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleGridSortChange}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
          />
        )}
        {visibleView === "cards" && (
          <CountriesCardView
            countries={countries}
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
            hasActiveCriteria={hasActiveCriteria}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onClearCriteria={onResetList}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
            selectedCountryIds={selectedCountryIds}
            onSelectedCountryIdsChange={onSelectedCountryIdsChange}
          />
        )}
        {visibleView === "chart" && (
          <CountriesChartView
            countries={countries}
            totalCount={totalCount}
            loading={loading}
            onAdd={permissions.canCreate ? onAdd : undefined}
          />
        )}
        {visibleView === "report" && <CountryReportPage showFilterBar={isFilterBarVisible} />}
        {visibleView === "import" && permissions.canCreate && (
          <ImportCountries onReconcile={handleImportReconcile} />
        )}
      </Box>
    </Box>
  );
};

export default CountriesMultiView;

import { PageHeader } from "@/shared/components/navigation/header";
import { Box } from "@mui/material";
import type { GridApi, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CountryListItem, CountrySortColumn, CountryStatus } from "../types/Country";
import CountriesCardView from "./CountriesCardView";
import type { CountryActionPermissions } from "./card-view/CountryCard.types";
import CountryCardViewHeader from "./card-view/CountryCardViewHeader";
import CountriesDataGrid from "./grid-view/CountriesDataGrid";
import ImportCountries from "./import-data/ImportCountries";

type CountryView = "grid" | "cards" | "import";

interface CountriesMultiViewProps {
  countries: CountryListItem[];
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
  sortColumn: CountrySortColumn;
  sortDirection: "ASC" | "DESC";
  filter: CountryStatus;
  currencyCode: string;
  hasStatesFilter: "all" | "with" | "without";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (column: CountrySortColumn, direction: "ASC" | "DESC") => void;
  onFilterChange: (filter: CountryStatus) => void;
  onCurrencyCodeChange: (currencyCode: string) => void;
  onHasStatesFilterChange: (filter: "all" | "with" | "without") => void;
  onResetList: () => void;
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
  sortColumn,
  sortDirection,
  filter,
  currencyCode,
  hasStatesFilter,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onCurrencyCodeChange,
  onHasStatesFilterChange,
  onResetList,
}: CountriesMultiViewProps) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<CountryView>("grid");

  useEffect(() => {
    if (!permissions.canCreate && currentView === "import") setCurrentView("grid");
  }, [currentView, permissions.canCreate]);

  const handleViewChange = useCallback((view: string) => {
    if (view === "grid" || view === "cards" || view === "import") setCurrentView(view);
  }, []);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
    else onPageChange(model.page);
  }, [onPageChange, onPageSizeChange, pageSize]);

  const handleGridSortChange = useCallback((model: GridSortModel) => {
    const next = model[0];
    if (!next?.sort || !sortableColumns.has(next.field as CountrySortColumn)) return;
    onSortChange(next.field as CountrySortColumn, next.sort.toUpperCase() as "ASC" | "DESC");
  }, [onSortChange]);

  const activeFilterCount = Number(filter !== "active") + Number(currencyCode.length > 0) + Number(hasStatesFilter !== "all");
  const hasActiveCriteria = searchValue.trim().length > 0 || activeFilterCount > 0;
  const availableViews: CountryView[] = permissions.canCreate
    ? ["grid", "cards", "import"]
    : ["grid", "cards"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <PageHeader
        variant="multi-view"
        title={t("countries.viewTitle")}
        storageKey="countries-view-layout-v2"
        defaultView="grid"
        availableViews={availableViews}
        viewLabels={{
          grid: t("countries.views.grid"),
          cards: t("countries.views.cards"),
          import: t("countries.views.import"),
        }}
        onAdd={permissions.canCreate ? onAdd : undefined}
        dataCount={totalCount}
        totalLabel={t("countries.total")}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        additionalChips={activeFilterCount > 0 ? [{
          label: t("countries.activeFilters", { count: activeFilterCount }),
          color: "secondary",
          variant: "outlined",
        }] : undefined}
        showActions={{ add: permissions.canCreate, refresh: true, export: false, filter: false }}
      />

      {currentView !== "import" && (
        <CountryCardViewHeader
          searchTerm={searchValue}
          sortBy={sortColumn}
          sortOrder={sortDirection}
          filterBy={filter}
          currencyCode={currencyCode}
          hasStatesFilter={hasStatesFilter}
          processedCountriesLength={totalCount}
          page={page}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          onFilterByChange={onFilterChange}
          onCurrencyCodeChange={onCurrencyCodeChange}
          onHasStatesFilterChange={onHasStatesFilterChange}
          onClearSearch={() => onSearchChange("")}
          onReset={onResetList}
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative" }}>
        {currentView === "grid" && (
          <CountriesDataGrid
            countries={countries}
            loading={loading}
            isFetching={isFetching}
            apiRef={apiRef}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onView={onView}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleGridSortChange}
            lastAddedId={lastAddedId}
            lastEditedId={lastEditedId}
            lastDeletedIndex={lastDeletedIndex}
          />
        )}
        {currentView === "cards" && (
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
          />
        )}
        {currentView === "import" && permissions.canCreate && <ImportCountries />}
      </Box>
    </Box>
  );
};

export default CountriesMultiView;

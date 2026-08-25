import { LinearProgress, Box } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/navigation/header";
import type { AddressType, AddressTypeSearchField, AddressTypeSearchOperator, AddressTypeSortColumn, AddressTypeStatus } from "../types/AddressType";
import type { AddressTypePermissionSet } from "../utils/addressTypePermissions";
import AddressTypeReportPage from "../reports/pages/AddressTypeReportPage";
import AddressTypesCardView from "./AddressTypesCardView";
import AddressTypesChartView from "./AddressTypesChartView";
import AddressTypeCardViewHeader from "./card-view/AddressTypeCardViewHeader";
import AddressTypesDataGrid from "./grid-view/AddressTypesDataGrid";
import AddressTypeImportView from "./import-data/AddressTypeImportView";

type AddressTypeView = "grid" | "cards" | "chart" | "report" | "import";
const sortableColumns = new Set<AddressTypeSortColumn>(["nameEn", "nameAr", "createdOn"]);

export interface AddressTypesMultiViewProps {
  items: AddressType[];
  loading: boolean;
  isFetching: boolean;
  error: Error | null;
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: AddressTypeSearchField;
  searchOperator: AddressTypeSearchOperator;
  sortColumn: AddressTypeSortColumn;
  sortDirection: "ASC" | "DESC";
  status: AddressTypeStatus;
  permissions: AddressTypePermissionSet;
  selectedIds: number[];
  onAdd: () => void;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onRestore: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: AddressTypeSearchField) => void;
  onSearchOperatorChange: (value: AddressTypeSearchOperator) => void;
  onSortChange: (column: AddressTypeSortColumn, direction: "ASC" | "DESC") => void;
  onStatusChange: (value: AddressTypeStatus) => void;
  onReset: () => void;
  onSelectedIdsChange: (ids: number[]) => void;
  onBulkArchive: () => void;
  isBulkArchiving: boolean;
}

/** Directly follows StatesMultiView: the only differences are Address Type fields and contracts. */
export default function AddressTypesMultiView(props: AddressTypesMultiViewProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<AddressTypeView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const visibleView = currentView === "import" && !props.permissions.canCreate ? "grid" : currentView;
  const handleViewChange = useCallback((view: string) => {
    if (view !== "grid" && view !== "cards" && view !== "chart" && view !== "report" && view !== "import") return;
    if (view !== "import" || props.permissions.canCreate) {
      if (view === "chart" && props.page !== 0) props.onPageChange(0);
      setCurrentView(view);
    }
  }, [props.onPageChange, props.page, props.permissions.canCreate]);
  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== props.pageSize) props.onPageSizeChange(model.pageSize);
    else props.onPageChange(model.page);
  }, [props.onPageChange, props.onPageSizeChange, props.pageSize]);
  const handleGridSortChange = useCallback((model: GridSortModel) => {
    const next = model[0];
    if (next?.sort && sortableColumns.has(next.field as AddressTypeSortColumn)) props.onSortChange(next.field as AddressTypeSortColumn, next.sort.toUpperCase() as "ASC" | "DESC");
  }, [props.onSortChange]);
  const handleImportReconcile = useCallback(() => {
    props.onRefresh();
    setCurrentView("grid");
  }, [props.onRefresh]);
  const hasActiveCriteria = props.searchValue.trim().length > 0 || props.status !== "active";
  const availableViews: AddressTypeView[] = props.permissions.canCreate ? ["grid", "cards", "chart", "report", "import"] : ["grid", "cards", "chart", "report"];
  const supportsFilterBar = visibleView !== "import";

  if (props.error) return <Box sx={{ p: 3 }}>{t("addressTypes.fetchError")}</Box>;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
    <PageHeader variant="multi-view" title={t("addressTypes.viewTitle")} storageKey="address-types-view-layout" defaultView="grid" availableViews={availableViews} onAdd={props.permissions.canCreate ? props.onAdd : undefined} dataCount={props.totalCount} totalLabel={t("addressTypes.total")} onRefresh={props.onRefresh} onViewTypeChange={handleViewChange} onFilter={supportsFilterBar ? () => setIsFilterBarVisible((visible) => !visible) : undefined} isFilterBarVisible={isFilterBarVisible} showActions={{ add: props.permissions.canCreate, refresh: true, export: false, filter: supportsFilterBar }} />
    {isFilterBarVisible && (visibleView === "cards" || visibleView === "chart") ? <AddressTypeCardViewHeader searchTerm={props.searchValue} searchField={props.searchField} searchOperator={props.searchOperator} sortBy={props.sortColumn} sortOrder={props.sortDirection} filterBy={props.status} totalCount={props.totalCount} page={props.page} onSearchChange={props.onSearchChange} onSearchFieldChange={props.onSearchFieldChange} onSearchOperatorChange={props.onSearchOperatorChange} onSortChange={props.onSortChange} onFilterChange={props.onStatusChange} onReset={props.onReset} selectedCount={props.selectedIds.length} canBulkArchive={currentView === "cards" && props.permissions.canDelete} isBulkArchiving={props.isBulkArchiving} onBulkArchive={props.onBulkArchive} /> : null}
    <Box sx={{ flex: 1, minHeight: 0, overflowX: visibleView === "grid" ? "auto" : "hidden", overflowY: visibleView === "grid" ? "auto" : "hidden", position: "relative" }}>
      {props.isFetching && !props.loading ? <LinearProgress aria-label={t("common.loading")} sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }} /> : null}
      {visibleView === "grid" ? <AddressTypesDataGrid items={props.items} loading={props.loading} onEdit={props.onEdit} onDelete={props.onDelete} onRestore={props.onRestore} onView={props.onView} permissions={props.permissions} page={props.page} pageSize={props.pageSize} totalCount={props.totalCount} sortColumn={props.sortColumn} sortDirection={props.sortDirection} searchValue={props.searchValue} searchField={props.searchField} searchOperator={props.searchOperator} status={props.status} onSearchChange={props.onSearchChange} onSearchFieldChange={props.onSearchFieldChange} onSearchOperatorChange={props.onSearchOperatorChange} onStatusChange={props.onStatusChange} onReset={props.onReset} selectedIds={props.selectedIds} onSelectedIdsChange={props.onSelectedIdsChange} onBulkArchive={props.onBulkArchive} isBulkArchiving={props.isBulkArchiving} showFilterBar={isFilterBarVisible} onPaginationChange={handlePaginationChange} onSortChange={handleGridSortChange} /> : null}
      {visibleView === "cards" ? <AddressTypesCardView items={props.items} loading={props.loading} onEdit={props.onEdit} onDelete={props.onDelete} onRestore={props.onRestore} onView={props.onView} onAdd={props.onAdd} onRefresh={props.onRefresh} permissions={props.permissions} page={props.page} pageSize={props.pageSize} totalCount={props.totalCount} hasActiveCriteria={hasActiveCriteria} onPageChange={props.onPageChange} onPageSizeChange={props.onPageSizeChange} onClearCriteria={props.onReset} selectedIds={props.selectedIds} onSelectedIdsChange={props.onSelectedIdsChange} /> : null}
      {visibleView === "chart" ? <AddressTypesChartView items={props.items} totalCount={props.totalCount} loading={props.loading} onAdd={props.permissions.canCreate ? props.onAdd : undefined} /> : null}
      {visibleView === "report" ? <AddressTypeReportPage showFilterBar={isFilterBarVisible} /> : null}
      {visibleView === "import" && props.permissions.canCreate ? <AddressTypeImportView onReconcile={handleImportReconcile} /> : null}
    </Box>
  </Box>;
}

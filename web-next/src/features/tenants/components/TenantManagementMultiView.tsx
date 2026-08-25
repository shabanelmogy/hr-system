import { Alert, Box, Button, LinearProgress } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader, type ViewType } from "@/shared/components/navigation/header";
import type { TenantManagementResponse, TenantSortColumn } from "../types";
import TenantCardViewHeader from "./TenantCardViewHeader";
import TenantsCardView from "./TenantsCardView";
import TenantsDataGrid from "./TenantsDataGrid";

type TenantView = "grid" | "cards";

interface TenantManagementMultiViewProps {
  tenants: TenantManagementResponse[];
  loading: boolean;
  isFetching: boolean;
  error: unknown;
  page: number;
  pageSize: number;
  totalCount: number;
  searchValue: string;
  sortColumn: TenantSortColumn;
  sortDirection: "ASC" | "DESC";
  onAdd: () => void;
  onEdit: (tenant: TenantManagementResponse) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (column: TenantSortColumn, direction: "ASC" | "DESC") => void;
  onReset: () => void;
}

const sortableColumns = new Set<TenantSortColumn>(["name", "identifier", "createdOn"]);
const availableViews: ViewType[] = ["grid", "cards"];

export default function TenantManagementMultiView({
  tenants,
  loading,
  isFetching,
  error,
  page,
  pageSize,
  totalCount,
  searchValue,
  sortColumn,
  sortDirection,
  onAdd,
  onEdit,
  onRefresh,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  onReset,
}: TenantManagementMultiViewProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<TenantView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);

  const handleViewChange = useCallback((view: ViewType) => {
    if (view === "grid" || view === "cards") setCurrentView(view);
  }, []);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
    else onPageChange(model.page);
  }, [onPageChange, onPageSizeChange, pageSize]);

  const handleGridSortChange = useCallback((model: GridSortModel) => {
    const next = model[0];
    if (!next?.sort || !sortableColumns.has(next.field as TenantSortColumn)) return;
    onSortChange(
      next.field as TenantSortColumn,
      next.sort.toUpperCase() as "ASC" | "DESC",
    );
  }, [onSortChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, width: "100%" }}>
      <PageHeader
        variant="multi-view"
        title={t("tenantManagement.title")}
        storageKey="tenants-view-layout"
        defaultView="grid"
        availableViews={availableViews}
        dataCount={totalCount}
        totalLabel={t("tenantManagement.total")}
        onAdd={onAdd}
        onRefresh={onRefresh}
        onViewTypeChange={handleViewChange}
        onFilter={() => setIsFilterBarVisible((visible) => !visible)}
        isFilterBarVisible={isFilterBarVisible}
        showActions={{ add: true, refresh: true, export: false, filter: true }}
      />

      {isFilterBarVisible && currentView === "cards" ? (
        <TenantCardViewHeader
          searchValue={searchValue}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          page={page}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          onReset={onReset}
        />
      ) : null}

      <Box sx={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {isFetching && !loading ? (
          <LinearProgress
            aria-label={t("common.loading")}
            sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 3 }}
          />
        ) : null}

        {error && tenants.length === 0 ? (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={onRetry}>{t("actions.retry")}</Button>}
          >
            {getErrorMessage(error, t("tenantManagement.loadError"))}
          </Alert>
        ) : currentView === "grid" ? (
          <TenantsDataGrid
            tenants={tenants}
            loading={loading}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            searchValue={searchValue}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            showFilterBar={isFilterBarVisible}
            onEdit={onEdit}
            onSearchChange={onSearchChange}
            onReset={onReset}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleGridSortChange}
          />
        ) : (
          <TenantsCardView
            tenants={tenants}
            loading={loading}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            searchValue={searchValue}
            onEdit={onEdit}
            onAdd={onAdd}
            onRefresh={onRefresh}
            onReset={onReset}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </Box>
    </Box>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

"use client";

import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import dynamic from "next/dynamic";
import CountriesMultiView from "../components/CountriesMultiView";
import useCountryGridLogic from "../hooks/useCountryGridLogic";
import { useCountry } from "../hooks/useCountryQueries";
import { extractErrorMessage } from "@/shared/utils/errorUtils";

const CountryForm = dynamic(() => import("../components/CountryForm"), { ssr: false });
const CountryArchiveDialog = dynamic(() => import("../components/CountryArchiveDialog"), { ssr: false });
const CountryRestoreDialog = dynamic(() => import("../components/CountryRestoreDialog"), { ssr: false });
const CountryBulkArchiveDialog = dynamic(() => import("../components/CountryBulkArchiveDialog"), { ssr: false });

const CountriesPage = () => {
  const { t } = useTranslation();
  const {
    dialogType,
    selectedCountry,
    loading,
    countries,
    gridCountries,
    paginationMode,
    totalCount,
    apiRef,
    error,
    isFetching,
    onEdit,
    onView,
    onDelete,
    onAdd,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    handleRefresh,
    isCreating,
    isUpdating,
    isArchiving,
    lastAddedId,
    lastEditedId,
    lastDeletedIndex,
    page,
    pageSize,
    searchValue,
    searchField,
    searchOperator,
    sortColumn,
    sortDirection,
    filter,
    setPage,
    setPageSize,
    setSearchValue,
    setSearchField,
    setSearchOperator,
    setSort,
    setFilter,
    resetList,
    restoreCountry,
    isRestoring,
    onRestore,
    closeRestore,
    handleRestore,
    permissions,
    selectedCountryIds,
    bulkArchiveOpen,
    setSelectedCountryIds,
    onBulkArchive,
    closeBulkArchive,
    handleBulkArchive,
    isBulkArchiving,
  } = useCountryGridLogic();

  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : null;
  const detailQuery = useCountry(selectedCountry?.id, {
    enabled: formDialogType === "edit" || formDialogType === "view",
  });
  const formCountry = formDialogType === "add" ? null : (detailQuery.data ?? null);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              {t("common.retry")}
            </Button>
          }
        >
          {error.message || t("countries.fetchError")}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <CountriesMultiView
        countries={countries}
        gridCountries={gridCountries}
        paginationMode={paginationMode}
        loading={loading}
        isFetching={isFetching}
        apiRef={apiRef}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        onRestore={onRestore}
        onAdd={onAdd}
        onRefresh={handleRefresh}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
        permissions={permissions}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        searchValue={searchValue}
        searchField={searchField}
        searchOperator={searchOperator}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        filter={filter}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchValue}
        onSearchFieldChange={setSearchField}
        onSearchOperatorChange={setSearchOperator}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onResetList={resetList}
        selectedCountryIds={selectedCountryIds}
        onSelectedCountryIdsChange={setSelectedCountryIds}
        onBulkArchive={onBulkArchive}
        isBulkArchiving={isBulkArchiving}
      />

      {formDialogType ? <CountryForm
        open={formDialogType !== null}
        dialogType={formDialogType ?? "add"}
        selectedCountry={formCountry}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating || detailQuery.isFetching}
        detailError={detailQuery.error
          ? extractErrorMessage(detailQuery.error) || t("countries.detailLoadError")
          : undefined}
        onRetryDetails={() => void detailQuery.refetch()}
      /> : null}

      {dialogType === "delete" ? <CountryArchiveDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedCountry={selectedCountry}
        loading={isArchiving}
      /> : null}

      {restoreCountry ? <CountryRestoreDialog
        country={restoreCountry}
        loading={isRestoring}
        onClose={closeRestore}
        onConfirm={() => void handleRestore()}
      /> : null}

      {bulkArchiveOpen ? <CountryBulkArchiveDialog
        open={bulkArchiveOpen}
        selectedCount={selectedCountryIds.length}
        loading={isBulkArchiving}
        onClose={closeBulkArchive}
        onConfirm={handleBulkArchive}
      /> : null}
    </>
  );
};

export default CountriesPage;

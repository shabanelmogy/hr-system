"use client";

import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import CountriesMultiView from "../components/CountriesMultiView";
import CountryArchiveDialog from "../components/CountryArchiveDialog";
import CountryBulkArchiveDialog from "../components/CountryBulkArchiveDialog";
import CountryForm from "../components/CountryForm";
import CountryRestoreDialog from "../components/CountryRestoreDialog";
import useCountryGridLogic from "../hooks/useCountryGridLogic";
import { useCountry } from "../hooks/useCountryQueries";
import { extractErrorMessage } from "@/shared/utils/errorUtils";

const CountriesPage = () => {
  const { t } = useTranslation();
  const {
    dialogType,
    selectedCountry,
    loading,
    countries,
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
    currencyCode,
    hasStatesFilter,
    setPage,
    setPageSize,
    setSearchValue,
    setSearchField,
    setSearchOperator,
    setSort,
    setFilter,
    setCurrencyCode,
    setHasStatesFilter,
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
  const formCountry = detailQuery.data ?? selectedCountry;

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
        currencyCode={currencyCode}
        hasStatesFilter={hasStatesFilter}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchValue}
        onSearchFieldChange={setSearchField}
        onSearchOperatorChange={setSearchOperator}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onCurrencyCodeChange={setCurrencyCode}
        onHasStatesFilterChange={setHasStatesFilter}
        onResetList={resetList}
        selectedCountryIds={selectedCountryIds}
        onSelectedCountryIdsChange={setSelectedCountryIds}
        onBulkArchive={onBulkArchive}
        isBulkArchiving={isBulkArchiving}
      />

      <CountryForm
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
      />

      <CountryArchiveDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedCountry={selectedCountry}
        loading={isArchiving}
      />

      <CountryRestoreDialog
        country={restoreCountry}
        loading={isRestoring}
        onClose={closeRestore}
        onConfirm={() => void handleRestore()}
      />

      <CountryBulkArchiveDialog
        open={bulkArchiveOpen}
        selectedCount={selectedCountryIds.length}
        loading={isBulkArchiving}
        onClose={closeBulkArchive}
        onConfirm={handleBulkArchive}
      />
    </>
  );
};

export default CountriesPage;

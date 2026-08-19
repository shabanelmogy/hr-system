"use client";

// CountriesPage.js - TanStack Query Implementation
import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import CountriesMultiView from "../components/CountriesMultiView";
import CountryArchiveDialog from "../components/CountryArchiveDialog";
import CountryForm from "../components/CountryForm";
import CountryRestoreDialog from "../components/CountryRestoreDialog";
import useCountryGridLogic from "../hooks/useCountryGridLogic";
import { useCountry } from "../hooks/useCountryQueries";

const CountriesPage = () => {
  const { t } = useTranslation();
  // All logic is now in the TanStack Query hook
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
    sortColumn,
    sortDirection,
    filter,
    currencyCode,
    hasStatesFilter,
    setPage,
    setPageSize,
    setSearchValue,
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
  } = useCountryGridLogic();

  // Derive a type-safe form dialog type — null when the form should not be open
  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : null;
  const detailQuery = useCountry(selectedCountry?.id, {
    enabled: formDialogType === "edit" || formDialogType === "view",
  });
  const formCountry = detailQuery.data ?? selectedCountry;

  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              {t("common.retry") || "Retry"}
            </Button>
          }
        >
          {error.message || t("countries.errorMessage") || "Failed to load countries"}
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
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        filter={filter}
        currencyCode={currencyCode}
        hasStatesFilter={hasStatesFilter}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchValue}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onCurrencyCodeChange={setCurrencyCode}
        onHasStatesFilterChange={setHasStatesFilter}
        onResetList={resetList}
      />

      <CountryForm
        open={formDialogType !== null}
        dialogType={formDialogType ?? "add"}
        selectedCountry={formCountry}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating || detailQuery.isFetching}
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
    </>
  );
};

export default CountriesPage;

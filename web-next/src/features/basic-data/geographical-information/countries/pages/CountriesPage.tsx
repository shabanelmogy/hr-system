"use client";

// CountriesPage.js - TanStack Query Implementation
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import CountriesMultiView from "../components/CountriesMultiView";
import CountryDeleteDialog from "../components/CountryDeleteDialog";
import CountryForm from "../components/CountryForm";
import useCountryGridLogic from "../hooks/useCountryGridLogic";
import countryHandler from "../utils/countryHandler";

const CountriesPage = () => {
  const { t } = useTranslation();
  const initializedRef = useRef(false);

  // Initialize SignalR handler once on mount.
  // Pass a notification system when one is available in the app.
  // For now, a no-op implementation is used so the handler is registered
  // and real-time updates are received even without UI notifications.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    countryHandler.initialize({
      addNotification: () => {
        // TODO: replace with real notification system (e.g. useSnackbar, toast, etc.)
      },
    });

    return () => {
      countryHandler.destroy();
      initializedRef.current = false;
    };
  }, []);

  // All logic is now in the TanStack Query hook
  const {
    dialogType,
    selectedCountry,
    loading,
    countries,
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
    isDeleting,
    lastAddedId,
    lastEditedId,
    lastDeletedIndex,
  } = useCountryGridLogic();

  // Derive a type-safe form dialog type — null when the form should not be open
  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : null;

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
        onAdd={onAdd}
        onRefresh={handleRefresh}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />

      <CountryForm
        open={formDialogType !== null}
        dialogType={formDialogType ?? "add"}
        selectedCountry={selectedCountry}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
      />

      <CountryDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedCountry={selectedCountry}
        loading={isDeleting}
      />
    </>
  );
};

export default CountriesPage;

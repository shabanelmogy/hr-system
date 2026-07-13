"use client";

// StatesPage.js - TanStack Query Implementation
import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import StatesMultiView from "../components/StatesMultiView";
import StateDeleteDialog from "../components/StateDeleteDialog";
import StateForm from "../components/StateForm";
import useStateGridLogic from "../hooks/useStateGridLogic";

const StatesPage = () => {
  const { t } = useTranslation();

  // All logic is now in the TanStack Query hook
  const {
    dialogType,
    selectedState,
    loading,
    states,
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
  } = useStateGridLogic();
  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : "add";

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
          {error.message || t("states.errorMessage") || "Failed to load states"}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <StatesMultiView
        states={states}
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

      <StateForm
        open={["edit", "add", "view"].includes(dialogType)}
        dialogType={formDialogType}
        selectedState={selectedState}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
      />

      <StateDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedState={selectedState}
        loading={isDeleting}
      />
    </>
  );
};

export default StatesPage;

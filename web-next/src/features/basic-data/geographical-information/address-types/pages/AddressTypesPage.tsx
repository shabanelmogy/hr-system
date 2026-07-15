"use client";

import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import AddressTypesMultiView from "../components/AddressTypesMultiView";
import AddressTypeDeleteDialog from "../components/AddressTypeDeleteDialog";
import AddressTypeForm from "../components/AddressTypeForm";
import useAddressTypeGridLogic from "../hooks/useAddressTypeGridLogic";

const AddressTypesPage = () => {
  const { t } = useTranslation();

  const {
    dialogType,
    selectedItem,
    loading,
    items,
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
  } = useAddressTypeGridLogic();
  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : "add";
  const isFormOpen =
    dialogType === "add" || dialogType === "edit" || dialogType === "view";

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
          {error.message || t("addressTypes.errorMessage") || "Failed to load address types"}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <AddressTypesMultiView
        items={items}
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

      <AddressTypeForm
        open={isFormOpen}
        dialogType={formDialogType}
        selectedItem={selectedItem}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
      />

      <AddressTypeDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedItem={selectedItem}
        loading={isDeleting}
      />
    </>
  );
};

export default AddressTypesPage;

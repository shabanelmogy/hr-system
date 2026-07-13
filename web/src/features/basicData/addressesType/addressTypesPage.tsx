import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import AddressTypesMultiView from "./components/addressTypesMultiView";
import AddressTypeDeleteDialog from "./components/addressTypeDeleteDialog";
import AddressTypeForm from "./components/addressTypeForm";
import useAddressTypeGridLogic from "./hooks/useAddressTypeGridLogic";

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
        open={["edit", "add", "view"].includes(dialogType as any)}
        dialogType={dialogType as any}
        selectedItem={selectedItem}
        onClose={closeDialog}
        onSubmit={handleFormSubmit as any}
        loading={isCreating || isUpdating}
      />

      <AddressTypeDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedItem={selectedItem as any}
        loading={isDeleting}
      />
    </>
  );
};

export default AddressTypesPage;

// DistrictsPage.js - TanStack Query Implementation
import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import DistrictsMultiView from "./components/districtsMultiView";
import DistrictDeleteDialog from "./components/districtDeleteDialog";
import DistrictForm from "./components/districtForm";
import useDistrictGridLogic from "./hooks/useDistrictGridLogic";

const DistrictsPage = () => {
  const { t } = useTranslation();

  const {
    dialogType,
    selectedDistrict,
    loading,
    districts,
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
  } = useDistrictGridLogic();

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
          {error.message || t("districts.errorMessage") || "Failed to load districts"}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <DistrictsMultiView
        districts={districts}
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

      <DistrictForm
        open={["edit", "add", "view"].includes(dialogType as any)}
        dialogType={dialogType as "add" | "edit" | "view"}
        selectedDistrict={selectedDistrict}
        onClose={closeDialog}
        onSubmit={handleFormSubmit as any}
        loading={isCreating || isUpdating}
      />

      <DistrictDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedDistrict={selectedDistrict}
        loading={isDeleting}
      />
    </>
  );
};

export default DistrictsPage;
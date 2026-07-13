import { showToast } from "@/shared/components/feedback";
import { extractErrorMessage } from "@/shared/utils";
import { useGridApiRef, GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddressType, UpdateAddressTypeRequest } from "../types/AddressType";
import {
  useAddressTypes,
  useCreateAddressType,
  useDeleteAddressType,
  useUpdateAddressType,
} from "./useAddressTypeQueries";

// Dialog Types
export type AddressTypeDialogType = "add" | "edit" | "view" | "delete" | null;

interface UseAddressTypeGridLogicReturn {
  dialogType: AddressTypeDialogType;
  selectedItem: AddressType | null;
  loading: boolean;
  items: AddressType[];
  apiRef: React.MutableRefObject<GridApi>;
  error: any;
  isFetching: boolean;
  openDialog: (type: AddressTypeDialogType, item?: AddressType | null) => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: Partial<AddressType>) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastAddedId: number | null;
  lastEditedId: number | null;
  lastDeletedIndex: number | null;
}

const useAddressTypeGridLogic = (): UseAddressTypeGridLogicReturn => {
  const { t } = useTranslation();

  const {
    data: items = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useAddressTypes();

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error);
      showToast.error(
        errorMessage || t("addressTypes.fetchError") || "Failed to fetch address types"
      );
    }
  }, [error, t]);

  const createMutation = useCreateAddressType({
    onSuccess: (newItem: AddressType) => {
      showToast.success(
        t("addressTypes.created", { name: newItem.nameEn }) ||
          `Address type "${newItem.nameEn}" created successfully!`
      );

      const newId: number = typeof newItem.id === 'string' ? parseInt(newItem.id, 10) : newItem.id;
      console.log("🟢 Address type created with ID:", newId);
      setLastAddedRowId(newId);
      setNewRowAdded(true);
      setDialogType(null);
      setSelectedItem(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastAddedRowId");
        setLastAddedRowId(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(
        t(errorMessage || "addressTypes.createError") || "Failed to create address type"
      );
    },
  });

  const updateMutation = useUpdateAddressType({
    onSuccess: (updated: AddressType) => {
      showToast.success(
        t("addressTypes.updated", { name: updated.nameEn }) ||
          `Address type "${updated.nameEn}" updated successfully!`
      );

      const updatedId: number = typeof updated.id === 'string' ? parseInt(updated.id, 10) : updated.id;
      console.log("🟡 Address type updated with ID:", updatedId);
      setRowEdited(true);
      setLastEditedRowId(updatedId);
      setDialogType(null);
      setSelectedItem(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastEditedRowId");
        setLastEditedRowId(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(
        t("addressTypes.updateError") || errorMessage || "Failed to update address type"
      );
    },
  });

  const deleteMutation = useDeleteAddressType({
    onSuccess: () => {
      showToast.success(t("addressTypes.deleted") || "Address type deleted successfully!");
      console.log("🔴 Address type deleted, lastDeletedRowIndex:", lastDeletedRowIndex);
      setRowDeleted(true);
      setDialogType(null);
      setSelectedItem(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastDeletedRowIndex");
        setLastDeletedRowIndex(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(
        t(errorMessage || "addressTypes.deleteError") || "Failed to delete address type"
      );
    },
  });

  const [dialogType, setDialogType] = useState<AddressTypeDialogType>(null);
  const [selectedItem, setSelectedItem] = useState<AddressType | null>(null);

  const [newRowAdded, setNewRowAdded] = useState<boolean>(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<number | null>(null);

  const [rowEdited, setRowEdited] = useState<boolean>(false);
  const [lastEditedRowId, setLastEditedRowId] = useState<number | null>(null);

  const [rowDeleted, setRowDeleted] = useState<boolean>(false);
  const [lastDeletedRowIndex, setLastDeletedRowIndex] = useState<number | null>(null);

  const apiRef = useGridApiRef();

  const stableItems = useMemo((): AddressType[] => items, [items]);

  const isAnyLoading: boolean =
    loading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const openDialog = useCallback((type: AddressTypeDialogType, item: AddressType | null = null) => {
    setDialogType(type);
    setSelectedItem(item);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedItem(null);
  }, []);

  // Scroll to the last added row
  useEffect(() => {
    if (
      newRowAdded &&
      items.length > 0 &&
      apiRef.current &&
      lastAddedRowId
    ) {
      // Find the actual index of the newly added row
      const newRowIndex = items.findIndex(
        (item) => item.id === lastAddedRowId
      );

      if (newRowIndex >= 0) {
        console.log("Found new row at index:", newRowIndex);

        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(newRowIndex / pageSize);

        // Set the page first
        apiRef.current.setPage(newPage);

        // Select the row
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastAddedRowId]) });

        // Scroll to the row with a delay to ensure the page change has completed
        setTimeout(() => {
          apiRef.current.scrollToIndexes({
            rowIndex: newRowIndex,
            colIndex: 0,
          });
        }, 500); // Increased delay to ensure data is loaded

        console.log(
          "Row selection and scroll initiated for ID:",
          lastAddedRowId
        );
      } else {
        console.log("New row not found in items list yet, will retry...");
        // If the row is not found yet, it might be because the data is still loading
        // The effect will run again when items data updates
        return;
      }

      setNewRowAdded(false);
    }
  }, [newRowAdded, items, lastAddedRowId]);

  // Scroll to the last edited row
  useEffect(() => {
    if (rowEdited && items.length > 0 && apiRef.current) {
      const editedIndex = items.findIndex(
        (row) => row.id === lastEditedRowId
      );

      if (editedIndex >= 0 && editedIndex < items.length) {
        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;

        const newPage = Math.floor(editedIndex / pageSize);

        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: editedIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastEditedRowId]) });
      }
      setRowEdited(false);
    }
  }, [rowEdited, items.length, lastEditedRowId]);

  // Scroll to the previous row after deletion
  useEffect(() => {
    if (rowDeleted && items.length > 0 && apiRef.current) {
      let prevRowIndex = lastDeletedRowIndex - 1;
      if (prevRowIndex < 0) {
        prevRowIndex = 0;
      }

      if (prevRowIndex >= 0 && prevRowIndex < items.length) {
        const prevRowId = items[prevRowIndex].id;
        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(prevRowIndex / pageSize);

        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: prevRowIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([prevRowId]) });
      }
      setRowDeleted(false);
    }
  }, [rowDeleted, items.length, lastDeletedRowIndex]);

  // Additional effect to handle row selection when data is refetched
  useEffect(() => {
    if (
      !isFetching &&
      !loading &&
      lastAddedRowId &&
      newRowAdded &&
      items.length > 0 &&
      apiRef.current
    ) {
      // Find the newly added row
      const newRowIndex = items.findIndex(
        (item) => item.id === lastAddedRowId
      );

      if (newRowIndex >= 0) {
        console.log(
          "Found new row at index:",
          newRowIndex,
          "for ID:",
          lastAddedRowId
        );

        // Use a timeout to ensure the grid has rendered the new data
        setTimeout(() => {
          if (apiRef.current) {
            const pageSize =
              apiRef.current.state.pagination.paginationModel.pageSize;
            const newPage = Math.floor(newRowIndex / pageSize);

            // Set the page and select the row
            apiRef.current.setPage(newPage);
            apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastAddedRowId]) });

            // Scroll to the row
            setTimeout(() => {
              if (apiRef.current) {
                apiRef.current.scrollToIndexes({
                  rowIndex: newRowIndex,
                  colIndex: 0,
                });
              }
            }, 200);

            console.log(
              "Successfully selected and scrolled to new row:",
              lastAddedRowId
            );
          }
        }, 300);

        // Reset the flags
        setNewRowAdded(false);
        setLastAddedRowId(null);
      }
    }
  }, [isFetching, loading, lastAddedRowId, newRowAdded, items]);

  const handleFormSubmit = useCallback(
    async (formdata: Partial<AddressType>) => {
      try {
        if (dialogType === "edit" && selectedItem?.id) {
          await updateMutation.mutateAsync({ ...formdata, id: selectedItem.id } as UpdateAddressTypeRequest);
        } else if (dialogType === "add") {
          await createMutation.mutateAsync(formdata as any);
        }
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
    [dialogType, selectedItem, updateMutation, createMutation]
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!selectedItem?.id) return;

    try {
      const deletedId: number = typeof selectedItem.id === 'string' ? parseInt(selectedItem.id, 10) : selectedItem.id;
      const currentIndex: number = items.findIndex((row) => row.id === deletedId);

      await deleteMutation.mutateAsync(deletedId);

      // Update selected item for navigation
      let newSelectedItem: AddressType | null = null;
      if (items.length > 1) {
        // Will be length - 1 after deletion
        newSelectedItem =
          currentIndex > 0
            ? items[Math.min(currentIndex - 1, items.length - 2)]
            : items[1]; // Take the second item since first will be deleted
      }

      setSelectedItem(newSelectedItem);
      setLastDeletedRowIndex(currentIndex);
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, [selectedItem, items, deleteMutation]);

  const handleEdit = useCallback((item: AddressType) => openDialog("edit", item), [openDialog]);
  const handleView = useCallback((item: AddressType) => openDialog("view", item), [openDialog]);
  const handleDeleteDialog = useCallback((item: AddressType) => openDialog("delete", item), [openDialog]);
  const handleAdd = useCallback(() => openDialog("add"), [openDialog]);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  return {
    dialogType,
    selectedItem,
    loading: isAnyLoading,
    items: stableItems,
    apiRef,
    error,
    isFetching,
    openDialog,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    handleRefresh,
    onEdit: handleEdit,
    onView: handleView,
    onDelete: handleDeleteDialog,
    onAdd: handleAdd,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    lastAddedId: lastAddedRowId,
    lastEditedId: lastEditedRowId,
    lastDeletedIndex: lastDeletedRowIndex,
  };
};

export default useAddressTypeGridLogic;
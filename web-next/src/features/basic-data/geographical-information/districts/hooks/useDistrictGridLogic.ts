// hooks/useDistrictGridLogic.ts - TanStack Query Implementation
import { showToast } from "@/shared/components/feedback";
import { extractErrorMessage } from "@/shared/utils";
import { useGridApiRef, GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { District, CreateDistrictRequest } from "../types/District";
import {
  useDistricts,
  useCreateDistrict,
  useDeleteDistrict,
  useUpdateDistrict,
} from "./useDistrictQueries";
import { useInvalidateDistricts } from "./useDistrictQueries";

export type DialogType = "add" | "edit" | "view" | "delete" | null;

interface UseDistrictGridLogicReturn {
  // State
  dialogType: DialogType;
  selectedDistrict: District | null;
  loading: boolean;
  districts: District[];
  apiRef: React.MutableRefObject<GridApi>;
  error: any;
  isFetching: boolean;

  // Dialog methods
  openDialog: (type: DialogType, district?: District | null) => void;
  closeDialog: () => void;

  // Form and action handlers
  handleFormSubmit: (formdata: CreateDistrictRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;

  // Action methods
  onEdit: (district: District) => void;
  onView: (district: District) => void;
  onDelete: (district: District) => void;
  onAdd: () => void;

  // Mutation states for advanced UI feedback
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Highlighting/Navigation state for card view
  lastAddedId: number | null;
  lastEditedId: number | null;
  lastDeletedIndex: number | null;
}

const useDistrictGridLogic = (): UseDistrictGridLogicReturn => {
  const { t } = useTranslation();

  const {
    data: districts = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useDistricts();

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error);
      showToast.error(errorMessage || t("districts.fetchError") || "Failed to fetch districts");
    }
  }, [error, t]);

  const createDistrictMutation = useCreateDistrict({
    onSuccess: (newDistrict: District) => {
      showToast.success(
        t("districts.created", { name: newDistrict.nameEn }) ||
          `District "${newDistrict.nameEn}" created successfully!`
      );

      setDialogType(null);
      setSelectedDistrict(null);
      
      // Trigger navigation to last row after data refresh
      setTimeout(() => {
        setNewRowAdded(true);
      }, 500);

      setTimeout(() => setLastAddedRowId(null), 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t(errorMessage || "districts.createError") || "Failed to create district");
    },
  });

  const updateDistrictMutation = useUpdateDistrict({
    onSuccess: (updatedDistrict: District) => {
      showToast.success(
        t("districts.updated", { name: updatedDistrict.nameEn }) ||
          `District "${updatedDistrict.nameEn}" updated successfully!`
      );

      const updatedId: number = typeof updatedDistrict.id === 'string' ? parseInt(updatedDistrict.id as any, 10) : (updatedDistrict.id as number);
      setRowEdited(true);
      setLastEditedRowId(updatedId);
      setDialogType(null);
      setSelectedDistrict(null);

      setTimeout(() => setLastEditedRowId(null), 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t("districts.updateError") || errorMessage || "Failed to update district");
    },
  });

  const deleteDistrictMutation = useDeleteDistrict({
    onSuccess: () => {
      showToast.success(t("districts.deleted") || "District deleted successfully!");
      setRowDeleted(true);
      setDialogType(null);
      setSelectedDistrict(null);

      setTimeout(() => setLastDeletedRowIndex(null), 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t(errorMessage || "districts.deleteError") || "Failed to delete district");
    },
  });

  // Dialog state
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  // Navigation state variables
  const [newRowAdded, setNewRowAdded] = useState<boolean>(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<number | null>(null);

  const [rowEdited, setRowEdited] = useState<boolean>(false);
  const [lastEditedRowId, setLastEditedRowId] = useState<number | null>(null);

  const [rowDeleted, setRowDeleted] = useState<boolean>(false);
  const [lastDeletedRowIndex, setLastDeletedRowIndex] = useState<number | null>(null);

  const apiRef = useGridApiRef();

  const stableDistricts = useMemo((): District[] => districts, [districts]);

  const isAnyLoading: boolean =
    loading ||
    createDistrictMutation.isPending ||
    updateDistrictMutation.isPending ||
    deleteDistrictMutation.isPending;

  // Dialog methods
  const openDialog = useCallback((type: DialogType, district: District | null = null) => {
    setDialogType(type);
    setSelectedDistrict(district);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedDistrict(null);
  }, []);

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (formdata: CreateDistrictRequest) => {
      try {
        if (dialogType === "edit" && selectedDistrict?.id) {
          await updateDistrictMutation.mutateAsync({
            ...formdata,
            id: selectedDistrict.id,
          } as any);
        } else if (dialogType === "add") {
          await createDistrictMutation.mutateAsync(formdata as any);
        }
      } catch (error) {
        console.error("District form submission error:", error);
      }
    },
    [dialogType, selectedDistrict, updateDistrictMutation, createDistrictMutation]
  );

  // Delete handler
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!selectedDistrict?.id) return;

    try {
      const deletedId: number = typeof selectedDistrict.id === 'string' ? parseInt(selectedDistrict.id as any, 10) : (selectedDistrict.id as number);
      const currentIndex: number = districts.findIndex((d) => d.id === deletedId);

      await deleteDistrictMutation.mutateAsync(deletedId);

      setLastDeletedRowIndex(currentIndex);
    } catch (error) {
      console.error("Delete district error:", error);
    }
  }, [selectedDistrict, districts, deleteDistrictMutation]);

  // Action handlers
  const onEdit = useCallback((district: District) => {
    openDialog("edit", district);
  }, [openDialog]);

  const onView = useCallback((district: District) => {
    openDialog("view", district);
  }, [openDialog]);

  const onDelete = useCallback((district: District) => {
    openDialog("delete", district);
  }, [openDialog]);

  const onAdd = useCallback(() => {
    openDialog("add");
  }, [openDialog]);

  // Grid navigation effects - Navigate to last row when adding new district
  useEffect(() => {
    if (newRowAdded && districts.length > 0 && apiRef.current && !isFetching) {
      // Navigate to the last row
      const lastRowIndex = districts.length - 1;
      const lastRowId = districts[lastRowIndex].id;
      
      const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
      const lastPage = Math.floor(lastRowIndex / pageSize);
      
      apiRef.current.setPage(lastPage);
      apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastRowId]) });
      
      setTimeout(() => {
        if (apiRef.current) {
          apiRef.current.scrollToIndexes({ rowIndex: lastRowIndex, colIndex: 0 });
        }
      }, 300);
      
      setNewRowAdded(false);
    }
  }, [newRowAdded, districts, isFetching]);

  useEffect(() => {
    if (rowEdited && districts.length > 0 && apiRef.current) {
      const editedIndex = districts.findIndex((row) => row.id === lastEditedRowId);
      if (editedIndex >= 0) {
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(editedIndex / pageSize);
        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: editedIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastEditedRowId!]) });
      }
      setRowEdited(false);
    }
  }, [rowEdited, districts.length, lastEditedRowId]);

  useEffect(() => {
    if (rowDeleted && districts.length > 0 && apiRef.current) {
      let prevRowIndex = (lastDeletedRowIndex ?? 0) - 1;
      if (prevRowIndex < 0) prevRowIndex = 0;

      if (prevRowIndex >= 0 && prevRowIndex < districts.length) {
        const prevRowId = districts[prevRowIndex].id;
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(prevRowIndex / pageSize);
        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: prevRowIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([prevRowId]) });
      }
      setRowDeleted(false);
    }
  }, [rowDeleted, districts.length, lastDeletedRowIndex]);

  const invalidate = useInvalidateDistricts();

  const handleRefresh = useCallback(() => {
    // Invalidate cache and refetch to ensure fresh data
    invalidate();
    refetch();
  }, [invalidate, refetch]);

  return {
    // State
    dialogType,
    selectedDistrict,
    loading: isAnyLoading,
    districts: stableDistricts,
    apiRef,
    error,
    isFetching,

    // Dialog methods
    openDialog,
    closeDialog,

    // Form and action handlers
    handleFormSubmit,
    handleDelete,
    handleRefresh,

    // Action methods
    onEdit,
    onView,
    onDelete,
    onAdd,

    // Mutation states
    isCreating: createDistrictMutation.isPending,
    isUpdating: updateDistrictMutation.isPending,
    isDeleting: deleteDistrictMutation.isPending,

    // Highlighting/Navigation state for card view
    lastAddedId: lastAddedRowId,
    lastEditedId: lastEditedRowId,
    lastDeletedIndex: lastDeletedRowIndex,
  };
};

export default useDistrictGridLogic;

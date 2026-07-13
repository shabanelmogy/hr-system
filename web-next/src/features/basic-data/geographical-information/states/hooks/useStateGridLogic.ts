// hooks/useStateGridLogic.ts - TanStack Query Implementation
import { showToast } from "@/shared/components/feedback";
import { extractErrorMessage } from "@/shared/utils";
import { useGridApiRef, GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { State, CreateStateRequest } from "../types/State";
import {
  useStates,
  useCreateState,
  useDeleteState,
  useUpdateState,
} from "./useStateQueries";


export type DialogType = "add" | "edit" | "view" | "delete" | null;

interface UseStateGridLogicReturn {
  // State
  dialogType: DialogType;
  selectedState: State | null;
  loading: boolean;
  states: State[];
  apiRef: React.MutableRefObject<GridApi>;
  error: any;
  isFetching: boolean;

  // Dialog methods
  openDialog: (type: DialogType, state?: State | null) => void;
  closeDialog: () => void;

  // Form and action handlers
  handleFormSubmit: (formdata: CreateStateRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;

  // Action methods
  onEdit: (state: State) => void;
  onView: (state: State) => void;
  onDelete: (state: State) => void;
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

const useStateGridLogic = (): UseStateGridLogicReturn => {
  const { t } = useTranslation();

  const {
    data: states = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useStates();

  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error);
      showToast.error(errorMessage || t("states.fetchError") || "Failed to fetch states");
    }
  }, [error, t]);

  const createStateMutation = useCreateState({
    onSuccess: (newState: State) => {
      showToast.success(
        t("states.created", { name: newState.nameEn }) ||
          `State "${newState.nameEn}" created successfully!`
      );

      const newId: number = typeof newState.id === 'string' ? parseInt(newState.id as any, 10) : (newState.id as number);
      console.log("🟢 State created with ID:", newId);
      setLastAddedRowId(newId);
      setNewRowAdded(true);
      setDialogType(null);
      setSelectedState(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastAddedRowId");
        setLastAddedRowId(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t(errorMessage || "states.createError") || "Failed to create state");
    },
  });

  const updateStateMutation = useUpdateState({
    onSuccess: (updatedState: State) => {
      showToast.success(
        t("states.updated", { name: updatedState.nameEn }) ||
          `State "${updatedState.nameEn}" updated successfully!`
      );

      const updatedId: number = typeof updatedState.id === 'string' ? parseInt(updatedState.id as any, 10) : (updatedState.id as number);
      console.log("🟡 State updated with ID:", updatedId);
      setRowEdited(true);
      setLastEditedRowId(updatedId);
      setDialogType(null);
      setSelectedState(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastEditedRowId");
        setLastEditedRowId(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t("states.updateError") || errorMessage || "Failed to update state");
    },
  });

  const deleteStateMutation = useDeleteState({
    onSuccess: () => {
      showToast.success(t("states.deleted") || "State deleted successfully!");
      console.log("🔴 State deleted, lastDeletedRowIndex:", lastDeletedRowIndex);
      setRowDeleted(true);
      setDialogType(null);
      setSelectedState(null);

      setTimeout(() => {
        console.log("🔄 Clearing lastDeletedRowIndex");
        setLastDeletedRowIndex(null);
      }, 4000);
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t(errorMessage || "states.deleteError") || "Failed to delete state");
    },
  });

  // Dialog state
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // Navigation state variables
  const [newRowAdded, setNewRowAdded] = useState<boolean>(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<number | null>(null);

  const [rowEdited, setRowEdited] = useState<boolean>(false);
  const [lastEditedRowId, setLastEditedRowId] = useState<number | null>(null);

  const [rowDeleted, setRowDeleted] = useState<boolean>(false);
  const [lastDeletedRowIndex, setLastDeletedRowIndex] = useState<number | null>(null);

  const apiRef = useGridApiRef();

  const stableStates = useMemo((): State[] => states, [states]);

  const isAnyLoading: boolean =
    loading ||
    createStateMutation.isPending ||
    updateStateMutation.isPending ||
    deleteStateMutation.isPending;

  // Dialog methods
  const openDialog = useCallback((type: DialogType, state: State | null = null) => {
    setDialogType(type);
    setSelectedState(state);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedState(null);
  }, []);

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (formdata: CreateStateRequest) => {
      try {
        if (dialogType === "edit" && selectedState?.id) {
          await updateStateMutation.mutateAsync({
            ...formdata,
            id: selectedState.id,
          } as any);
        } else if (dialogType === "add") {
          await createStateMutation.mutateAsync(formdata as any);
        }
      } catch (error) {
        console.error("State form submission error:", error);
      }
    },
    [dialogType, selectedState, updateStateMutation, createStateMutation]
  );

  // Delete handler
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!selectedState?.id) return;

    try {
      const deletedId: number = typeof selectedState.id === 'string' ? parseInt(selectedState.id as any, 10) : (selectedState.id as number);
      const currentIndex: number = states.findIndex((s) => s.id === deletedId);

      await deleteStateMutation.mutateAsync(deletedId);

      setLastDeletedRowIndex(currentIndex);
    } catch (error) {
      console.error("Delete state error:", error);
    }
  }, [selectedState, states, deleteStateMutation]);

  // Action handlers
  const onEdit = useCallback((state: State) => {
    openDialog("edit", state);
  }, [openDialog]);

  const onView = useCallback((state: State) => {
    openDialog("view", state);
  }, [openDialog]);

  const onDelete = useCallback((state: State) => {
    openDialog("delete", state);
  }, [openDialog]);

  const onAdd = useCallback(() => {
    openDialog("add");
  }, [openDialog]);

  // Grid navigation effects
  useEffect(() => {
    if (newRowAdded && states.length > 0 && apiRef.current && lastAddedRowId) {
      const newRowIndex = states.findIndex((s) => s.id === lastAddedRowId);
      if (newRowIndex >= 0) {
        console.log("Found new row at index:", newRowIndex);
        
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(newRowIndex / pageSize);
        
        apiRef.current.setPage(newPage);
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastAddedRowId]) });
        
        setTimeout(() => {
          apiRef.current.scrollToIndexes({ rowIndex: newRowIndex, colIndex: 0 });
        }, 500);
        
        console.log("Row selection and scroll initiated for ID:", lastAddedRowId);
      } else {
        console.log("New row not found in states list yet, will retry...");
        return;
      }
      setNewRowAdded(false);
    }
  }, [newRowAdded, states, lastAddedRowId]);

  // Additional effect to handle row selection when data is refetched
  useEffect(() => {
    if (
      !isFetching &&
      !loading &&
      lastAddedRowId &&
      newRowAdded &&
      states.length > 0 &&
      apiRef.current
    ) {
      const newRowIndex = states.findIndex((s) => s.id === lastAddedRowId);
      
      if (newRowIndex >= 0) {
        console.log("Found new row at index:", newRowIndex, "for ID:", lastAddedRowId);
        
        setTimeout(() => {
          if (apiRef.current) {
            const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
            const newPage = Math.floor(newRowIndex / pageSize);
            
            apiRef.current.setPage(newPage);
            apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastAddedRowId]) });
            
            setTimeout(() => {
              if (apiRef.current) {
                apiRef.current.scrollToIndexes({ rowIndex: newRowIndex, colIndex: 0 });
              }
            }, 200);
            
            console.log("Successfully selected and scrolled to new row:", lastAddedRowId);
          }
        }, 300);
        
        setNewRowAdded(false);
        setLastAddedRowId(null);
      }
    }
  }, [isFetching, loading, lastAddedRowId, newRowAdded, states]);

  useEffect(() => {
    if (rowEdited && states.length > 0 && apiRef.current) {
      const editedIndex = states.findIndex((row) => row.id === lastEditedRowId);
      if (editedIndex >= 0) {
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(editedIndex / pageSize);
        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: editedIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastEditedRowId!]) });
      }
      setRowEdited(false);
    }
  }, [rowEdited, states.length, lastEditedRowId]);

  useEffect(() => {
    if (rowDeleted && states.length > 0 && apiRef.current) {
      let prevRowIndex = lastDeletedRowIndex - 1;
      if (prevRowIndex < 0) {
        prevRowIndex = 0;
      }

      if (prevRowIndex >= 0 && prevRowIndex < states.length) {
        const prevRowId = states[prevRowIndex].id;
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(prevRowIndex / pageSize);
        
        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: prevRowIndex, colIndex: 0 });
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([prevRowId]) });
      }
      setRowDeleted(false);
    }
  }, [rowDeleted, states.length, lastDeletedRowIndex]);



  return {
    // State
    dialogType,
    selectedState,
    loading: isAnyLoading,
    states: stableStates,
    apiRef,
    error,
    isFetching,

    // Dialog methods
    openDialog,
    closeDialog,

    // Form and action handlers
    handleFormSubmit,
    handleDelete,
    handleRefresh: refetch,

    // Action methods
    onEdit,
    onView,
    onDelete,
    onAdd,

    // Mutation states for advanced UI feedback
    isCreating: createStateMutation.isPending,
    isUpdating: updateStateMutation.isPending,
    isDeleting: deleteStateMutation.isPending,

    // Highlighting/Navigation state for card view
    lastAddedId: lastAddedRowId,
    lastEditedId: lastEditedRowId,
    lastDeletedIndex: lastDeletedRowIndex,
  };
};

export default useStateGridLogic;
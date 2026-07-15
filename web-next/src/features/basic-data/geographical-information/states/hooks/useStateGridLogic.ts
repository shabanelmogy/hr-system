import { showToast } from "@/shared/components/feedback";
import { useGridCrudController, useGridRowNavigation } from "@/shared/hooks";
import { extractErrorMessage } from "@/shared/utils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useEffect, type MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import type { CreateStateRequest, State } from "../types/State";
import {
  useCreateState,
  useDeleteState,
  useStates,
  useUpdateState,
} from "./useStateQueries";

export type DialogType = "add" | "edit" | "view" | "delete" | null;

interface UseStateGridLogicReturn {
  dialogType: DialogType;
  selectedState: State | null;
  loading: boolean;
  states: State[];
  apiRef: MutableRefObject<GridApi>;
  error: Error | null;
  isFetching: boolean;
  openDialog: (type: DialogType, state?: State | null) => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: CreateStateRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (state: State) => void;
  onView: (state: State) => void;
  onDelete: (state: State) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
}

export default function useStateGridLogic(): UseStateGridLogicReturn {
  const { t } = useTranslation();
  const query = useStates();
  const states = query.data ?? [];
  const apiRef = useGridApiRef();

  useEffect(() => {
    if (query.error) {
      showToast.error(
        extractErrorMessage(query.error) || t("states.fetchError") || "Failed to fetch states",
      );
    }
  }, [query.error, t]);

  const createMutation = useCreateState({
    onSuccess: (state) => showToast.success(
      t("states.created", { name: state.nameEn }) || `State "${state.nameEn}" created successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("states.createError") || "Failed to create state",
    ),
  });
  const updateMutation = useUpdateState({
    onSuccess: (state) => showToast.success(
      t("states.updated", { name: state.nameEn }) || `State "${state.nameEn}" updated successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("states.updateError") || "Failed to update state",
    ),
  });
  const deleteMutation = useDeleteState({
    onSuccess: () => showToast.success(t("states.deleted") || "State deleted successfully!"),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("states.deleteError") || "Failed to delete state",
    ),
  });

  const crud = useGridCrudController<State, CreateStateRequest>({
    items: states,
    create: createMutation.mutateAsync,
    update: (id, form) => updateMutation.mutateAsync({ ...form, id }),
    remove: deleteMutation.mutateAsync,
    refresh: () => query.refetch(),
  });

  useGridRowNavigation({
    apiRef,
    items: states,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    clearLastAdded: crud.clearLastAdded,
    clearLastEdited: crud.clearLastEdited,
    clearLastDeleted: crud.clearLastDeleted,
  });

  return {
    dialogType: crud.dialogType,
    selectedState: crud.selectedItem,
    loading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    states,
    apiRef,
    error: query.error,
    isFetching: query.isFetching,
    openDialog: crud.openDialog,
    closeDialog: crud.closeDialog,
    handleFormSubmit: crud.handleFormSubmit,
    handleDelete: crud.handleDelete,
    handleRefresh: crud.handleRefresh,
    onEdit: crud.onEdit,
    onView: crud.onView,
    onDelete: crud.onDelete,
    onAdd: crud.onAdd,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
  };
}

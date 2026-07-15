import showToast from "@/shared/components/feedback/Toast";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridRowNavigation } from "@/shared/hooks/useGridRowNavigation";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useEffect, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type {
  AddressType,
  CreateAddressTypeRequest,
} from "../types/AddressType";
import {
  useAddressTypes,
  useCreateAddressType,
  useDeleteAddressType,
  useUpdateAddressType,
} from "./useAddressTypeQueries";

export type AddressTypeDialogType = "add" | "edit" | "view" | "delete" | null;

interface UseAddressTypeGridLogicReturn {
  dialogType: AddressTypeDialogType;
  selectedItem: AddressType | null;
  loading: boolean;
  items: AddressType[];
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  openDialog: (type: AddressTypeDialogType, item?: AddressType | null) => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: CreateAddressTypeRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
}

export default function useAddressTypeGridLogic(): UseAddressTypeGridLogicReturn {
  const { t } = useTranslation();
  const query = useAddressTypes();
  const items = query.data ?? [];
  const apiRef = useGridApiRef();

  useEffect(() => {
    if (query.error) {
      showToast.error(
        extractErrorMessage(query.error) ||
          t("addressTypes.fetchError") ||
          "Failed to fetch address types",
      );
    }
  }, [query.error, t]);

  const createMutation = useCreateAddressType({
    onSuccess: (item) => showToast.success(
      t("addressTypes.created", { name: item.nameEn }) ||
        `Address type "${item.nameEn}" created successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) ||
        t("addressTypes.createError") ||
        "Failed to create address type",
    ),
  });
  const updateMutation = useUpdateAddressType({
    onSuccess: (item) => showToast.success(
      t("addressTypes.updated", { name: item.nameEn }) ||
        `Address type "${item.nameEn}" updated successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) ||
        t("addressTypes.updateError") ||
        "Failed to update address type",
    ),
  });
  const deleteMutation = useDeleteAddressType({
    onSuccess: () => showToast.success(
      t("addressTypes.deleted") || "Address type deleted successfully!",
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) ||
        t("addressTypes.deleteError") ||
        "Failed to delete address type",
    ),
  });

  const crud = useGridCrudController<AddressType, CreateAddressTypeRequest>({
    items,
    create: createMutation.mutateAsync,
    update: (id, form) => updateMutation.mutateAsync({ ...form, id: Number(id) }),
    remove: deleteMutation.mutateAsync,
    refresh: () => query.refetch(),
  });

  useGridRowNavigation({
    apiRef,
    items,
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
    selectedItem: crud.selectedItem,
    loading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    items,
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

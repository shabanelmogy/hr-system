import showToast from "@/shared/components/feedback/Toast";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridRowNavigation } from "@/shared/hooks/useGridRowNavigation";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { CreateDistrictRequest, District } from "../types/District";
import {
  useCreateDistrict,
  useDeleteDistrict,
  useDistricts,
  useInvalidateDistricts,
  useUpdateDistrict,
} from "./useDistrictQueries";

export type DialogType = "add" | "edit" | "view" | "delete" | null;

interface UseDistrictGridLogicReturn {
  dialogType: DialogType;
  selectedDistrict: District | null;
  loading: boolean;
  districts: District[];
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  openDialog: (type: DialogType, district?: District | null) => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: CreateDistrictRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (district: District) => void;
  onView: (district: District) => void;
  onDelete: (district: District) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
}

export default function useDistrictGridLogic(): UseDistrictGridLogicReturn {
  const { t } = useTranslation();
  const query = useDistricts();
  const districts = query.data ?? [];
  const apiRef = useGridApiRef();
  const invalidate = useInvalidateDistricts();
  const refresh = useCallback(async () => {
    await invalidate();
    await query.refetch();
  }, [invalidate, query]);

  useEffect(() => {
    if (query.error) {
      showToast.error(
        extractErrorMessage(query.error) || t("districts.fetchError") || "Failed to fetch districts",
      );
    }
  }, [query.error, t]);

  const createMutation = useCreateDistrict({
    onSuccess: (district) => showToast.success(
      t("districts.created", { name: district.nameEn }) ||
        `District "${district.nameEn}" created successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("districts.createError") || "Failed to create district",
    ),
  });
  const updateMutation = useUpdateDistrict({
    onSuccess: (district) => showToast.success(
      t("districts.updated", { name: district.nameEn }) ||
        `District "${district.nameEn}" updated successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("districts.updateError") || "Failed to update district",
    ),
  });
  const deleteMutation = useDeleteDistrict({
    onSuccess: () => showToast.success(t("districts.deleted") || "District deleted successfully!"),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("districts.deleteError") || "Failed to delete district",
    ),
  });

  const crud = useGridCrudController<District, CreateDistrictRequest>({
    items: districts,
    create: createMutation.mutateAsync,
    update: (id, form) => updateMutation.mutateAsync({ ...form, id }),
    remove: deleteMutation.mutateAsync,
    refresh,
  });

  useGridRowNavigation({
    apiRef,
    items: districts,
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
    selectedDistrict: crud.selectedItem,
    loading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    districts,
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

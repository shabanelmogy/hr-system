import { showToast } from "@/shared/components/feedback/transient";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useEffect, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { Country, CreateCountryRequest } from "../types/Country";
import {
  useCountries,
  useCreateCountry,
  useDeleteCountry,
  useUpdateCountry,
} from "./useCountryQueries";

type DialogType = "add" | "edit" | "view" | "delete" | null;

interface UseCountryGridLogicReturn {
  dialogType: DialogType;
  selectedCountry: Country | null;
  loading: boolean;
  countries: Country[];
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  openDialog: (type: DialogType, country?: Country | null) => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: CreateCountryRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (country: Country) => void;
  onView: (country: Country) => void;
  onDelete: (country: Country) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
}

export default function useCountryGridLogic(): UseCountryGridLogicReturn {
  const { t } = useTranslation();
  const query = useCountries();
  const countries = query.data ?? [];
  const apiRef = useGridApiRef();

  useEffect(() => {
    if (query.error) {
      showToast.error(
        extractErrorMessage(query.error) || t("countries.fetchError") || "Failed to fetch countries",
      );
    }
  }, [query.error, t]);

  const createMutation = useCreateCountry({
    onSuccess: (country) => showToast.success(
      t("countries.created", { name: country.nameEn }) ||
        `Country "${country.nameEn}" created successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.createError") || "Failed to create country",
    ),
  });
  const updateMutation = useUpdateCountry({
    onSuccess: (country) => showToast.success(
      t("countries.updated", { name: country.nameEn }) ||
        `Country "${country.nameEn}" updated successfully!`,
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.updateError") || "Failed to update country",
    ),
  });
  const deleteMutation = useDeleteCountry({
    onSuccess: () => showToast.success(t("countries.deleted") || "Country deleted successfully!"),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.deleteError") || "Failed to delete country",
    ),
  });

  const crud = useGridCrudController<Country, CreateCountryRequest>({
    items: countries,
    create: createMutation.mutateAsync,
    update: (id, form) => updateMutation.mutateAsync({ ...form, id }),
    remove: deleteMutation.mutateAsync,
    refresh: () => query.refetch(),
  });

  useGridCrudMarkerCleanup({
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    clearLastAdded: crud.clearLastAdded,
    clearLastEdited: crud.clearLastEdited,
    clearLastDeleted: crud.clearLastDeleted,
  });

  return {
    dialogType: crud.dialogType,
    selectedCountry: crud.selectedItem,
    loading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    countries,
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

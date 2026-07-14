import { showToast } from "@/shared/components/feedback";
import { extractErrorMessage } from "@/shared/utils";
import { useGridApiRef, GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Country, CreateCountryRequest } from "../types/Country";
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
  apiRef: React.MutableRefObject<GridApi>;
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
  lastAddedId: number | null;
  lastEditedId: number | null;
  lastDeletedIndex: number | null;
}

/**
 * Scrolls the MUI DataGrid to a specific row by its numeric id and selects it.
 * Called only after the refetch has completed so the row is guaranteed to exist.
 */
function scrollGridToRow(
  apiRef: React.MutableRefObject<GridApi>,
  rows: Country[],
  rowId: number | null
) {
  if (!rowId || !apiRef.current || rows.length === 0) return;
  const index = rows.findIndex((r) => r.id === rowId);
  if (index < 0) return;
  const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
  apiRef.current.setPage(Math.floor(index / pageSize));
  apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([rowId]) });
  setTimeout(() => {
    apiRef.current?.scrollToIndexes({ rowIndex: index, colIndex: 0 });
  }, 300);
}

const useCountryGridLogic = (): UseCountryGridLogicReturn => {
  const { t } = useTranslation();

  const {
    data: countries = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useCountries();

  // Show a toast when the query itself errors out
  useEffect(() => {
    if (error) {
      showToast.error(
        extractErrorMessage(error) ||
          t("countries.fetchError") ||
          "Failed to fetch countries"
      );
    }
  }, [error, t]);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // ── Post-mutation navigation state ────────────────────────────────────────
  const [lastAddedRowId, setLastAddedRowId] = useState<number | null>(null);
  const [lastEditedRowId, setLastEditedRowId] = useState<number | null>(null);
  const [lastDeletedRowIndex, setLastDeletedRowIndex] = useState<number | null>(null);

  const apiRef = useGridApiRef();

  // ── Grid scroll effects ───────────────────────────────────────────────────
  // Wait for isFetching to finish so the new row is in `countries` before scrolling.

  useEffect(() => {
    if (!lastAddedRowId || loading || isFetching || countries.length === 0) return undefined;
    scrollGridToRow(apiRef, countries, lastAddedRowId);
    const timer = setTimeout(() => setLastAddedRowId(null), 4000);
    return () => clearTimeout(timer);
  }, [lastAddedRowId, countries, loading, isFetching]);

  useEffect(() => {
    if (!lastEditedRowId || loading || countries.length === 0) return undefined;
    scrollGridToRow(apiRef, countries, lastEditedRowId);
    const timer = setTimeout(() => setLastEditedRowId(null), 4000);
    return () => clearTimeout(timer);
  }, [lastEditedRowId, countries, loading]);

  useEffect(() => {
    if (lastDeletedRowIndex === null || loading || countries.length === 0) return undefined;
    const prevIndex = Math.max(0, Math.min(lastDeletedRowIndex - 1, countries.length - 1));
    const prevId = countries[prevIndex]?.id;
    if (prevId == null) return undefined;
    const numericId = typeof prevId === "string" ? parseInt(prevId, 10) : prevId;
    scrollGridToRow(apiRef, countries, numericId);
    const timer = setTimeout(() => setLastDeletedRowIndex(null), 4000);
    return () => clearTimeout(timer);
  }, [lastDeletedRowIndex, countries, loading]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createCountryMutation = useCreateCountry({
    onSuccess: (newCountry: Country) => {
      showToast.success(
        t("countries.created", { name: newCountry.nameEn }) ||
          `Country "${newCountry.nameEn}" created successfully!`
      );
      const id =
        typeof newCountry.id === "string"
          ? parseInt(newCountry.id, 10)
          : newCountry.id;
      setLastAddedRowId(id);
      setDialogType(null);
      setSelectedCountry(null);
    },
    onError: (error: Error) => {
      showToast.error(
        extractErrorMessage(error) ||
          t("countries.createError") ||
          "Failed to create country"
      );
    },
  });

  const updateCountryMutation = useUpdateCountry({
    onSuccess: (updatedCountry: Country) => {
      showToast.success(
        t("countries.updated", { name: updatedCountry.nameEn }) ||
          `Country "${updatedCountry.nameEn}" updated successfully!`
      );
      const id =
        typeof updatedCountry.id === "string"
          ? parseInt(updatedCountry.id, 10)
          : updatedCountry.id;
      setLastEditedRowId(id);
      setDialogType(null);
      setSelectedCountry(null);
    },
    onError: (error: Error) => {
      showToast.error(
        extractErrorMessage(error) ||
          t("countries.updateError") ||
          "Failed to update country"
      );
    },
  });

  const deleteCountryMutation = useDeleteCountry({
    onSuccess: () => {
      showToast.success(
        t("countries.deleted") || "Country deleted successfully!"
      );
      setDialogType(null);
      setSelectedCountry(null);
    },
    onError: (error: Error) => {
      showToast.error(
        extractErrorMessage(error) ||
          t("countries.deleteError") ||
          "Failed to delete country"
      );
    },
  });

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const openDialog = useCallback(
    (type: DialogType, country: Country | null = null) => {
      setDialogType(type);
      setSelectedCountry(country);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedCountry(null);
  }, []);

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    async (formdata: CreateCountryRequest) => {
      try {
        if (dialogType === "edit" && selectedCountry?.id) {
          await updateCountryMutation.mutateAsync({
            ...formdata,
            id: selectedCountry.id,
          });
        } else if (dialogType === "add") {
          await createCountryMutation.mutateAsync(formdata);
        }
      } catch (error) {
        throw error;
      }
    },
    [dialogType, selectedCountry, updateCountryMutation, createCountryMutation]
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!selectedCountry?.id) return;
    try {
      const deletedId =
        typeof selectedCountry.id === "string"
          ? parseInt(selectedCountry.id, 10)
          : selectedCountry.id;
      const currentIndex = countries.findIndex((c) => c.id === deletedId);
      await deleteCountryMutation.mutateAsync(deletedId);
      setLastDeletedRowIndex(currentIndex);
    } catch {
      // Errors are handled in mutation onError callbacks
    }
  }, [selectedCountry, countries, deleteCountryMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    dialogType,
    selectedCountry,
    loading:
      loading ||
      createCountryMutation.isPending ||
      updateCountryMutation.isPending ||
      deleteCountryMutation.isPending,
    countries,
    apiRef,
    error,
    isFetching,
    openDialog,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    handleRefresh,
    onEdit: useCallback((c: Country) => openDialog("edit", c), [openDialog]),
    onView: useCallback((c: Country) => openDialog("view", c), [openDialog]),
    onDelete: useCallback((c: Country) => openDialog("delete", c), [openDialog]),
    onAdd: useCallback(() => openDialog("add"), [openDialog]),
    isCreating: createCountryMutation.isPending,
    isUpdating: updateCountryMutation.isPending,
    isDeleting: deleteCountryMutation.isPending,
    lastAddedId: lastAddedRowId,
    lastEditedId: lastEditedRowId,
    lastDeletedIndex: lastDeletedRowIndex,
  };
};

export default useCountryGridLogic;

import { useCallback, useState } from "react";
import {
  GridRowEditStopReasons,
  GridRowModes,
  type GridRowEditStopParams,
  type GridRowId,
  type GridRowModesModel,
  type MuiEvent,
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import { useUpdateLocalizationMutation } from "./useLocalizationQueries";
import { localizationEntrySchema } from "../validation/localizationValidation";
import type { LocalizationEntry } from "../types/localization";

export default function useLocalizationRowEditing(culture: string) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { t } = useTranslation();
  const updateLocalization = useUpdateLocalizationMutation(culture);

  const handleEditClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.Edit },
    }));
  }, []);

  const handleSaveClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.View },
    }));
  }, []);

  const handleCancelClick = useCallback((id: GridRowId) => () => {
    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  }, []);

  const handleRowEditStop = useCallback(
    (params: GridRowEditStopParams, event: MuiEvent) => {
      if (params.reason === GridRowEditStopReasons.rowFocusOut) {
        event.defaultMuiPrevented = true;
      }
    },
    [],
  );

  const processRowUpdate = useCallback(
    async (newRow: LocalizationEntry, oldRow: LocalizationEntry) => {
      const validation = localizationEntrySchema.safeParse({
        language: culture,
        key: newRow.key,
        value: newRow.value,
      });

      if (!validation.success) {
        showSnackbar(
          "error",
          validation.error.issues.map((issue) => issue.message),
          t("messages.error"),
        );
        return oldRow;
      }

      try {
        await updateLocalization.mutateAsync(validation.data);
        showSnackbar(
          "success",
          [t("localizationApi.localizationUpdated")],
          t("messages.success"),
        );
        return newRow;
      } catch (error) {
        HandleApiError(error, (notification) => {
          showSnackbar("error", notification.messages, notification.title);
        });
        return oldRow;
      }
    },
    [culture, showSnackbar, t, updateLocalization],
  );

  const handleProcessRowUpdateError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : t("messages.error");
      showSnackbar("error", [message], t("messages.error"));
    },
    [showSnackbar, t],
  );

  return {
    rowModesModel,
    setRowModesModel,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleRowEditStop,
    processRowUpdate,
    handleProcessRowUpdateError,
    SnackbarComponent,
  };
}

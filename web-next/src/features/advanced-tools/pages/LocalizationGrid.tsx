"use client";

import { useState, useEffect } from "react";
import {
  GridActionsCellItem,
  type GridColDef,
  type GridRowEditStopParams,
  type GridRowId,
  type GridRowModesModel,
  type GridRowParams,
  GridRowModes,
  GridRowEditStopReasons,
  type MuiEvent,
} from "@mui/x-data-grid";
import { Box, CircularProgress, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/navigation/header";
import { ClientDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { useSnackbar } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import {
  useLocalization,
  useUpdateLocalization,
  type LocalizationEntry,
} from "../hooks/useAdvancedToolsQueries";
import { localizationEntrySchema } from "../validation/localizationValidation";
import { DEFAULT_ROWS_PER_PAGE } from "@/shared/constants/pagination";

const LocalizationGrid = () => {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  
  const [paginationModel, setPaginationModel] = useState({
    pageSize: DEFAULT_ROWS_PER_PAGE,
    page: 0,
  });

  const { t } = useTranslation();
  const theme = useTheme();
  const currentCulture = theme.direction === "rtl" ? "ar-EG" : "en-US";

  const { data: rows = [], isLoading, error } = useLocalization(currentCulture);
  const updateLocalizationMutation = useUpdateLocalization(currentCulture);

  const columns: GridColDef[] = [
    {
      field: "key",
      headerName: t("general.key"),
      flex: 1,
      editable: false,
    },
    {
      field: "value",
      headerName: t("general.value"),
      flex: 2,
      editable: true,
    },
    {
      field: "actions",
      headerName: t("actions.buttons"),
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }: GridRowParams) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  // React Query Error Handling
  useEffect(() => {
    if (error && !isLoading) {
      HandleApiError(error, (updatedState: { messages: string[]; title: string }) => {
        showSnackbar("error", updatedState.messages, updatedState.title);
      });
    }
  }, [error, isLoading, showSnackbar]);

  // Row editing handlers
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowEditStop = (params: GridRowEditStopParams, event: MuiEvent) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = async (newRow: LocalizationEntry, oldRow: LocalizationEntry) => {
    try {
      const validation = localizationEntrySchema.safeParse({
        Language: currentCulture,
        key: newRow.key,
        value: newRow.value,
      });

      if (!validation.success) {
        showSnackbar(
          "error",
          validation.error.issues.map((issue) => issue.message),
          t("messages.error")
        );
        return oldRow;
      }

      await updateLocalizationMutation.mutateAsync(validation.data);

      showSnackbar("success", [t("localizationApi.localizationUpdated")], t("messages.success"));
      return newRow;
    } catch (error) {
      HandleApiError(error, (updatedState: { messages: string[]; title: string }) => {
        showSnackbar("error", updatedState.messages, updatedState.title);
      });
      return oldRow;
    }
  };

  const handleProcessRowUpdateError = (error: unknown) => {
    const message = error instanceof Error ? error.message : t("messages.error");
    showSnackbar("error", [message], t("messages.error"));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ContentWrapper>
        <PageHeader
          title={t("localizationApi.title")}
          subTitle={t("localizationApi.subTitle")}
        />
        <ClientDataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20, 30]}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
        />
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default LocalizationGrid;

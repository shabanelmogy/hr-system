"use client";

import { useState, useEffect } from "react";
import {
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { Box, CircularProgress, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { MyHeader } from "@/shared/components/common";
import ClientDataGrid from "@/shared/components/common/datagrid/ClientDataGrid";
import { ContentWrapper } from "@/shared/components/layout";
import { useSnackbar } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import { useLocalization, useUpdateLocalization } from "../hooks/useAdvancedToolsQueries";
import { localizationEntrySchema } from "../validation/localizationValidation";

const LocalizationGrid = () => {
  const [rowModesModel, setRowModesModel] = useState<any>({});
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const { t } = useTranslation();
  const theme = useTheme();
  const currentCulture = theme.direction === "rtl" ? "ar-EG" : "en-US";

  const { data: rows = [], isLoading, error } = useLocalization(currentCulture);
  const updateLocalizationMutation = useUpdateLocalization(currentCulture);

  const columns = [
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
      getActions: ({ id }: { id: any }) => {
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
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
    }
  }, [error, isLoading, showSnackbar]);

  // Row editing handlers
  const handleEditClick = (id: any) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: any) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: any) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowEditStop = (params: any, event: any) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = async (newRow: any, oldRow: any) => {
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
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
      return oldRow;
    }
  };

  const handleProcessRowUpdateError = (error: any) => {
    showSnackbar("error", [error.message], t("messages.error"));
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
        <MyHeader
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

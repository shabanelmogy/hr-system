import { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { Box, CircularProgress, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { apiService } from "@/shared/services";
import { MyHeader } from "@/shared/components";
import { MyContentsWrapper } from "@/layouts/components";
import { useSnackbar } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import { apiRoutes } from "@/routes";

const LocalizationGrid = () => {
  // State variables
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const { t } = useTranslation();
  const theme = useTheme();
  const currentCulture = theme.direction === "rtl" ? "ar-EG" : "en-US";

  // Columns definition
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
        const isInEditMode = (rowModesModel as any)[id]?.mode === GridRowModes.Edit;

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

  // Load localization data
  const loadLocalizationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get(
        `${apiRoutes.advancedTools.getLocalizationApi}/${currentCulture}`
      );
      // Assuming response.value is an object, we need to convert it to an array
      const data = response.value;

      // Check if data is an object with key-value pairs
      const formattedData = Object.keys(data).map((key, index) => ({
        id: index, // Use index as id (or generate a unique ID if possible)
        key: key, // Localization key
        value: data[key], // Localization value
      }));
      setRows(formattedData); // Set the rows in the state
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
    } finally {
      setIsLoading(false);
    }
  }, [setRows, currentCulture]);

  // Initialize component
  useEffect(() => {
    loadLocalizationData();
  }, [loadLocalizationData]);

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

  const processRowUpdate = async (newRow: any) => {
    try {
      // Validate data
      if (!newRow.key || !newRow.value) {
        showSnackbar(
          "error",
          [t("localizationApi.keyAndValueMustNotBeEmpty")],
          t("messages.error")
        );
        return rows.find((row) => row.id === newRow.id);
      }

      // Use apiService for API request
      await apiService.put(
        `${apiRoutes.advancedTools.updateLocalizationApi}/${currentCulture}`,
        {
          Language: currentCulture,
          key: newRow.key,
          value: newRow.value,
        }
      );

      showSnackbar(`success`, [t("localizationApi.localizationUpdated")], t("messages.success"));

      const updatedRow = { ...newRow, isNew: false };
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      return updatedRow;
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
      return rows.find((row) => row.id === newRow.id);
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
      <MyContentsWrapper>
        <MyHeader
          title={t("localizationApi.title")}
          subTitle={t("localizationApi.subTitle")}
        />
        <DataGrid
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
      </MyContentsWrapper>
      {SnackbarComponent}
    </>
  );
};

export default LocalizationGrid;

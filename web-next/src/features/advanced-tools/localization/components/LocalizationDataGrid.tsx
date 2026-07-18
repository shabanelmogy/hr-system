"use client";

import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  GridActionsCellItem,
  GridRowModes,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientDataGrid } from "@/shared/components/data-grid";
import { DEFAULT_ROWS_PER_PAGE } from "@/shared/constants/pagination";
import useLocalizationRowEditing from "../hooks/useLocalizationRowEditing";
import type { LocalizationEntry } from "../types/localization";

interface LocalizationDataGridProps {
  culture: string;
  rows: LocalizationEntry[];
}

export default function LocalizationDataGrid({
  culture,
  rows,
}: LocalizationDataGridProps) {
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: DEFAULT_ROWS_PER_PAGE,
    page: 0,
  });
  const {
    rowModesModel,
    setRowModesModel,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleRowEditStop,
    processRowUpdate,
    handleProcessRowUpdateError,
    SnackbarComponent,
  } = useLocalizationRowEditing(culture);

  const columns = useMemo<GridColDef<LocalizationEntry>[]>(
    () => [
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
        getActions: ({ id }: GridRowParams<LocalizationEntry>) => {
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
    ],
    [
      handleCancelClick,
      handleEditClick,
      handleSaveClick,
      rowModesModel,
      t,
    ],
  );

  return (
    <>
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
      {SnackbarComponent}
    </>
  );
}

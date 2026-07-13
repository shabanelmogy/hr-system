import { GridColDef, GridActionsColDef } from "@mui/x-data-grid";
import type { TFunction } from "i18next";
import type { FileItem } from "../../../types/File";
import FileTypeIcon from "./FileTypeIcon";
import { renderDate } from "@/shared/components";

export default function makeFileColumns({
  t,
  getActions,
}: {
  t: TFunction;
  getActions: NonNullable<GridActionsColDef["getActions"]>;
}): Array<GridColDef | GridActionsColDef> {
  const renderExtCell = (params: any) => {
    const file = params.row as FileItem;
    return <FileTypeIcon file={file} />;
  };

  return [
    {
      field: "fileName",
      headerName: t("files.fileName"),
      flex: 2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fileExtension",
      headerName: t("files.extension"),
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: renderExtCell,
    },
    {
      field: "contentType",
      headerName: t("files.contentType"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createdOn",
      headerName: t("general.createdOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: renderDate,
    },
    {
      field: "updatedOn",
      headerName: t("general.updatedOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: renderDate,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions.buttons"),
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      getActions,
    } as GridActionsColDef,
  ];
}

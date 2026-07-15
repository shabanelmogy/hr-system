import type {
  GridActionsColDef,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import type { TFunction } from "i18next";
import type { FileItem } from "../../../types/File";
import FileTypeIcon from "./FileTypeIcon";
import { renderDate } from "@/shared/components/common";

export default function makeFileColumns({
  t,
  getActions,
}: {
  t: TFunction;
  getActions: NonNullable<GridActionsColDef<FileItem>["getActions"]>;
}): Array<GridColDef<FileItem> | GridActionsColDef<FileItem>> {
  const renderExtCell = (params: GridRenderCellParams<FileItem>) => {
    const file = params.row;
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
    } as GridActionsColDef<FileItem>,
  ];
}

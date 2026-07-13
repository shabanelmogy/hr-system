import { GridActionsCellItem } from "@mui/x-data-grid";
import { Delete, Download, Visibility } from "@mui/icons-material";
import type { TFunction } from "i18next";
import type { FileItem } from "../../../types/File";
import { VIEWABLE_EXTENSIONS } from "../constants/fileTypes.type";


export const canViewFile = (file: FileItem): boolean => {
  const extension = file.fileExtension;
  if (!extension) return false;
  const cleanExtension = extension.startsWith(".")
    ? extension.substring(1).toLowerCase()
    : extension.toLowerCase();
  return (VIEWABLE_EXTENSIONS as readonly string[]).includes(cleanExtension);
};

export default function makeFileActions({
  t,
  onDownload,
  onView,
  onDelete,
}: {
  t: TFunction;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}) {
  return (params: any) => {
    const file = params.row as FileItem;
    const actions = [
      <GridActionsCellItem
        key={`download-${file.id}`}
        icon={<Download sx={{ fontSize: 25 }} />}
        label={t("files.download")}
        title={t("files.download")}
        color="primary"
        onClick={() => onDownload(file)}
      />,
    ];

    if (canViewFile(file)) {
      actions.push(
        <GridActionsCellItem
          key={`view-${file.id}`}
          icon={<Visibility sx={{ fontSize: 25 }} />}
          label={t("files.view")}
          title={t("files.view")}
          color="info"
          onClick={() => onView(file)}
        />
      );
    }

    actions.push(
      <GridActionsCellItem
        key={`delete-${file.id}`}
        icon={<Delete sx={{ fontSize: 25 }} />}
        label={t("files.delete")}
        title={t("files.delete")}
        color="error"
        onClick={() => onDelete(file)}
      />
    );

    return actions;
  };
}

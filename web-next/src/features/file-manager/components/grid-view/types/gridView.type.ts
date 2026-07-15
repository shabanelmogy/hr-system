import type { GridApi } from "@mui/x-data-grid";
import type { RefObject } from "react";
import type { TFunction } from "i18next";
import type { FileItem } from "../../../types/File";

export interface FilesDataGridProps {
  files: FileItem[];
  loading: boolean;
  apiRef?: RefObject<GridApi | null> | null;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onAdd: () => void;
  t: TFunction;
}

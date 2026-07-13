import type { FileItem} from "../../../types/File";
import type { TFunction } from "i18next";

export interface FilesDataGridProps {
  files: FileItem[];
  loading: boolean;
  apiRef: any;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onAdd: () => void;
  t: TFunction;
}

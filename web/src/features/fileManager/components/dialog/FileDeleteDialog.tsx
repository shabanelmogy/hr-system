import { MyDeleteConfirmation } from "@/shared/components";
import type { FileItem } from "../../types/File";

interface FileDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedFile: FileItem | null;
  loading?: boolean;
  t: (key: string) => string;
}

const FileDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedFile,
  loading = false,
}: FileDeleteDialogProps) => {

  const deletedField: string = selectedFile
    ? `${selectedFile.fileName}${selectedFile.fileExtension || ""}`
    : "";

  return (
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
      loading={loading}
    />
  );
};

export default FileDeleteDialog;

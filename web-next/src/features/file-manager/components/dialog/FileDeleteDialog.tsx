import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import type { FileItem } from "../../types/File";

interface FileDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedFile: FileItem | null;
  loading?: boolean;
}

const FileDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedFile,
  loading = false,
}: FileDeleteDialogProps) => {

  const itemLabel = selectedFile
    ? `${selectedFile.fileName}${selectedFile.fileExtension || ""}`
    : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      itemLabel={itemLabel}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
};

export default FileDeleteDialog;

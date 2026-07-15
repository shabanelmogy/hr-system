import { Dialog } from "@mui/material";
import FileUpload from "../file-upload/FileUploadPage"

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (fileName: string) => void;
  onError?: (errors: unknown) => void;
  loading?: boolean;
}

const FileUploadDialog = ({ open, onClose, onSuccess}: FileUploadDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FileUpload
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </Dialog>
  );
};

export default FileUploadDialog;

import { CardActions, Button } from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface FileItem {
  file: File;
  status: string;
  progress?: number;
  error?: string;
}

interface FileUploadActionsProps {
  files: FileItem[];
  isUploading: boolean;
  onUpload: () => void;
  onClose: () => void;
}

const FileUploadActions = ({ files, isUploading, onUpload, onClose }: FileUploadActionsProps) => {

  const { t } = useTranslation();

  return (
    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onUpload}
        disabled={files.length === 0 || isUploading}
        fullWidth
        sx={{ mr: 1 }}
      >
        {isUploading ? t("files.Uploading") : t("files.upload")}
      </Button>
      <Button
        variant="outlined"
        startIcon={<CloseIcon />}
        onClick={onClose}
        disabled={isUploading}
        fullWidth
      >
        {t("files.close")}
      </Button>
    </CardActions>
  );
};

export default FileUploadActions;

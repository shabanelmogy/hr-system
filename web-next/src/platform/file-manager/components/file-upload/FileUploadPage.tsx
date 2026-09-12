import { Box, Card } from "@mui/material";
import { FileDropZone } from "@/shared/components/file-upload";
import { useTranslation } from "react-i18next";
import useFileUpload from "./hooks/useFileUpload";
import UploadHeader from "./components/UploadHeader";
import UploadList from "./components/UploadList";
import UploadActions from "./components/UploadActions";
import { FILE_CONFIG } from "./constants/fileUpload.type";

interface FileUploadProps {
  onSuccess?: (fileName: string) => void;
  onClose?: () => void;
  multiple?: boolean;
}

const FileUpload = ({ onSuccess, onClose, multiple = true }: FileUploadProps) => {
  const { t } = useTranslation();
  const {
    files,
    isUploading,
    globalError,
    selectFiles,
    removeFile,
    uploadFiles,
    SnackbarComponent,
    accept,
  } = useFileUpload({ onSuccess, onClose, multiple });

  const maxFileSizeMb = FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);

  return (
    <Card variant="outlined" sx={{ overflow: "hidden" }}>
      <UploadHeader globalError={globalError} />

      <Box sx={{ m: 2 }}>
        <FileDropZone
          title={t("files.dragAndDropFiles")}
          description={t("files.orClick")}
          hint={t("files.maxFileSize", { size: maxFileSizeMb })}
          ariaLabel={t("files.selectFiles")}
          disabled={isUploading}
          multiple={multiple}
          accept={accept}
          onFilesSelected={selectFiles}
        />
      </Box>

      <UploadList files={files} isUploading={isUploading} onRemoveFile={removeFile} />

      <UploadActions files={files} isUploading={isUploading} onUpload={uploadFiles} onClose={onClose} />

      {SnackbarComponent}
    </Card>
  );
};

export default FileUpload;

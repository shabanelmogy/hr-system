// FileUpload.tsx - Container, split into smaller components
import { Box } from "@mui/material";
import { StyledCard } from "@/shared/components/fileUpload/styledComponents";
import useFileUpload from "./hooks/useFileUpload";
import UploadHeader from "./components/UploadHeader";
import UploadDropArea from "./components/UploadDropArea";
import UploadList from "./components/UploadList";
import UploadActions from "./components/UploadActions";

interface FileUploadProps {
  onSuccess?: (fileName: string) => void;
  onClose?: () => void;
  multiple?: boolean;
}

const FileUpload = ({ onSuccess, onClose, multiple = true }: FileUploadProps) => {
  const {
    files,
    isUploading,
    dragActive,
    globalError,
    handleDrag,
    handleDrop,
    handleFileInput,
    removeFile,
    uploadFiles,
    SnackbarComponent,
    accept,
  } = useFileUpload({ onSuccess, onClose, multiple });

  return (
    <StyledCard>
      <UploadHeader globalError={globalError} />

      <Box sx={{ m: 2 }}>
        <UploadDropArea
          dragActive={dragActive}
          isUploading={isUploading}
          multiple={multiple}
          accept={accept}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onFileInput={handleFileInput}
        />
      </Box>

      <UploadList files={files} isUploading={isUploading} onRemoveFile={removeFile} />

      <UploadActions files={files} isUploading={isUploading} onUpload={uploadFiles} onClose={onClose} />

      {SnackbarComponent}
    </StyledCard>
  );
};

export default FileUpload;

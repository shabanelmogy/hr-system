import { useRef } from "react";
import { Button, Typography } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { VisuallyHiddenInput, StyledDropZone } from "./styledComponents";
import { useTranslation } from "react-i18next";

interface DropZoneProps {
  dragActive: boolean;
  isUploading: boolean;
  multiple: boolean;
  accept: string;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
}

const DropZone = ({
  dragActive,
  isUploading,
  multiple,
  accept,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileInput,
  onClick,
}: DropZoneProps) => {
  const inputRef = useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileInput?.(e);
    // Allow selecting the same file again by resetting the input value
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClick = () => {
    // Reset value before opening dialog so same-file selection triggers onChange
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const { t } = useTranslation();

  return (
    <StyledDropZone
      className={dragActive ? "dragover" : ""}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick || handleClick}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t("files.dragAndDropFiles")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("files.orClick")}
      </Typography>

      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        disabled={isUploading}
        onClick={(e) => { e.stopPropagation(); handleClick(); }}
      >
        {t("files.selectFiles")}
        <VisuallyHiddenInput
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          multiple={multiple}
          disabled={isUploading}
          accept={accept}
        />
      </Button>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Max file size: 10MB
      </Typography>
    </StyledDropZone>
  );
};

export default DropZone;

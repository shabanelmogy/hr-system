/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
  Fade,
  CardContent,
  Stack,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Styled components
const Input = styled("input")({
  display: "none",
});

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragActive",
})<{ isDragActive: boolean }>(
  ({ theme, isDragActive }) => ({
    border: `2px dashed ${
      isDragActive ? theme.palette.primary.main : theme.palette.divider
    }`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2.5),
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: isDragActive
      ? theme.palette.action.hover
      : theme.palette.background.paper,
    transition: theme.transitions.create(["border-color", "background-color"], {
      duration: theme.transitions.duration.short,
    }),
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  })
);

interface UploadExcelProps {
  title?: string;
  description?: string;
  acceptedFileTypes?: string | string[];
  onFileSelect?: (file: File) => void;
  validateFile?: (file: File) => boolean;
  selectedFile?: File | null;
  isLoading?: boolean;
  progress?: number;
  getFileInfo?: () => string;
  icon?: React.ReactElement;
}

const UploadExcel = ({
  title = "Drag and drop your file here or click to browse",
  description = "Supported formats: all files",
  acceptedFileTypes = "*",
  onFileSelect,
  validateFile,
  selectedFile = null,
  isLoading = false,
  progress = 0,
  getFileInfo,
  icon = <CloudUploadIcon sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />,
}: UploadExcelProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  // Reset file input when selectedFile is null
  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

  // Convert acceptedFileTypes to an accept string for the input element
  const acceptString = Array.isArray(acceptedFileTypes)
    ? acceptedFileTypes.join(",")
    : acceptedFileTypes;

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // If a custom validation function is provided, use it
    if (validateFile && !validateFile(file)) {
      return;
    }

    // Default validation for accepted file types
    if (acceptedFileTypes !== "*") {
      const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;

      const isAccepted = Array.isArray(acceptedFileTypes)
        ? acceptedFileTypes.includes(fileExtension)
        : acceptedFileTypes === fileExtension;

      if (!isAccepted) {
        console.error(`File type ${fileExtension} is not supported`);
        return;
      }
    }

    // Call the onFileSelect callback with the selected file
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <DropZone
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {React.cloneElement(icon as React.ReactElement<any>, {
          color: isDragActive ? "primary" : "text.secondary",
        })}

        <Stack direction={"row"} spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {description}
          </Typography>
        </Stack>

        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileChange}
        />
      </DropZone>

      {selectedFile && (
        <Fade in={true}>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FileIcon color="primary" />
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  wordBreak: "break-word",
                }}
              >
                {t("imports.selectedFile")}: {selectedFile.name}
              </Typography>
            </Box>

            {getFileInfo && (
              <Chip size="small" label={getFileInfo()} color="primary" />
            )}
          </Box>
        </Fade>
      )}

      {isLoading && progress > 0 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {isLoading && progress === 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </CardContent>
  );
};

export default UploadExcel;

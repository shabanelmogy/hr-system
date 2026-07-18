import React from "react";
import { Button, Card, CardActions, Divider, Stack, Typography } from "@mui/material";
import {
  Upload as UploadIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import SpreadsheetFilePicker from "./SpreadsheetFilePicker";

interface UploadSectionProps {
  selectedFile: File | null;
  loading: boolean;
  loadingText: string;
  uploadProgress: number;
  countriesCount: number;
  failedCount: number;
  uploadableCount: number;
  onFileSelect: (file: File) => void;
  validateFile: (file: File) => boolean;
  onUpload: () => void;
  onClear: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  selectedFile,
  loading,
  loadingText,
  uploadProgress,
  countriesCount,
  failedCount,
  uploadableCount,
  onFileSelect,
  validateFile,
  onUpload,
  onClear,
}) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ mb: { xs: 3, sm: 4 }, overflow: "visible" }}>
      <SpreadsheetFilePicker
        selectedFile={selectedFile}
        loading={loading && loadingText !== ""}
        progress={uploadProgress}
        rowCount={countriesCount}
        onFileSelect={onFileSelect}
        validateFile={validateFile}
      />

      <Divider />

      <CardActions
        sx={{
          p: 2,
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={onUpload}
            disabled={uploadableCount === 0 || loading}
            size="large"
          >
            {failedCount > 0
              ? t("imports.retryFailed") || "Retry failed"
              : t("imports.uploadData") || "Upload"}
          </Button>
          {countriesCount > 0 && (
            <Button
              variant="outlined"
              startIcon={
                <CancelIcon
                  sx={{ color: (theme) => theme.palette.error.light }}
                />
              }
              onClick={onClear}
              disabled={loading}
            >
              <Typography sx={{ color: (theme) => theme.palette.error.light }} >{t("imports.clearData") || "Clear"}</Typography>
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};

export default UploadSection;

import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import {
  Box,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { XLSX_FILE_ACCEPT } from "@/shared/services/excelService";
import { FileDropZone } from "./FileDropZone";

export interface SpreadsheetImportFilePickerProps {
  selectedFile: File | null;
  busy: boolean;
  progress: number;
  maxSizeMb: number;
  maxRows: number;
  rowCountLabel: string;
  hint: string;
  icon: ReactNode;
  onFileSelect: (file: File) => void;
  validateFile: (file: File) => boolean;
}

export function SpreadsheetImportFilePicker({
  selectedFile,
  busy,
  progress,
  maxSizeMb,
  maxRows,
  rowCountLabel,
  hint,
  icon,
  onFileSelect,
  validateFile,
}: SpreadsheetImportFilePickerProps) {
  const { t } = useTranslation();

  const selectFile = (files: File[]) => {
    const file = files[0];
    if (file && validateFile(file)) onFileSelect(file);
  };

  return (
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <FileDropZone
        title={t("imports.dragDropText")}
        description={t("imports.filePolicy", { maxSizeMb, maxRows })}
        ariaLabel={t("imports.selectSpreadsheet")}
        accept={XLSX_FILE_ACCEPT}
        disabled={busy}
        icon={icon}
        onFilesSelected={selectFile}
      />

      {!selectedFile && !busy && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {hint}
        </Typography>
      )}

      {selectedFile && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          aria-live="polite"
          sx={{ mt: 2, alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <DescriptionOutlined color="primary" aria-hidden="true" />
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            {t("imports.selectedFile")}: {selectedFile.name}
          </Typography>
          <Chip
            size="small"
            label={rowCountLabel}
            color="primary"
            variant="outlined"
          />
        </Stack>
      )}

      {busy && (
        <Box sx={{ mt: 2 }} aria-live="polite">
          {progress > 0 ? (
            <LinearProgress
              variant="determinate"
              value={progress}
              aria-label={t("imports.uploadProgress", { progress })}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} aria-label={t("general.loading")} />
            </Box>
          )}
        </Box>
      )}
    </CardContent>
  );
}

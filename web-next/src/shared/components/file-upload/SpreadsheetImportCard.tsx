import CancelOutlined from "@mui/icons-material/CancelOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import UploadOutlined from "@mui/icons-material/UploadOutlined";
import { Button, Card, CardActions, Divider, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetImportFilePicker } from "./SpreadsheetImportFilePicker";

export interface SpreadsheetImportCardProps {
  selectedFile: File | null;
  busy: boolean;
  progress: number;
  maxSizeMb: number;
  maxRows: number;
  rowCount: number;
  rowCountLabel: string;
  hint: string;
  icon: ReactNode;
  uploadableCount: number;
  canSubmit?: boolean;
  locked?: boolean;
  onFileSelect: (file: File) => void;
  validateFile: (file: File) => boolean;
  onSubmit: () => void;
  onClear: () => void;
  onDownloadTemplate: () => void;
}

export function SpreadsheetImportCard({
  selectedFile,
  busy,
  progress,
  maxSizeMb,
  maxRows,
  rowCount,
  rowCountLabel,
  hint,
  icon,
  uploadableCount,
  canSubmit = true,
  locked = false,
  onFileSelect,
  validateFile,
  onSubmit,
  onClear,
  onDownloadTemplate,
}: SpreadsheetImportCardProps) {
  const { t } = useTranslation();

  return (
    <Card sx={{ mb: { xs: 2, sm: 3 }, overflow: "visible" }}>
      <SpreadsheetImportFilePicker
        selectedFile={selectedFile}
        busy={busy || locked}
        progress={progress}
        maxSizeMb={maxSizeMb}
        maxRows={maxRows}
        rowCountLabel={rowCountLabel}
        hint={hint}
        icon={icon}
        onFileSelect={onFileSelect}
        validateFile={validateFile}
      />

      <Divider />

      <CardActions sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ width: "100%" }}
        >
          <Button
            variant="contained"
            startIcon={<UploadOutlined />}
            onClick={onSubmit}
            disabled={locked || !canSubmit || uploadableCount === 0 || busy}
          >
            {t("imports.uploadData")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined />}
            onClick={onDownloadTemplate}
            disabled={busy}
          >
            {t("imports.downloadTemplate")}
          </Button>
          {rowCount > 0 && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<CancelOutlined />}
              onClick={onClear}
              disabled={busy || locked}
            >
              {t("imports.clearData")}
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}

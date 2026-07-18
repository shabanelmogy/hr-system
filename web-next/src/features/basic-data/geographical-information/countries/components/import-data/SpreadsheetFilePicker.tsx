import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import TableViewOutlined from "@mui/icons-material/TableViewOutlined";
import {
  Box,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { FileDropZone } from "@/shared/components/file-upload";
import { useTranslation } from "react-i18next";

interface SpreadsheetFilePickerProps {
  selectedFile: File | null;
  loading: boolean;
  progress: number;
  rowCount: number;
  onFileSelect: (file: File) => void;
  validateFile: (file: File) => boolean;
}

const SpreadsheetFilePicker = ({
  selectedFile,
  loading,
  progress,
  rowCount,
  onFileSelect,
  validateFile,
}: SpreadsheetFilePickerProps) => {
  const { t } = useTranslation();

  const selectFile = (files: File[]) => {
    const file = files[0];
    if (file && validateFile(file)) onFileSelect(file);
  };

  return (
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <FileDropZone
        title={t("imports.dragDropText")}
        description={t("imports.supportedFormats")}
        ariaLabel={t("imports.selectSpreadsheet")}
        accept=".xlsx"
        disabled={loading}
        icon={<TableViewOutlined />}
        onFilesSelected={selectFile}
      />

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
            label={t("imports.countryRows", { count: rowCount })}
            color="primary"
            variant="outlined"
          />
        </Stack>
      )}

      {loading && (
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
};

export default SpreadsheetFilePicker;

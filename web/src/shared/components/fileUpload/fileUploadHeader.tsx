import { Typography, Alert } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface FileUploadHeaderProps {
  globalError: string | null;
}

const FileUploadHeader = ({ globalError }: FileUploadHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <CloudUploadIcon color="primary" />
        {t("files.uploadFiles")}
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}
    </>
  );
};

export default FileUploadHeader;

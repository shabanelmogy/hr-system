import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import { Alert, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UploadHeaderProps } from "../types/fileUpload.type";

const UploadHeader = ({ globalError }: UploadHeaderProps) => {
  const { t } = useTranslation();

  return (
    <CardContent sx={{ pb: globalError ? 1 : 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <CloudUploadOutlined color="primary" aria-hidden="true" />
        <Typography variant="h6" component="h2">
          {t("files.uploadFiles")}
        </Typography>
      </Stack>
      {globalError && (
        <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-line" }}>
          {globalError}
        </Alert>
      )}
    </CardContent>
  );
};

export default UploadHeader;

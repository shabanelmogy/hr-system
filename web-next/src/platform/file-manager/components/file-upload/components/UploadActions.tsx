import CloseOutlined from "@mui/icons-material/CloseOutlined";
import UploadOutlined from "@mui/icons-material/UploadOutlined";
import { Button, CardActions } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UploadActionsProps } from "../types/fileUpload.type";

const UploadActions = ({ files, isUploading, onUpload, onClose }: UploadActionsProps) => {
  const { t } = useTranslation();

  return (
    <CardActions sx={{ justifyContent: "flex-end", gap: 1.5, px: 2, pb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<CloseOutlined />}
        onClick={onClose}
        disabled={isUploading}
      >
        {t("files.close")}
      </Button>
      <Button
        variant="contained"
        startIcon={<UploadOutlined />}
        onClick={onUpload}
        disabled={files.length === 0 || isUploading}
      >
        {isUploading ? t("files.Uploading") : t("files.upload")}
      </Button>
    </CardActions>
  );
};

export default UploadActions;

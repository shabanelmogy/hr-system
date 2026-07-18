import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import { CircularProgress } from "@mui/material";
import type { FileUploadItem } from "../types/fileUpload.type";

interface UploadStatusIconProps {
  status: FileUploadItem["status"];
}

const UploadStatusIcon = ({ status }: UploadStatusIconProps) => {
  if (status === "uploading") return <CircularProgress size={24} aria-hidden="true" />;
  if (status === "success") return <CheckCircleOutlineRounded color="success" aria-hidden="true" />;
  if (status === "error") return <ErrorOutlineRounded color="error" aria-hidden="true" />;
  return <InsertDriveFileOutlined color="action" aria-hidden="true" />;
};

export default UploadStatusIcon;

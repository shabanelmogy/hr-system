import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  IconButton,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatFileSize } from "@/shared/utils/formatFileSize";
import type { FileUploadItem } from "../types/fileUpload.type";
import UploadStatusIcon from "./UploadStatusIcon";

interface UploadListItemProps {
  fileItem: FileUploadItem;
  index: number;
  isUploading: boolean;
  onRemove: (index: number) => void;
}

const UploadListItem = ({ fileItem, index, isUploading, onRemove }: UploadListItemProps) => {
  const { t } = useTranslation();
  const hasProgress = fileItem.status === "uploading" || fileItem.status === "success";

  return (
    <ListItem
      sx={{
        mb: 1,
        border: 1,
        borderColor: fileItem.status === "error" ? "error.main" : "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
      secondaryAction={
        <Tooltip title={t("files.removeFiles")}>
          <span>
            <IconButton
              edge="end"
              aria-label={`${t("files.removeFiles")}: ${fileItem.file.name}`}
              onClick={() => onRemove(index)}
              disabled={isUploading && fileItem.status === "uploading"}
              color="error"
            >
              <DeleteOutlineRounded />
            </IconButton>
          </span>
        </Tooltip>
      }
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <UploadStatusIcon status={fileItem.status} />
      </ListItemIcon>
      <ListItemText
        primary={fileItem.file.name}
        secondary={
          <Box component="span" sx={{ display: "block", pe: 1 }}>
            <Typography component="span" variant="caption" color="text.secondary">
              {formatFileSize(fileItem.file.size)} · {t(`files.uploadStatus.${fileItem.status}`)}
            </Typography>
            {hasProgress && (
              <LinearProgress
                variant="determinate"
                value={fileItem.status === "success" ? 100 : fileItem.progress}
                color={fileItem.status === "success" ? "success" : "primary"}
                aria-label={`${fileItem.file.name}: ${fileItem.progress}%`}
                sx={{ mt: 1, height: 6, borderRadius: 1 }}
              />
            )}
            {fileItem.error && (
              <Typography component="span" variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                {fileItem.error}
              </Typography>
            )}
          </Box>
        }
        slotProps={{ secondary: { component: "div" } }}
      />
    </ListItem>
  );
};

export default UploadListItem;

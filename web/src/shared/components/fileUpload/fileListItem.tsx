import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import FileStatusIcon from "./fileStatusIcon";
import { formatFileSize } from "@/shared/utils/formatFileSize";

interface FileItem {
  file: File;
  status: string;
  progress?: number;
  error?: string;
}

interface FileListItemProps {
  fileItem: FileItem;
  index: number;
  isUploading: boolean;
  onRemove: (index: number) => void;
}

const FileListItem = ({ fileItem, index, isUploading, onRemove }: FileListItemProps) => {
  const { t } = useTranslation();

  return (
    <ListItem
      sx={{
        bgcolor: "background.paper",
        mb: 1,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <ListItemIcon>
        <FileStatusIcon status={fileItem.status} />
      </ListItemIcon>
      <ListItemText
        primary={fileItem.file.name}
        secondary={
          <Box component="span">
            <Typography variant="caption" display="block">
              {formatFileSize(fileItem.file.size)}
            </Typography>
            {(fileItem.status === "uploading" || fileItem.status === "success") && (
              <LinearProgress
                variant={fileItem.status === "uploading" ? "determinate" : "determinate"}
                value={
                  fileItem.status === "success"
                    ? 100
                    : fileItem.progress || 0
                }
                sx={{ 
                  mt: 1,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: (theme) => theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: fileItem.status === "success" 
                      ? (theme) => theme.palette.success.main
                      : (theme) => theme.palette.primary.main,
                    borderRadius: 1,
                  },
                }}
              />
            )}
            {fileItem.error && (
              <Typography variant="caption" color="error">
                {fileItem.error}
              </Typography>
            )}
          </Box>
        }
        secondaryTypographyProps={{ component: 'span' }}
      />
        <Tooltip title={t("files.removeFiles")}>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => onRemove(index)}
            disabled={isUploading && fileItem.status === "uploading"}
          >
            <DeleteIcon sx={{ color: (theme) => theme.palette.error.main }} />
          </IconButton>
        </Tooltip>
    </ListItem>
  );
};

export default FileListItem;
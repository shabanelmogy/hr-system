import { Box, Fade, List, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UploadListProps } from "../types/fileUpload.type";
import UploadListItem from "./UploadListItem";

const UploadList = ({ files, isUploading, onRemoveFile }: UploadListProps) => {
  const { t } = useTranslation();
  if (files.length === 0) return null;

  return (
    <Fade in>
      <Box sx={{ mx: 2, mb: 2 }}>
        <Typography variant="subtitle1" component="h3" sx={{ mb: 1 }}>
          {t("files.selectedFiles")} ({files.length})
        </Typography>
        <List disablePadding>
          {files.map((fileItem, index) => (
            <UploadListItem
              key={`${fileItem.file.name}-${fileItem.file.size}-${fileItem.file.lastModified}`}
              fileItem={fileItem}
              index={index}
              isUploading={isUploading}
              onRemove={onRemoveFile}
            />
          ))}
        </List>
      </Box>
    </Fade>
  );
};

export default UploadList;

/* eslint-disable react/prop-types */
// components/FileUpload/FileList.jsx
import { Box, Typography, List, Fade } from "@mui/material";
import FileListItem from "./fileListItem";
import { useTranslation } from "react-i18next";

interface FileItem {
  file: File;
  status: string;
  progress?: number;
  error?: string;
}

interface FileListProps {
  files: FileItem[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
}

const FileList = ({ files, isUploading, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;
  const { t } = useTranslation();

  return (
    <Fade in={true}>
      <Box sx={{ m: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t("files.selectedFiles")} ({files.length})
        </Typography>
        <List>
          {files.map((fileItem, index) => (
            <FileListItem
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

export default FileList;

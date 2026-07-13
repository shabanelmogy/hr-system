import React from "react";
import { Box, Avatar } from "@mui/material";
import type { FileItem } from "../../../types/File";
import { getFileTypeMeta } from "../constants/fileTypes.type";

// Normalize extension from a FileItem
const getExtension = (file: FileItem): string => {
  const ext = file?.fileExtension || "";
  const clean = ext.startsWith(".") ? ext.substring(1) : ext;
  return clean.toLowerCase();
};

export type FileTypeIconProps = {
  file: FileItem;
};

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ file }) => {
  const ext = getExtension(file);
  const meta = getFileTypeMeta(ext);
  const Ico = meta.Icon;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Avatar
        variant="rounded"
        sx={{ width: 28, height: 28, bgcolor: meta.bg, color: meta.fg }}
      >
        <Ico fontSize="small" />
      </Avatar>
    </Box>
  );
};

export default FileTypeIcon;

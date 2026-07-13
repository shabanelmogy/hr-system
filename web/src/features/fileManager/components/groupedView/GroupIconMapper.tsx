import React from "react";
import {
  Image as ImageIcon,
  Description as DocumentIcon,
  TableChart as SpreadsheetIcon,
  Slideshow as PresentationIcon,
  PictureAsPdf as PdfIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";

export const getGroupIcon = (group: string): React.ReactNode => {
  switch (group) {
    case "Images":
      return <ImageIcon />;
    case "Documents":
      return <DocumentIcon />;
    case "Spreadsheets":
      return <SpreadsheetIcon />;
    case "Presentations":
      return <PresentationIcon />;
    case "PDFs":
      return <PdfIcon />;
    case "Audio":
      return <AudioIcon />;
    case "Video":
      return <VideoIcon />;
    case "Archives":
      return <ArchiveIcon />;
    case "Code":
      return <CodeIcon />;
    default:
      return <FileIcon />;
  }
};

export const getGroupColor = (group: string): string => {
  switch (group) {
    case "Images":
      return "#4CAF50";
    case "Documents":
      return "#2196F3";
    case "Spreadsheets":
      return "#FF9800";
    case "Presentations":
      return "#E91E63";
    case "PDFs":
      return "#F44336";
    case "Audio":
      return "#9C27B0";
    case "Video":
      return "#FF5722";
    case "Archives":
      return "#795548";
    case "Code":
      return "#607D8B";
    default:
      return "#9E9E9E";
  }
};

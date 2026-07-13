/* eslint-disable react/prop-types */
import {
  Add,
  Backup,
  CloudDownload,
  CloudUpload,
  Delete,
  Edit,
  SaveAlt as ExportIcon,
  FileDownload,
  GridOn,
  PictureAsPdf,
  Print,
  Save,
  Sync,
  TableChart,
} from "@mui/icons-material";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

export const MyOverlayLoader = ({
  open = false,
  actionType = "default",
  message = "",
  customIcon = null,
  customColor = null,
  spinnerSize = 60,
  spinnerThickness = 4,
  backgroundColor = "rgba(0, 0, 0, 0.7)",
  zIndex = null,
}) => {
  // Default action type configurations
  const actionConfigs = {
    // Export types
    pdf: {
      icon: <PictureAsPdf sx={{ fontSize: 48, color: "#f44336", mb: 1 }} />,
      defaultMessage: "Exporting PDF...",
    },
    excel: {
      icon: <GridOn sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />,
      defaultMessage: "Exporting Excel...",
    },
    csv: {
      icon: <TableChart sx={{ fontSize: 48, color: "#ff9800", mb: 1 }} />,
      defaultMessage: "Exporting CSV...",
    },
    print: {
      icon: <Print sx={{ fontSize: 48, color: "#9c27b0", mb: 1 }} />,
      defaultMessage: "Preparing Print...",
    },
    download: {
      icon: <FileDownload sx={{ fontSize: 48, color: "#607d8b", mb: 1 }} />,
      defaultMessage: "Downloading...",
    },
    export: {
      icon: <ExportIcon sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />,
      defaultMessage: "Exporting...",
    },

    // CRUD operations
    save: {
      icon: <Save sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />,
      defaultMessage: "Saving...",
    },
    update: {
      icon: <Edit sx={{ fontSize: 48, color: "#ff9800", mb: 1 }} />,
      defaultMessage: "Updating...",
    },
    delete: {
      icon: <Delete sx={{ fontSize: 48, color: "#f44336", mb: 1 }} />,
      defaultMessage: "Deleting...",
    },
    create: {
      icon: <Add sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />,
      defaultMessage: "Creating...",
    },

    // Upload/Sync operations
    upload: {
      icon: <CloudUpload sx={{ fontSize: 48, color: "#3f51b5", mb: 1 }} />,
      defaultMessage: "Uploading...",
    },
    sync: {
      icon: <Sync sx={{ fontSize: 48, color: "#00bcd4", mb: 1 }} />,
      defaultMessage: "Synchronizing...",
    },
    backup: {
      icon: <Backup sx={{ fontSize: 48, color: "#795548", mb: 1 }} />,
      defaultMessage: "Creating Backup...",
    },
    restore: {
      icon: <CloudDownload sx={{ fontSize: 48, color: "#009688", mb: 1 }} />,
      defaultMessage: "Restoring...",
    },

    // Default
    default: {
      icon: <ExportIcon sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />,
      defaultMessage: "Processing...",
    },
  };

  // Get configuration for current action type
  const config = actionConfigs[actionType] || actionConfigs.default;

  // Use custom icon if provided, otherwise use config icon
  const displayIcon = customIcon || config.icon;

  // Use provided message or default message for action type
  const displayMessage = message || config.defaultMessage;

  // Apply custom color to icon if provided
  const finalIcon =
    customColor && !customIcon
      ? React.cloneElement(config.icon, {
          sx: { ...config.icon.props.sx, color: customColor },
        })
      : displayIcon;

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: zIndex || ((theme) => theme.zIndex.drawer + 1),
        backgroundColor: backgroundColor,
      }}
      open={open}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {/* Action Type Icon */}
        {finalIcon}

        <CircularProgress
          color="primary"
          size={spinnerSize}
          thickness={spinnerThickness}
        />

        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            color: "white",
          }}
        >
          {displayMessage}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default MyOverlayLoader;

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Toolbar,
  Grid,
  Tooltip,
} from "@mui/material";
import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import Download from "@mui/icons-material/Download";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Refresh from "@mui/icons-material/Refresh";
import { useSidebar } from "@/layouts/components/sidebar/sidebarContext";

interface MediaErrorViewProps {
  fileName?: string;
  fileExtension?: string;
  onDownload?: () => void;
  onBack?: () => void;
  onRetry?: () => void;
  errorMessage?: string;
}

const MediaErrorView: React.FC<MediaErrorViewProps> = ({
  fileName = "Document",
  fileExtension = "",
  onDownload,
  onBack,
  onRetry,
  errorMessage = "Unable to preview this file",
}) => {
  const { open: sidebarOpen } = useSidebar();

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: sidebarOpen ? "calc(100vw - 265px)" : "calc(100vw - 90px)",
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Toolbar */}
      <Toolbar
        variant="dense"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: 48,
          px: 2,
        }}
      >
        <Grid container sx={{ width: "100%", alignItems: "center" }}>
          <Grid size={{ xs: 4 }}>
            <Tooltip title="Back">
              <IconButton size="small" onClick={handleBack}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ display: "flex", justifyContent: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {fileName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }} />
        </Grid>
      </Toolbar>

      {/* Error Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          p: 4,
        }}
      >
        <ErrorOutline
          sx={{
            fontSize: 80,
            color: "warning.main",
            mb: 3,
          }}
        />

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          Preview Not Available
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 1,
            textAlign: "center",
            color: "text.secondary",
            maxWidth: 400,
          }}
        >
          {errorMessage}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 4,
            textAlign: "center",
            color: "text.secondary",
            maxWidth: 400,
          }}
        >
          You can download the file to view it with an appropriate application.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {onDownload && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={onDownload}
              size="large"
              sx={{ minWidth: 140 }}
            >
              Download File
            </Button>
          )}

          {onRetry && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRetry}
              size="large"
              sx={{ minWidth: 120 }}
            >
              Try Again
            </Button>
          )}
        </Box>

        {fileExtension && (
          <Typography
            variant="caption"
            sx={{
              mt: 3,
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {fileExtension} File
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MediaErrorView;
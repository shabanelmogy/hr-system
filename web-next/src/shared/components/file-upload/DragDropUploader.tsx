import {
  Paper,
  Stack,
  Typography,
  Box,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";

const DragDropUploader = ({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleClick,
  fileInputRef,
  handleFileInputChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Fade in={true}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          background: isDragging
            ? alpha(theme.palette.primary.main, 0.08)
            : theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.4)
            : alpha(theme.palette.grey[50], 0.5),
          borderRadius: 3,
          border: `2px dashed ${
            isDragging ? theme.palette.primary.main : theme.palette.divider
          }`,
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.5),
            background: alpha(theme.palette.primary.main, 0.04),
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${alpha(
              theme.palette.primary.main,
              0.1
            )}, transparent)`,
            animation: isDragging ? "shimmer 2s infinite" : "none",
          },
          "@keyframes shimmer": {
            "0%": { left: "-100%" },
            "100%": { left: "100%" },
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t("actions.updateProfile")}
      >
        <input
          ref={fileInputRef}
          hidden
          accept="image/jpeg,image/png,image/webp"
          type="file"
          onChange={handleFileInputChange}
          aria-label={t("actions.updateProfile")}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: { xs: "center", sm: "start" },
          }}
        >
          <ImageIcon
            sx={{
              fontSize: 32,
              color: isDragging ? "primary.main" : "text.secondary",
              transition: "all 0.3s ease",
              transform: isDragging ? "scale(1.1)" : "scale(1)",
            }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              color={isDragging ? "primary.main" : "text.primary"}
              sx={{
                fontWeight: "600",
                transition: "color 0.3s ease"
              }}>
              {isDragging ? t("actions.dropImage") : t("actions.updateProfile")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5
              }}>
              {t("actions.dragPhoto")}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
};

export default DragDropUploader;

/* eslint-disable react/prop-types */
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SecurityIcon from "@mui/icons-material/Security";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

interface SecurityHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  setIsEditing: (editing: boolean) => void;
  handleCancel: () => void;
  handleSave: () => void;
  t: (key: string) => string;
}

const SecurityHeader = ({
  isEditing,
  isSubmitting,
  setIsEditing,
  handleCancel,
  handleSave,
  t,
}: SecurityHeaderProps) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.8
          )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <SecurityIcon
          sx={{
            color: "white",
            fontSize: 28,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.02em",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, #fff, #e2e8f0)"
                : "linear-gradient(90deg, #1e293b, #334155)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          {t("auth.securitySettings").toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          {isEditing
            ? t("auth.updateYourPasswordToStaySecure")
            : t("auth.manageYourPasswordAndSecuritySettings")}
        </Typography>
      </Box>
      {isSubmitting ? (
        <Chip
          icon={<CircularProgress size={16} color="inherit" />}
          label={t("actions.updating")}
          color="primary"
          variant="filled"
          sx={{
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.7 },
              "100%": { opacity: 1 },
            },
            borderRadius: "8px",
          }}
        />
      ) : (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {/* Cancel button - only visible in edit mode */}
          {isEditing && (
            <Tooltip title={t("actions.undoChanges")}>
              <IconButton
                onClick={handleCancel}
                aria-label={t("actions.cancel")}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.2),
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  width: 40,
                  height: 40,
                  boxShadow: theme.shadows[2],
                }}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Save/Edit toggle button */}
          <Tooltip
            title={
              isEditing
                ? t("actions.saveInformation")
                : t("actions.editInformation")
            }
          >
            <IconButton
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSubmitting}
              aria-label={isEditing ? t("actions.save") : t("actions.edit")}
              sx={{
                bgcolor: isEditing
                  ? alpha(theme.palette.primary.main, 0.9)
                  : alpha(theme.palette.action.hover, 0.1),
                color: isEditing ? "white" : theme.palette.text.primary,
                "&:hover": {
                  bgcolor: isEditing
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.action.hover, 0.2),
                  transform:
                    !isSubmitting &&
                    (isEditing
                      ? "translateY(-2px)"
                      : "translateY(-2px) rotate(5deg)"),
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                width: 48,
                height: 48,
                boxShadow: isEditing ? theme.shadows[8] : theme.shadows[2],
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isEditing ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
};

export default SecurityHeader;

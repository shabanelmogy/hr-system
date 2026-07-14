import {
  Box,
  Stack,
  IconButton,
  CircularProgress,
  Grow,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import { useTranslation } from "react-i18next";

interface EditControlsProps {
  isEditing: boolean;
  uploadProgress: boolean;
  handleButtonClick: () => void;
  handleUndoChanges: () => void;
}

const EditControls = ({
  isEditing,
  uploadProgress,
  handleButtonClick,
  handleUndoChanges,
}: EditControlsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ position: "relative" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {/* Undo Button - Only visible when editing */}
        {isEditing && (
          <Grow in={isEditing} timeout={500}>
            <Tooltip title={t("auth.undoPhotoChanges")}>
              <IconButton
                onClick={handleUndoChanges}
                disabled={uploadProgress}
                aria-label={t("auth.undoPhotoChanges")}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.9),
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.warning.dark,
                    transform: uploadProgress ? undefined : "translateY(-2px)",
                  },
                  transition: "all 0.2s ease",
                  width: 44,
                  height: 44,
                  boxShadow: theme.shadows[3],
                }}
              >
                <UndoIcon />
              </IconButton>
            </Tooltip>
          </Grow>
        )}

        {/* Save/Edit Button */}
        <Grow in={true} timeout={1000}>
          <Tooltip title={isEditing ? t("auth.saveProfilePicture") : t("auth.editProfilePicture")}>
            <IconButton
              onClick={handleButtonClick}
              disabled={uploadProgress}
              aria-label={isEditing ? t("auth.saveProfilePicture") : t("auth.editProfilePicture")}
              color={isEditing ? "primary" : "default"}
              sx={{
                bgcolor: isEditing
                  ? alpha(theme.palette.primary.main, 0.9)
                  : alpha(theme.palette.action.hover, 0.1),
                color: isEditing ? "white" : theme.palette.text.primary,
                "&:hover": {
                  bgcolor: isEditing
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.action.hover, 0.2),
                  transform: uploadProgress ? undefined : "translateY(-2px)",
                },
                transition: "all 0.2s ease",
                width: 44,
                height: 44,
                boxShadow: isEditing ? theme.shadows[5] : theme.shadows[2],
              }}
            >
              {uploadProgress ? <CircularProgress size={22} color="inherit" thickness={4} /> : isEditing ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Grow>
      </Stack>
    </Box>
  );
};

export default EditControls;

/* eslint-disable react/prop-types */
import {
  Box,
  Stack,
  IconButton,
  CircularProgress,
  Grow,
  useTheme,
  alpha,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";

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

  return (
    <Box sx={{ position: "relative" }}>
      <Stack direction="row" spacing={1}>
        {/* Undo Button - Only visible when editing */}
        {isEditing && (
          <Grow in={isEditing} timeout={500}>
            <IconButton
              onClick={handleUndoChanges}
              disabled={uploadProgress}
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.9),
                color: "white",
                "&:hover": {
                  bgcolor: theme.palette.warning.dark,
                  transform:
                    !uploadProgress && "translateY(-2px) rotate(-5deg)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                width: 48,
                height: 48,
                boxShadow: theme.shadows[4],
                opacity: uploadProgress ? 0.7 : 1,
                cursor: uploadProgress ? "not-allowed" : "pointer",
              }}
            >
              <UndoIcon />
            </IconButton>
          </Grow>
        )}

        {/* Save/Edit Button */}
        <Grow in={true} timeout={1000}>
          <IconButton
            onClick={handleButtonClick}
            disabled={uploadProgress}
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
                  !uploadProgress &&
                  (isEditing
                    ? "translateY(-2px)"
                    : "translateY(-2px) rotate(5deg)"),
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              width: 48,
              height: 48,
              boxShadow: isEditing ? theme.shadows[8] : theme.shadows[2],
              opacity: uploadProgress ? 0.7 : 1,
              cursor: uploadProgress ? "not-allowed" : "pointer",
            }}
          >
            {uploadProgress ? (
              <CircularProgress size={24} color="inherit" thickness={4} />
            ) : isEditing ? (
              <SaveIcon />
            ) : (
              <EditIcon />
            )}
          </IconButton>
        </Grow>
      </Stack>
    </Box>
  );
};

export default EditControls;

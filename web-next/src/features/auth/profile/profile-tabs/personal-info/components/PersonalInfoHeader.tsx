import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";

interface PersonalInfoHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onButtonClick: () => void;
  handleUndo: () => void;
  t: (key: string) => string;
}

const PersonalInfoHeader = ({
  isEditing,
  isSaving,
  onButtonClick,
  handleUndo,
  t,
}: PersonalInfoHeaderProps) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        p: { xs: 2, sm: 2.5 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha(
                theme.palette.info.dark,
                0.2
              )}, ${alpha(theme.palette.primary.dark, 0.2)})`
            : `linear-gradient(145deg, ${alpha(
                theme.palette.info.light,
                0.15
              )}, ${alpha(theme.palette.primary.light, 0.05)})`,
        borderBottom: (theme) =>
          `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography component="h3" variant="h6" sx={{ fontWeight: 800 }}>
            {t("auth.personalDetails")}
          </Typography>
          <Chip
            size="small"
            label={isEditing ? t("actions.editingMode") : t("actions.viewOnly")}
            color={isEditing ? "primary" : "info"}
            variant={isEditing ? "filled" : "outlined"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditing ? t("actions.modifyInformation") : t("auth.profileOverview")}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
        {isEditing && (
          <Tooltip title={t("actions.undoChanges")}>
            <IconButton
              color="error"
              size="small"
              onClick={handleUndo}
              sx={{
                background: (theme) => alpha(theme.palette.error.main, 0.1),
                transition: "all 0.2s ease",
                "&:hover": {
                  background: (theme) => alpha(theme.palette.error.main, 0.2),
                  transform: "scale(1.05)",
                },
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          title={
            isEditing
              ? t("actions.saveInformation")
              : t("actions.editInformation")
          }
        >
          <IconButton
            color={isEditing ? "primary" : "info"}
            onClick={onButtonClick}
            disabled={isSaving}
            aria-label={isEditing ? t("actions.saveInformation") : t("actions.editInformation")}
            sx={{
              background: (theme) =>
                isEditing
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.info.light, 0.1),
              transition: "all 0.2s ease",
              "&:hover": {
                background: (theme) =>
                  isEditing
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.info.light, 0.2),
                transform: "scale(1.05)",
              },
              border: (theme) =>
                isEditing
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  : `1px solid ${alpha(theme.palette.info.light, 0.3)}`,
            }}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditing ? (
              <SaveIcon />
            ) : (
              <EditIcon />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default PersonalInfoHeader;

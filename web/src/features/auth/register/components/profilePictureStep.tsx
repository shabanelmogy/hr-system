/* eslint-disable react/prop-types */
import {
  alpha,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Fade,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

// Icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

interface ProfilePictureStepProps {
  previewUrl: string | null;
  isDragActive: boolean;
  uploadError: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  registrationProgress: number;
  isMobile: boolean;
  t: (key: string) => string;
}

const ProfilePictureStep = ({
  previewUrl,
  isDragActive,
  uploadError,
  onFileChange,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  fileInputRef,
  dropZoneRef,
  isLoading,
  registrationProgress,
  isMobile,
  t,
}: ProfilePictureStepProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Stack spacing={2}>
      <Typography
        variant="subtitle1"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {t("auth.profilePicture") || "Profile Picture"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 3 : 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Picture preview */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.secondary,
            }}
          >
            {t("actions.preview") || "Preview"}
          </Typography>

          <Avatar
            src={previewUrl}
            sx={{
              width: 120,
              height: 120,
              border: previewUrl
                ? `4px solid ${theme.palette.success.main}`
                : `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              boxShadow: previewUrl
                ? `0 4px 14px ${alpha(theme.palette.success.main, 0.25)}`
                : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
              fontSize: "2.5rem",
              bgcolor: isDarkMode
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.light, 0.1),
              color: theme.palette.primary.main,
              transition: "all 0.3s ease",
            }}
          >
            {!previewUrl && <PhotoCameraIcon fontSize="inherit" />}
          </Avatar>

          <Fade in={!!previewUrl}>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  borderRadius: 6,
                  px: 2,
                  py: 0.75,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  boxShadow: `0 2px 6px ${alpha(
                    theme.palette.success.main,
                    0.15
                  )}`,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: "1rem",
                    mr: 0.75,
                    color: theme.palette.success.main,
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  {t("auth.imageVerified") || "Image verified"}
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>

        {/* Enhanced drag and drop zone */}
        <Box
          ref={dropZoneRef}
          sx={{
            border: `2px dashed ${isDragActive
                ? theme.palette.primary.main
                : alpha(theme.palette.text.disabled, 0.3)
              }`,
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            backgroundColor: isDragActive
              ? alpha(theme.palette.primary.main, 0.05)
              : alpha(theme.palette.background.default, 0.6),
            cursor: "pointer",
            transition: "all 0.2s ease",
            width: "100%",
            maxWidth: 280,
            "&:hover": {
              backgroundColor: isDarkMode
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.light, 0.1),
              borderColor: isDarkMode
                ? alpha(theme.palette.primary.light, 0.5)
                : alpha(theme.palette.primary.main, 0.5),
            },
            ...(uploadError && {
              borderColor: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.05),
            }),
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={onFileChange}
          />

          <CloudUploadIcon
            sx={{
              fontSize: 40,
              mb: 1.5,
              color: theme.palette.primary.main,
              ...(uploadError && {
                color: theme.palette.error.main,
              }),
            }}
          />

          <Typography variant="body1" fontWeight={500}>
            {t("actions.dragAndDropOr") || "Drag and drop or"}{" "}
            <Box
              component="span"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                ...(uploadError && {
                  color: theme.palette.error.main,
                }),
              }}
            >
              {t("actions.browse") || "browse"}
            </Box>
          </Typography>

          <Typography
            variant="caption"
            color={uploadError ? theme.palette.error.main : "text.secondary"}
            sx={{ display: "block", mt: 1 }}
          >
            {uploadError ||
              t("general.supportedFormats") ||
              "Supported formats: JPEG, PNG, GIF, WebP"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {t("validation.maxFileSize") || "Max file size: 5MB"}
          </Typography>
        </Box>
      </Box>

      {/* Submit button with progress */}
      <Box sx={{ mt: 2, position: "relative" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading || !previewUrl}
          endIcon={!isLoading && <HowToRegIcon />}
          sx={{
            py: 1.25,
            mt: 1,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.95rem",
            boxShadow: theme.shadows[3],
            "&:hover": {
              boxShadow: theme.shadows[5],
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              {t("auth.registering") || "Registering..."}
            </Box>
          ) : (
            t("auth.completeRegistration") || "Complete Registration"
          )}
        </Button>

        {isLoading && (
          <LinearProgress
            variant="determinate"
            value={registrationProgress}
            color="success"
            sx={{
              position: "absolute",
              bottom: -5,
              left: 0,
              right: 0,
              height: 5,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          />
        )}
      </Box>

      {!previewUrl && (
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t("auth.profilePictureRequired") ||
              "A profile picture is required to complete registration"}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default ProfilePictureStep;

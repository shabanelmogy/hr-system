/* eslint-disable react/prop-types */

import {
  Cancel as CancelIcon,
  Close as CloseIcon,
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Slide,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Custom transition component
const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MyDeleteConfirmation = ({
  open,
  onClose,
  deletedField,
  handleDelete,
  loading = false,
  requireConfirmation = true, // New prop to enable/disable confirmation
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const requiredText = "DELETE";
  const isConfirmationValid =
    !requireConfirmation || confirmationText === requiredText;

  const handleConfirmDelete = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      await handleDelete();
    } finally {
      setIsDeleting(false);
      setConfirmationText(""); // Reset confirmation text
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText(""); // Reset confirmation text
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      slots={{ transition: SlideTransition }}
      keepMounted
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          boxShadow: theme.shadows[20],
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
          overflow: "visible",
          position: "relative",
          background: `linear-gradient(135deg, 
            ${theme.palette.background.paper} 0%, 
            ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
        },
      }}
    >
      {/* Animated Warning Icon */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <Fade in={open} timeout={600}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
              border: `3px solid ${theme.palette.background.paper}`,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.error.main,
                    0.4
                  )}`,
                },
                "50%": {
                  transform: "scale(1.05)",
                  boxShadow: `0 12px 32px ${alpha(
                    theme.palette.error.main,
                    0.6
                  )}`,
                },
                "100%": {
                  transform: "scale(1)",
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.error.main,
                    0.4
                  )}`,
                },
              },
            }}
          >
            <WarningIcon
              sx={{
                color: "white",
                fontSize: 28,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
            />
          </Box>
        </Fade>
      </Box>

      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        disabled={isDeleting}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
          "&:hover": {
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
          },
          transition: "all 0.2s ease",
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogTitle
        sx={{
          pt: 5,
          pb: 1,
          textAlign: "center",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.error.light, 0.1)} 0%, 
            ${alpha(theme.palette.error.light, 0.05)} 100%)`,
        }}
      >
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: 600,
            color: theme.palette.error.main,
            textShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.1)}`,
            mb: 1,
          }}
        >
          {t("messages.confirmDeletion")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400,
          }}
        >
          {t("messages.thisActionCannotBeUndone") ||
            "This action cannot be undone"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, textAlign: "center" }}>
        <Fade in={open} timeout={800}>
          <Box>
            <Typography
              variant="body1"
              sx={{
                my: 2,
                lineHeight: 1.6,
                color: theme.palette.text.primary,
              }}
            >
              {t("messages.areYouSureDelete")}
            </Typography>

            {/* Highlighted Item to Delete */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.error.light, 0.1)} 0%, 
                  ${alpha(theme.palette.error.light, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                mb: 3,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.error.dark,
                  wordBreak: "break-word",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />"{deletedField}"
              </Typography>
            </Box>

            {/* Confirmation Input */}
            {requireConfirmation && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {t("messages.typeDeleteToConfirm") || "To confirm, type"}{" "}
                  <Box
                    component="span"
                    sx={{
                      fontFamily: "monospace",
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    DELETE
                  </Box>{" "}
                  {t("messages.inTheBoxBelow") || "in the box below:"}
                </Typography>

                <TextField
                  fullWidth
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={t("messages.typeDELETE") || "Type DELETE"}
                  disabled={isDeleting}
                  variant="outlined"
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "monospace",
                      fontSize: "1rem",
                      textAlign: "center",
                      backgroundColor: theme.palette.background.paper,
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.error.main,
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: alpha(theme.palette.error.main, 0.7),
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      textAlign: "center",
                      fontWeight: 600,
                      color:
                        confirmationText === requiredText
                          ? theme.palette.success.main
                          : theme.palette.text.primary,
                    },
                  }}
                />

                {/* Validation Message */}
                {confirmationText && confirmationText !== requiredText && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.error.main,
                      mt: 1,
                      display: "block",
                      fontWeight: 500,
                    }}
                  >
                    {t("messages.pleaseTypeExactly") || "Please type exactly"}{" "}
                    "DELETE"
                  </Typography>
                )}

                {confirmationText === requiredText && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.success.main,
                      mt: 1,
                      display: "block",
                      fontWeight: 600,
                    }}
                  >
                    ✓{" "}
                    {t("messages.confirmationVerified") ||
                      "Confirmation verified"}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Fade>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 1,
          gap: 2,
          justifyContent: "center",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 0.5)} 0%, 
            ${alpha(theme.palette.background.default, 0.2)} 100%)`,
        }}
      >
        {/* Cancel Button */}
        <Button
          onClick={handleClose}
          disabled={isDeleting}
          variant="outlined"
          size="large"
          startIcon={<CancelIcon />}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            "&:hover": {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.primary.main,
            },
            transition: "all 0.2s ease",
          }}
        >
          {t("actions.cancel")}
        </Button>

        {/* Confirm Delete Button */}
        <Button
          onClick={handleConfirmDelete}
          disabled={isDeleting || !isConfirmationValid}
          variant="contained"
          size="large"
          startIcon={
            isDeleting ? (
              <CircularProgress size={16} sx={{ color: "white" }} />
            ) : (
              <DeleteIcon />
            )
          }
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: theme.palette.error.main,
            boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
            "&:hover": {
              backgroundColor: theme.palette.error.dark,
              boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&:disabled": {
              backgroundColor: alpha(theme.palette.action.disabled, 0.3),
              color: alpha(theme.palette.text.disabled, 0.5),
              boxShadow: "none",
            },
            transition: "all 0.2s ease",
          }}
        >
          {isDeleting
            ? t("actions.deleting") || "Deleting..."
            : t("actions.delete")}
        </Button>
      </DialogActions>

      {/* Loading Overlay */}
      {isDeleting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            zIndex: 10,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={40}
              sx={{
                color: theme.palette.error.main,
                mb: 2,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("messages.processingDelete") || "Processing deletion..."}
            </Typography>
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

export default MyDeleteConfirmation;

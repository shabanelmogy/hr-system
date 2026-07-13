/* eslint-disable react/prop-types */
import { MyOverlayLoader } from "@/shared/components";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
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
  IconButton,
  Slide,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const MyForm = ({
  open,
  onClose,
  title,
  subtitle,
  submitButtonText,
  onSubmit,
  children = null,
  isSubmitting = false,
  icon = null,
  maxWidth = "sm",
  variant = "default",
  maxHeight = "90vh",
  hideFooter = false,
  recordId,
  isViewMode = false,
  focusFieldName = null,
  autoFocusFirst = true,
  // Overlay props
  overlayActionType = null,
  overlayMessage = null,
  // Error handling props
  errors = {}, // Object containing field errors { fieldName: errorMessage }
  onErrorFound = null, // Callback when errors are found
  // Optional content rendered on the LEFT side of the footer (opposite Cancel/Save)
  footerLeft = null,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dialogContentRef = useRef(null);
  const hasScrolledToError = useRef(false);

  const getDialogStyles = () => {
    const baseStyles = {
      "& .MuiDialog-paper": {
        maxHeight: maxHeight,
        height: hideFooter ? "auto" : maxHeight,
        display: "flex",
        flexDirection: "column",
        margin: "16px",
        position: "relative",
        overflow: "hidden",
      },
    };

    switch (variant) {
      case "modern":
        return {
          ...baseStyles,
          "& .MuiDialog-paper": {
            ...baseStyles["& .MuiDialog-paper"],
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          },
        };
      case "glassmorphic":
        return {
          ...baseStyles,
          "& .MuiDialog-paper": {
            ...baseStyles["& .MuiDialog-paper"],
            borderRadius: "20px",
            background: `${alpha(theme.palette.background.paper, 0.8)}`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        };
      default:
        return {
          ...baseStyles,
          "& .MuiDialog-paper": {
            ...baseStyles["& .MuiDialog-paper"],
            borderRadius: "12px",
            boxShadow: theme.shadows[8],
          },
        };
    }
  };

  const getTitleIcon = () => {
    if (icon) return icon;

    // Check for edit/update
    if (
      submitButtonText?.toLowerCase().includes("update") ||
      submitButtonText?.toLowerCase().includes("edit") ||
      title?.toLowerCase().includes("edit") ||
      recordId
    ) {
      return <EditIcon />;
    }

    // Check for add/create
    if (
      submitButtonText?.toLowerCase().includes("add") ||
      submitButtonText?.toLowerCase().includes("create") ||
      title?.toLowerCase().includes("add")
    ) {
      return <AddIcon />;
    }

    return <SaveIcon />;
  };

  // Simple overlay action type detection
  const getOverlayActionType = () => {
    if (overlayActionType) return overlayActionType;

    // Check for create/add
    if (
      submitButtonText?.toLowerCase().includes("add") ||
      submitButtonText?.toLowerCase().includes("create") ||
      title?.toLowerCase().includes("add")
    ) {
      return "create";
    }

    // Check for update/edit
    if (
      submitButtonText?.toLowerCase().includes("update") ||
      submitButtonText?.toLowerCase().includes("edit") ||
      title?.toLowerCase().includes("edit") ||
      recordId
    ) {
      return "update";
    }

    return "save";
  };

  // Simple overlay message
  const getOverlayMessage = () => {
    if (overlayMessage) return overlayMessage;
    return t("actions.processing") || "Processing...";
  };

  // Scroll to field with error
  const scrollToError = useCallback(() => {
    if (!dialogContentRef.current || Object.keys(errors).length === 0) return;

    setTimeout(() => {
      // Find all fields with errors
      const errorFields = [];
      Object.keys(errors).forEach((fieldName) => {
        if (errors[fieldName]) {
          // Try multiple selectors to find the field
          const field = document.querySelector(
            `[name="${fieldName}"], [id="${fieldName}"], [data-field-name="${fieldName}"]`
          );
          if (field) {
            errorFields.push({ field, name: fieldName });
          }
        }
      });

      if (errorFields.length > 0) {
        // Sort by their position in the document
        errorFields.sort((a, b) => {
          const rectA = a.field.getBoundingClientRect();
          const rectB = b.field.getBoundingClientRect();
          return rectA.top - rectB.top;
        });

        // Get the first error field
        const firstErrorField = errorFields[0].field;

        // Find the closest parent that might have the error message
        const errorParent =
          firstErrorField.closest(".MuiFormControl-root") ||
          firstErrorField.closest(".MuiTextField-root") ||
          firstErrorField.parentElement;

        if (errorParent && dialogContentRef.current) {
          const containerRect =
            dialogContentRef.current.getBoundingClientRect();
          const errorRect = errorParent.getBoundingClientRect();

          // Check if the error is not fully visible
          const isAbove = errorRect.top < containerRect.top;
          const isBelow = errorRect.bottom > containerRect.bottom;

          if (isAbove || isBelow) {
            // Calculate the scroll position
            const scrollTop =
              errorParent.offsetTop - dialogContentRef.current.offsetTop - 20;

            // Smooth scroll to the error
            dialogContentRef.current.scrollTo({
              top: scrollTop,
              behavior: "smooth",
            });

            // Focus the field after scrolling
            setTimeout(() => {
              firstErrorField.focus();

              // Add a more noticeable animation
              errorParent.style.transition = "all 0.3s ease";
              errorParent.style.transform = "scale(1.02)";
              errorParent.style.boxShadow = `0 0 0 3px ${alpha(
                theme.palette.error.main,
                0.3
              )}`;

              // Add shake animation
              errorParent.style.animation = "errorShake 0.6s";

              setTimeout(() => {
                errorParent.style.transform = "scale(1)";
                errorParent.style.boxShadow = "";
                errorParent.style.animation = "";
              }, 600);
            }, 300);
          } else {
            // If already visible, just focus
            firstErrorField.focus();
          }

          // Call the callback if provided
          if (onErrorFound) {
            onErrorFound(errorFields[0].name, firstErrorField);
          }
        }
      }
    }, 100);
  }, [errors, onErrorFound]);

  const handleFocusAndScroll = () => {
    if (!isViewMode) {
      // If there are errors, scroll to the first error field
      if (Object.keys(errors).length > 0) {
        scrollToError();
        return;
      }

      // Otherwise, use the normal focus logic
      setTimeout(() => {
        let fieldToFocus = null;
        if (focusFieldName) {
          fieldToFocus = document.querySelector(`[name="${focusFieldName}"]`);
        }
        if (!fieldToFocus && autoFocusFirst) {
          const dialogContent = dialogContentRef.current;
          if (dialogContent) {
            const focusableElements = dialogContent.querySelectorAll(
              "input:not([disabled]):not([readonly]):not([type='hidden']), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])"
            );
            for (let element of focusableElements) {
              const rect = element.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                fieldToFocus = element;
                break;
              }
            }
          }
        }
        if (fieldToFocus) {
          fieldToFocus.focus();
          if (fieldToFocus.select && fieldToFocus.type !== "number") {
            fieldToFocus.select();
          }
          setTimeout(() => {
            if (dialogContentRef.current && fieldToFocus) {
              const containerRect =
                dialogContentRef.current.getBoundingClientRect();
              const fieldRect = fieldToFocus.getBoundingClientRect();
              const isAbove = fieldRect.top < containerRect.top;
              const isBelow = fieldRect.bottom > containerRect.bottom;
              if (isAbove || isBelow) {
                const scrollTop =
                  fieldToFocus.offsetTop -
                  dialogContentRef.current.offsetTop -
                  20;
                dialogContentRef.current.scrollTo({
                  top: scrollTop,
                  behavior: "smooth",
                });
              }
            }
          }, 100);
        }
      }, 300);
    }
  };

  // Watch for error changes
  useEffect(() => {
    if (open && Object.keys(errors).length > 0 && !hasScrolledToError.current) {
      scrollToError();
      hasScrolledToError.current = true;
    }
  }, [errors, open, scrollToError]);

  // Reset the scroll flag when dialog closes or errors are cleared
  useEffect(() => {
    if (!open || Object.keys(errors).length === 0) {
      hasScrolledToError.current = false;
    }
  }, [open, errors]);

  // Reset scroll flag on form submission attempt
  const handleFormSubmit = useCallback(
    (e) => {
      // Reset the flag so it can scroll again if there are still errors
      hasScrolledToError.current = false;
      if (onSubmit) {
        onSubmit(e);
      }
    },
    [onSubmit]
  );

  useEffect(() => {
    if (open && dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }
  }, [open]);

  // Add shake animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes errorShake {
        0%, 100% { transform: translateX(0) scale(1); }
        10% { transform: translateX(-10px) scale(1.02); }
        20% { transform: translateX(10px) scale(1.02); }
        30% { transform: translateX(-10px) scale(1.02); }
        40% { transform: translateX(10px) scale(1.02); }
        50% { transform: translateX(-5px) scale(1.02); }
        60% { transform: translateX(5px) scale(1.02); }
        70% { transform: translateX(-2px) scale(1.01); }
        80% { transform: translateX(2px) scale(1.01); }
        90% { transform: translateX(0) scale(1); }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}; }
        70% { box-shadow: 0 0 0 10px ${alpha(theme.palette.error.main, 0)}; }
        100% { box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0)}; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [theme]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      disableScrollLock
      slots={{
        transition: Slide,
      }}
      slotProps={{
        transition: {
          direction: "up",
          onEntered: handleFocusAndScroll,
        },
      }}
      sx={getDialogStyles()}
    >
      <Box
        component="form"
        onSubmit={handleFormSubmit}
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateRows: hideFooter ? "auto 1fr" : "auto 1fr auto",
          overflow: "hidden",
        }}
      >
        {/* --- HEADER --- */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            pt: 2.5,
            px: 3,
            background: theme.palette.background.paper,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius:
              variant === "glassmorphic" ? "20px 20px 0 0" : "12px 12px 0 0",
          }}
        >
          {/* Left: Title + Subtitle */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
              }}
            >
              {getTitleIcon()}
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, opacity: 0.8 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right: ID Chip, Error Chip, Close Button */}
          <Box display="flex" alignItems="center" gap={1.5}>
            {recordId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: "20px",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    color: theme.palette.secondary.contrastText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    boxShadow: `0 2px 8px ${alpha(
                      theme.palette.secondary.main,
                      0.3
                    )}`,
                  }}
                >
                  #
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontFamily: "monospace",
                    letterSpacing: 0.5,
                  }}
                >
                  {recordId}
                </Typography>
              </Box>
            )}

            {Object.keys(errors).length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  borderRadius: "16px",
                  background: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  animation: "pulse 2s infinite",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.error.main,
                    fontWeight: 600,
                  }}
                >
                  {Object.keys(errors).length}{" "}
                  {Object.keys(errors).length === 1 ? "error" : "errors"}
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
              sx={{
                color: theme.palette.grey[500],
                "&:hover": {
                  color: theme.palette.grey[700],
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* --- CONTENT --- */}
        <DialogContent
          ref={dialogContentRef}
          sx={{
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            pt: 3,
            pb: hideFooter ? 3 : 3,
            px: 3,
            position: "relative",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, ${alpha(
                    theme.palette.background.default,
                    0.8
                  )} 0%, ${alpha(
                    theme.palette.background.paper,
                    0.9
                  )} 50%, ${alpha(theme.palette.background.default, 0.8)} 100%)`
                : theme.palette.background.paper,
            borderRadius: hideFooter
              ? variant === "glassmorphic"
                ? "0 0 20px 20px"
                : "0 0 12px 12px"
              : "0",
            "&::-webkit-scrollbar": { width: "10px" },
            "&::-webkit-scrollbar-track": {
              background: alpha(
                theme.palette.divider,
                theme.palette.mode === "dark" ? 0.2 : 0.1
              ),
              borderRadius: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.5 : 0.3
              ),
              borderRadius: "5px",
              "&:hover": {
                background: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.7 : 0.5
                ),
              },
            },
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(
              theme.palette.primary.main,
              theme.palette.mode === "dark" ? 0.5 : 0.3
            )} ${alpha(
              theme.palette.divider,
              theme.palette.mode === "dark" ? 0.2 : 0.1
            )}`,
            "& .MuiTextField-root": {
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )}`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 4px 16px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              },
            },
          }}
        >
          {/* Simple Overlay - Your Way! */}
          {isSubmitting && (
            <MyOverlayLoader
              open={true}
              actionType={getOverlayActionType()}
              message={getOverlayMessage()}
            />
          )}

          <Box
            sx={{
              opacity: isSubmitting ? 0.5 : 1,
              transition: "opacity 0.3s ease",
              pointerEvents: isSubmitting ? "none" : "auto",
              width: "100%",
            }}
          >
            {children}
          </Box>
        </DialogContent>

        {/* --- FOOTER --- */}
        {!hideFooter && (
          <Box
            sx={{
              background: theme.palette.background.paper,
              borderTop: `1px solid ${alpha(
                theme.palette.divider,
                theme.palette.mode === "dark" ? 0.3 : 0.2
              )}`,
              borderRadius:
                variant === "glassmorphic" ? "0 0 20px 20px" : "0 0 12px 12px",
            }}
          >
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5, margin: 0, justifyContent: "space-between" }}>
              {/* Left side — optional slot (e.g. mock data button) */}
              <Box>{footerLeft}</Box>

              {/* Right side — Cancel + Save */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                variant="outlined"
                type="button"
                sx={{
                  minWidth: 100,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.divider, 0.5),
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    borderColor: theme.palette.divider,
                    backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  },
                }}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    getTitleIcon()
                  )
                }
                sx={{
                  minWidth: 120,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: `0 6px 16px ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0px)" },
                  "&.Mui-disabled": {
                    background: alpha(theme.palette.action.disabled, 0.1),
                    color: alpha(theme.palette.action.disabled, 0.6),
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {isSubmitting ? t("actions.submitting") : submitButtonText}
              </Button>
              </Box>
            </DialogActions>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default MyForm;

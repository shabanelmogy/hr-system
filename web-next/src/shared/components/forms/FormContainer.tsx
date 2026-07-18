import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  Slide,
  useTheme,
  alpha,
} from "@mui/material";
import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { TransitionProps } from "@mui/material/transitions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { FormProvider } from "./FormContext";
import type { MyFormProps } from "./types";

const DialogTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement<unknown> }
>(
  function DialogTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

export const FormContainer: React.FC<MyFormProps> = ({
  open,
  onClose,
  title,
  subtitle,
  submitButtonText,
  onSubmit,
  children = null,
  isSubmitting = false,
  isDirty,
  icon = null,
  maxWidth = "sm",
  variant = "default",
  maxHeight = "90vh",
  hideFooter = false,
  recordId,
  isViewMode = false,
  focusFieldName = null,
  autoFocusFirst = true,
  overlayActionType = null,
  overlayMessage = null,
  errors = {},
  onErrorFound = undefined,
  footerLeft = null,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const hasScrolledToError = useRef(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const submissionPending = isSubmitting || internalSubmitting;

  const handleClose = useCallback(() => {
    if (submissionPending) return;

    if (isDirty) {
      setDiscardDialogOpen(true);
      return;
    }

    onClose();
  }, [isDirty, onClose, submissionPending]);

  const cancelDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
    onClose();
  }, [onClose]);

  const getDialogStyles = () => {
    const baseStyles = {
      "& .MuiDialog-paper": {
        maxHeight: maxHeight,
        height: hideFooter ? "auto" : maxHeight,
        display: "flex",
        flexDirection: "column" as const,
        margin: "16px",
        position: "relative" as const,
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
            boxShadow: theme.shadows[10],
          },
        };
    }
  };

  const scrollToError = useCallback(() => {
    if (Object.keys(errors).length === 0 || hasScrolledToError.current) return;

    setTimeout(() => {
      const errorFields = Object.keys(errors)
        .map((key) => {
          const element = document.querySelector(`[name="${key}"]`);
          return element ? { name: key, element } : null;
        })
        .filter(Boolean) as { name: string; element: HTMLElement }[];

      if (errorFields.length > 0) {
        hasScrolledToError.current = true;
        const firstErrorField = errorFields[0].element;
        
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Add shake and focus
        if (document.activeElement !== firstErrorField) {
          setTimeout(() => {
            firstErrorField.focus();
            const errorParent = firstErrorField.closest(".MuiFormControl-root") as HTMLElement;
            if (errorParent) {
              errorParent.style.transition = "all 0.3s ease";
              errorParent.style.transform = "scale(1.02)";
              errorParent.style.boxShadow = `0 0 0 2px ${theme.palette.error.main}`;
              errorParent.style.animation = "errorShake 0.5s ease-in-out";

              setTimeout(() => {
                errorParent.style.transform = "scale(1)";
                errorParent.style.boxShadow = "";
                errorParent.style.animation = "";
              }, 600);
            }
          }, 300);
        } else {
          firstErrorField.focus();
        }

        if (onErrorFound) {
          onErrorFound(errorFields[0].name, firstErrorField);
        }
      }
    }, 100);
  }, [errors, onErrorFound, theme]);

  const handleFocusAndScroll = () => {
    if (!isViewMode) {
      if (Object.keys(errors).length > 0) {
        scrollToError();
      } else if (autoFocusFirst) {
        setTimeout(() => {
          let fieldToFocus: HTMLElement | null = null;
          if (focusFieldName) {
            fieldToFocus = document.querySelector(`[name="${focusFieldName}"]`);
          }
          if (!fieldToFocus) {
            const formElements = document.querySelectorAll(
              'form input:not([type="hidden"]):not([disabled]), form textarea:not([disabled]), form select:not([disabled])'
            );
            if (formElements.length > 0) {
              fieldToFocus = formElements[0] as HTMLElement;
            }
          }
          if (fieldToFocus) {
            fieldToFocus.focus();
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (!open) {
      hasScrolledToError.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (open && Object.keys(errors).length > 0) {
      scrollToError();
    }
  }, [errors, open, scrollToError]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onSubmit || submissionPending) return;

      setInternalSubmitting(true);
      try {
        await onSubmit(e);
      } finally {
        setInternalSubmitting(false);
      }
    },
    [onSubmit, submissionPending]
  );

  useEffect(() => {
    if (open && dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }
  }, [open]);

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
        90% { transform: translateX(-2px) scale(1.01); }
      }
    `;
    document.head.appendChild(style);

    return () => { document.head.removeChild(style); };
  }, [theme]);

  // The context value provides everything children might need
  const contextValue = {
    open,
    onClose: handleClose,
    title,
    subtitle,
    submitButtonText,
    isSubmitting: submissionPending,
    isDirty,
    icon,
    maxWidth,
    variant,
    maxHeight,
    hideFooter,
    recordId,
    isViewMode,
    focusFieldName,
    autoFocusFirst,
    overlayActionType,
    overlayMessage,
    errors,
    onErrorFound,
    footerLeft,
    dialogContentRef // pass ref for content scroll
  };

  return (
    <FormProvider value={contextValue}>
      <Dialog
        open={open}
        onClose={() => {
          if (submissionPending) return;
          handleClose();
        }}
        maxWidth={maxWidth}
        fullWidth
        disableScrollLock
        slots={{
          transition: DialogTransition,
        }}
        slotProps={{
          transition: {
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
          {children}
        </Box>
      </Dialog>

      <ConfirmationDialog
        open={open && discardDialogOpen}
        onClose={cancelDiscard}
        onConfirm={confirmDiscard}
        title={t("messages.unsavedChangesTitle")}
        description={t("messages.unsavedChangesConfirm")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("messages.discardChanges")}
        confirmColor="warning"
        icon={<WarningIcon color="warning" />}
      />
    </FormProvider>
  );
};

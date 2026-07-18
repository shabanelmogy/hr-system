import React, { useEffect, useRef } from "react";
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
import { useFormDialogFocus } from "./useFormDialogFocus";
import { useFormDialogState } from "./useFormDialogState";

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
  const formRef = useRef<HTMLFormElement>(null);
  const {
    cancelDiscard,
    confirmDiscard,
    discardDialogOpen,
    requestClose,
    resetDiscardDialog,
    submissionPending,
    submit,
  } = useFormDialogState({
    isDirty,
    isSubmitting,
    onClose,
    onSubmit,
  });

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

  const handleDialogEntered = useFormDialogFocus({
    open,
    isViewMode,
    autoFocusFirst,
    focusFieldName,
    errors,
    formRef,
    errorColor: theme.palette.error.main,
    onErrorFound,
  });

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
  }, []);

  // The context value provides everything children might need
  const contextValue = {
    open,
    onClose: requestClose,
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
    dialogContentRef,
  };

  return (
    <FormProvider value={contextValue}>
      <Dialog
        open={open}
        onClose={requestClose}
        maxWidth={maxWidth}
        fullWidth
        disableScrollLock
        slots={{
          transition: DialogTransition,
        }}
        slotProps={{
          transition: {
            onEnter: resetDiscardDialog,
            onEntered: handleDialogEntered,
            onExited: resetDiscardDialog,
          },
        }}
        sx={getDialogStyles()}
      >
        <Box
          component="form"
          ref={formRef}
          onSubmit={submit}
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

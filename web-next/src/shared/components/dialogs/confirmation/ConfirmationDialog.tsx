import type { ReactNode } from "react";
import { useId } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { ButtonProps, DialogProps } from "@mui/material";

export interface ConfirmationDialogProps {
  open: boolean;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
  children?: ReactNode;
  confirmColor?: ButtonProps["color"];
  confirmIcon?: ReactNode;
  icon?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  initialFocus?: "cancel" | "confirm" | "content";
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
  busy = false,
  children,
  confirmColor = "primary",
  confirmIcon,
  icon,
  maxWidth = "xs",
  initialFocus = "cancel",
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            backgroundImage: "none",
            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        component="form"
        noValidate
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) onConfirm();
        }}
      >
        <DialogTitle id={titleId} sx={{ pb: 1.25 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            {icon}
            <Box component="span" sx={{ minWidth: 0, fontWeight: 700 }}>
              {title}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: children ? 1 : 2.5 }}>
          <DialogContentText id={descriptionId}>{description}</DialogContentText>
          {children}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            type="button"
            onClick={onClose}
            disabled={busy}
            color="inherit"
            variant="outlined"
            autoFocus={initialFocus === "cancel"}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            disabled={busy}
            color={confirmColor}
            variant="contained"
            autoFocus={initialFocus === "confirm"}
            startIcon={
              busy ? <CircularProgress size={16} color="inherit" /> : confirmIcon
            }
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const MySimpleDialog = ({
  open,
  onClose,
  title,
  children,
  actions, // Custom actions array
  cancelText = "Cancel",
  confirmText = "Confirm",
  onConfirm,
  showActions = true,
  showCloseButton = true, // New prop to control close button
  maxWidth = "sm",
  fullWidth = true,
  slotProps, // New slotProps API
  paperProps, // Legacy support (will be mapped to slotProps)
  ...dialogProps
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // Default actions if none provided
  const defaultActions = (
    <>
      <Button onClick={onClose} color="inherit">
        {cancelText}
      </Button>
      {onConfirm && (
        <Button onClick={handleConfirm} variant="contained" color="primary">
          {confirmText}
        </Button>
      )}
    </>
  );

  const renderActions = () => {
    if (!showActions) return null;
    return actions || defaultActions;
  };

  // Handle legacy PaperProps and new slotProps
  const getSlotProps = () => {
    const baseSlotProps = slotProps || {};

    // If legacy paperProps is provided, map it to slotProps.paper
    if (paperProps) {
      return {
        ...baseSlotProps,
        paper: {
          ...baseSlotProps.paper,
          ...paperProps,
        },
      };
    }

    return baseSlotProps;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={getSlotProps()}
      {...dialogProps}
    >
      {title && (
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {title}
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      {/* Divider */}
      <Divider />

      <DialogContent>{children}</DialogContent>

      {showActions && (
        <DialogActions sx={{ px: 3, pb: 3 }}>{renderActions()}</DialogActions>
      )}
    </Dialog>
  );
};

export default MySimpleDialog;

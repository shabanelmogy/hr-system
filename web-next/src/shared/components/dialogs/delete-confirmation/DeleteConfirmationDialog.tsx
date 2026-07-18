import { useRef, useState } from "react";
import {
  DeleteForever as DeleteIcon,
  WarningAmberRounded as WarningIcon,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "../confirmation/ConfirmationDialog";
import { DeleteConfirmationField } from "./DeleteConfirmationField";
import {
  DEFAULT_DELETE_CONFIRMATION,
  matchesConfirmationText,
} from "./confirmation";

export interface DeleteConfirmationDialogProps {
  open: boolean;
  itemLabel: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  requireConfirmation?: boolean;
  confirmationKeyword?: string;
}

export function DeleteConfirmationDialog({
  open,
  itemLabel,
  onClose,
  onConfirm,
  loading = false,
  requireConfirmation = true,
  confirmationKeyword = DEFAULT_DELETE_CONFIRMATION,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationAttempted, setConfirmationAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;
  const confirmed =
    !requireConfirmation ||
    matchesConfirmationText(confirmationText, confirmationKeyword);

  const resetConfirmation = () => {
    setConfirmationText("");
    setConfirmationAttempted(false);
  };

  const handleClose = () => {
    if (busy) return;
    resetConfirmation();
    onClose();
  };

  const executeDelete = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      resetConfirmation();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (!confirmed) {
      setConfirmationAttempted(true);
      inputRef.current?.focus();
      return;
    }

    void executeDelete();
  };

  return (
    <ConfirmationDialog
      open={open}
      title={t("messages.confirmDeletion")}
      description={t("messages.thisActionCannotBeUndone")}
      cancelLabel={t("actions.cancel")}
      confirmLabel={busy ? t("actions.deleting") : t("actions.delete")}
      confirmColor="error"
      confirmIcon={<DeleteIcon />}
      icon={<WarningIcon color="error" />}
      busy={busy}
      initialFocus={requireConfirmation ? "content" : "cancel"}
      onClose={handleClose}
      onConfirm={handleConfirm}
    >
      <Typography sx={{ mt: 2 }}>{t("messages.areYouSureDelete")}</Typography>
      <Box
        sx={{
          mt: 1.25,
          px: 1.5,
          py: 1.25,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "error.main",
          bgcolor: "action.hover",
          color: "text.primary",
          fontWeight: 700,
          overflowWrap: "anywhere",
        }}
      >
        {itemLabel}
      </Box>

      {requireConfirmation && (
        <DeleteConfirmationField
          value={confirmationText}
          keyword={confirmationKeyword}
          disabled={busy}
          showError={confirmationAttempted && !confirmed}
          verified={confirmed}
          inputRef={inputRef}
          onChange={setConfirmationText}
        />
      )}
    </ConfirmationDialog>
  );
}

import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "../confirmation/ConfirmationDialog";

export interface DiscardChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  busy?: boolean;
}

export function DiscardChangesDialog({
  open,
  onClose,
  onDiscard,
  busy = false,
}: DiscardChangesDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      open={open}
      busy={busy}
      onClose={onClose}
      onConfirm={onDiscard}
      title={t("messages.unsavedChangesTitle")}
      description={t("messages.unsavedChangesConfirm")}
      cancelLabel={t("actions.cancel")}
      confirmLabel={t("messages.discardChanges")}
      confirmColor="warning"
      icon={<WarningIcon color="warning" />}
    />
  );
}

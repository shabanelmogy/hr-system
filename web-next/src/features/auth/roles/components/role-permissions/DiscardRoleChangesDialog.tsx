import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { useTranslation } from "react-i18next";

type DiscardRoleChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
};

export default function DiscardRoleChangesDialog(props: DiscardRoleChangesDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onDiscard}
      title={t("messages.unsavedChangesTitle")}
      description={t("messages.unsavedChangesConfirm")}
      cancelLabel={t("actions.cancel")}
      confirmLabel={t("messages.discardChanges")}
      confirmColor="warning"
      icon={<WarningIcon color="warning" />}
    />
  );
}

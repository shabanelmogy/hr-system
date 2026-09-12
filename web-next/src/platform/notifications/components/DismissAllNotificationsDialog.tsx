import { DeleteSweepOutlined as DismissIcon } from "@mui/icons-material";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { useTranslation } from "react-i18next";

type DismissAllNotificationsDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DismissAllNotificationsDialog(props: DismissAllNotificationsDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      busy={props.loading}
      title={t("notifications.dismissAllTitle")}
      description={t("notifications.dismissAllDescription")}
      cancelLabel={t("notifications.cancel")}
      confirmLabel={t("notifications.confirm")}
      confirmColor="error"
      confirmIcon={<DismissIcon />}
    />
  );
}

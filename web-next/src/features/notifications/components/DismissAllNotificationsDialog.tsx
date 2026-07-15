import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
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
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: "none" } } }}
    >
      <DialogTitle>{t("notifications.dismissAllTitle")}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{t("notifications.dismissAllDescription")}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={props.onClose}>{t("notifications.cancel")}</Button>
        <Button color="error" variant="contained" disabled={props.loading} onClick={props.onConfirm}>
          {t("notifications.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

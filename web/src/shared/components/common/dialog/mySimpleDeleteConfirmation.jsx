/* eslint-disable react/prop-types */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const MySimpleDeleteConfirmation = ({
  open,
  onClose,
  deletedField,
  handleDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
    >
      <DialogTitle sx={{ py: 2 }}>
        <Typography variant="h6" component="span">
          {t("messages.confirmDeletion")}
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1">
          {t("messages.areYouSureDelete")}
          <Typography component="span" fontWeight="bold">
            {deletedField}
          </Typography>
          {isRTL ? " ؟ " : " ? "}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* Cancel Button */}
        <Button onClick={onClose} variant="outlined" sx={{ mr: 2 }} autoFocus>
          {t("actions.cancel")}
        </Button>

        {/* Confirm Delete Button */}
        <Button onClick={handleDelete} color="error" variant="contained">
          {t("actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MySimpleDeleteConfirmation;

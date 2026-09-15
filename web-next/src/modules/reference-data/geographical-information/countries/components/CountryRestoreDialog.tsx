import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Restore } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CountryListItem } from "../types/Country";

interface CountryRestoreDialogProps {
  country: CountryListItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CountryRestoreDialog = ({ country, loading, onClose, onConfirm }: CountryRestoreDialogProps) => {
  const { t } = useTranslation();
  return (
    <ConfirmationDialog
      open={country != null}
      title={t("countries.restoreTitle")}
      description={t("countries.restoreDescription")}
      confirmLabel={t("actions.restore")}
      cancelLabel={t("actions.cancel")}
      confirmColor="success"
      confirmIcon={<Restore />}
      icon={<Restore color="success" />}
      busy={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: "anywhere" }}>
        {country ? `${country.nameEn} (${country.nameAr})` : ""}
      </Typography>
    </ConfirmationDialog>
  );
};

export default CountryRestoreDialog;

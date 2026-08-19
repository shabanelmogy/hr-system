import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CountryListItem } from "../types/Country";

interface CountryArchiveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedCountry: CountryListItem | null;
  loading?: boolean;
}

const CountryArchiveDialog = ({
  open,
  onClose,
  onConfirm,
  selectedCountry,
  loading = false,
}: CountryArchiveDialogProps) => {
  const { t } = useTranslation();
  return (
    <ConfirmationDialog
      open={open}
      title={t("countries.archiveTitle")}
      description={t("countries.archiveDescription")}
      cancelLabel={t("actions.cancel")}
      confirmLabel={t("actions.archive")}
      confirmColor="warning"
      confirmIcon={<Archive />}
      icon={<Archive color="warning" />}
      busy={loading}
      onClose={onClose}
      onConfirm={() => void onConfirm()}
    >
      <Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: "anywhere" }}>
        {selectedCountry ? `${selectedCountry.nameEn} (${selectedCountry.nameAr})` : ""}
      </Typography>
    </ConfirmationDialog>
  );
};

export default CountryArchiveDialog;

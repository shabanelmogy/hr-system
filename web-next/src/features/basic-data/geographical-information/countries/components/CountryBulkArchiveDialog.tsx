import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CountryBulkArchiveDialogProps {
  open: boolean;
  selectedCount: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function CountryBulkArchiveDialog({
  open,
  selectedCount,
  loading = false,
  onClose,
  onConfirm,
}: CountryBulkArchiveDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      open={open}
      title={t("countries.bulkArchiveTitle")}
      description={t("countries.bulkArchiveDescription")}
      cancelLabel={t("actions.cancel")}
      confirmLabel={t("countries.bulkArchiveConfirm", { count: selectedCount })}
      confirmColor="warning"
      confirmIcon={<Archive />}
      icon={<Archive color="warning" />}
      busy={loading}
      onClose={onClose}
      onConfirm={() => void onConfirm()}
    >
      <Typography sx={{ mt: 2, fontWeight: 700 }}>
        {t("countries.selectedCount", { count: selectedCount })}
      </Typography>
    </ConfirmationDialog>
  );
}

import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props { open: boolean; selectedCount: number; loading: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; }
export default function DistrictBulkArchiveDialog({ open, selectedCount, loading, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  return <ConfirmationDialog open={open} title={t("districts.bulkArchiveTitle")} description={t("districts.bulkArchiveDescription")} cancelLabel={t("actions.cancel")} confirmLabel={t("districts.bulkArchiveConfirm", { count: selectedCount })} confirmColor="warning" confirmIcon={<Archive />} icon={<Archive color="warning" />} busy={loading} onClose={onClose} onConfirm={() => void onConfirm()}><Typography sx={{ mt: 2, fontWeight: 700 }}>{t("districts.selectedCount", { count: selectedCount })}</Typography></ConfirmationDialog>;
}

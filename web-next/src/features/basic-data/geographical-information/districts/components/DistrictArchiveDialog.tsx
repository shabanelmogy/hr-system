import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { DistrictListItem } from "../types/District";

interface Props { open: boolean; selectedDistrict: DistrictListItem | null; loading: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; }
export default function DistrictArchiveDialog({ open, selectedDistrict, loading, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  return <ConfirmationDialog open={open} title={t("districts.archiveTitle")} description={t("districts.archiveDescription")} cancelLabel={t("actions.cancel")} confirmLabel={t("actions.archive")} confirmColor="warning" confirmIcon={<Archive />} icon={<Archive color="warning" />} busy={loading} onClose={onClose} onConfirm={() => void onConfirm()}><Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: "anywhere" }}>{selectedDistrict ? `${selectedDistrict.nameEn} (${selectedDistrict.nameAr})` : ""}</Typography></ConfirmationDialog>;
}

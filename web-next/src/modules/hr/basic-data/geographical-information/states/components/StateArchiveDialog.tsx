import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { StateListItem } from "../types/State";

interface Props { open: boolean; selectedState: StateListItem | null; loading: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; }
export default function StateArchiveDialog({ open, selectedState, loading, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  return <ConfirmationDialog open={open} title={t("states.archiveTitle")} description={t("states.archiveDescription")} cancelLabel={t("actions.cancel")} confirmLabel={t("actions.archive")} confirmColor="warning" confirmIcon={<Archive />} icon={<Archive color="warning" />} busy={loading} onClose={onClose} onConfirm={() => void onConfirm()}><Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: "anywhere" }}>{selectedState ? `${selectedState.nameEn} (${selectedState.nameAr})` : ""}</Typography></ConfirmationDialog>;
}

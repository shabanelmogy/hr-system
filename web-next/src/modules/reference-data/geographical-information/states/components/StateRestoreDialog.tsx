import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Restore } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { StateListItem } from "../types/State";

interface Props { state: StateListItem | null; loading: boolean; onClose: () => void; onConfirm: () => void; }
export default function StateRestoreDialog({ state, loading, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  return <ConfirmationDialog open={state != null} title={t("states.restoreTitle")} description={t("states.restoreDescription")} confirmLabel={t("actions.restore")} cancelLabel={t("actions.cancel")} confirmColor="success" confirmIcon={<Restore />} icon={<Restore color="success" />} busy={loading} onClose={onClose} onConfirm={onConfirm}><Typography sx={{ mt: 2, fontWeight: 700, overflowWrap: "anywhere" }}>{state ? `${state.nameEn} (${state.nameAr})` : ""}</Typography></ConfirmationDialog>;
}

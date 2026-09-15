import { Archive } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/shared/components/dialogs";

interface RoleArchiveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedRole: { name: string } | null;
}

export default function RoleArchiveDialog({ open, onClose, onConfirm, selectedRole }: RoleArchiveDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("roles.archiveTitle", "Archive role?")}
      description={t("roles.archiveDescription", "The role will no longer be assignable and can be restored later.")}
      confirmLabel={t("actions.archive")}
      cancelLabel={t("actions.cancel")}
      confirmColor="warning"
      confirmIcon={<Archive />}
      icon={<Archive color="warning" />}
    >
      <Typography sx={{ mt: 2, fontWeight: 700 }}>{selectedRole?.name ?? ""}</Typography>
    </ConfirmationDialog>
  );
}

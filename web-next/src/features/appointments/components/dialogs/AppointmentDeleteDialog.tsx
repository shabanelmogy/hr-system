import { DeleteConfirmationDialog } from "@/shared/components/dialogs";

interface AppointmentDeleteDialogProps {
  open: boolean;
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function AppointmentDeleteDialog({
  open,
  title,
  loading,
  onClose,
  onConfirm,
}: AppointmentDeleteDialogProps) {
  return (
    <DeleteConfirmationDialog
      open={open}
      itemLabel={title}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import type { State } from "../types/State";

interface StateDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedState: State | null;
  loading?: boolean;
}

const StateDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedState,
  loading = false,
}: StateDeleteDialogProps) => {
  // Create the display name for the state being deleted
  const deletedField: string = selectedState
    ? `${selectedState.nameEn} (${
        selectedState.nameAr || selectedState.nameEn
      })`
    : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
      loading={loading}
    />
  );
};

export default StateDeleteDialog;

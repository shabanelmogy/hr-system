import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import type { State } from "../types/State";

interface StateDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
  const itemLabel = selectedState
    ? `${selectedState.nameEn} (${selectedState.nameAr || selectedState.nameEn})`
    : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      itemLabel={itemLabel}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
};

export default StateDeleteDialog;

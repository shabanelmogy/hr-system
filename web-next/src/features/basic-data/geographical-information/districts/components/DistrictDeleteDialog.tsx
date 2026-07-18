import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import type { District } from "../types/District";

interface DistrictDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedDistrict: District | null;
  loading?: boolean;
}

const DistrictDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedDistrict,
  loading = false,
}: DistrictDeleteDialogProps) => {
  const itemLabel = selectedDistrict
    ? `${selectedDistrict.nameEn} (${selectedDistrict.nameAr || selectedDistrict.nameEn})`
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

export default DistrictDeleteDialog;

import { DeleteConfirmationDialog } from "@/shared/components/dialogs";

interface AddressTypeModel {
  id: number;
  nameEn: string;
  nameAr?: string;
}

interface AddressTypeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedItem: AddressTypeModel | null;
  loading?: boolean;
}

const AddressTypeDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedItem,
  loading = false,
}: AddressTypeDeleteDialogProps) => {
  const itemLabel = selectedItem
    ? `${selectedItem.nameEn} (${selectedItem.nameAr || selectedItem.nameEn})`
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

export default AddressTypeDeleteDialog;

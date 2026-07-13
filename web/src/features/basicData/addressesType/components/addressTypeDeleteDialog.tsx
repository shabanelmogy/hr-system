import { MyDeleteConfirmation } from "@/shared/components";

interface AddressTypeModel {
  id: number;
  nameEn: string;
  nameAr?: string;
}

interface AddressTypeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  const deletedField: string = selectedItem
    ? `${selectedItem.nameEn} (${selectedItem.nameAr || selectedItem.nameEn})`
    : "";

  return (
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
      loading={loading}
    />
  );
};

export default AddressTypeDeleteDialog;

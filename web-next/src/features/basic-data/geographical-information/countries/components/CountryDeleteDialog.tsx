import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import { Country } from "../types/Country";

interface CountryDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCountry: Country | null;
  loading?: boolean;
}

const CountryDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedCountry,
  loading = false,
}: CountryDeleteDialogProps) => {
  const deletedField: string = selectedCountry
    ? `${selectedCountry.nameEn} (${selectedCountry.nameAr || selectedCountry.nameEn})`
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

export default CountryDeleteDialog;

import { MyDeleteConfirmation } from "@/shared/components";
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
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
      loading={loading}
    />
  );
};

export default CountryDeleteDialog;
